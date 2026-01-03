const { Photo, User, Rating, Comment } = require('../models');
const { blobService, cognitiveService } = require('../services');

/**
 * Get all photos with pagination and filtering
 * GET /api/photos
 */
const getPhotos = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 20,
            sort = '-createdAt',
            creator,
            location,
            search
        } = req.query;

        const query = {};

        // Filter by creator
        if (creator) {
            query.creatorId = creator;
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [photos, total] = await Promise.all([
            Photo.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Photo.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: photos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single photo by ID
 * GET /api/photos/:id
 */
const getPhotoById = async (req, res, next) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Photo not found'
            });
        }

        // Increment view count
        photo.viewCount += 1;
        await photo.save();

        res.json({
            success: true,
            data: photo
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new photo (Creator only)
 * POST /api/photos
 */
const createPhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'No image file provided'
            });
        }

        const { title, caption, location, people } = req.body;
        const creatorId = req.user.oid;

        // Upload image to Azure Blob Storage
        const uploadResult = await blobService.uploadImage(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype,
            creatorId
        );

        // Analyze image with Cognitive Services (async, don't wait)
        let aiAnalysis = { tags: [], description: '', dominantColors: [], isAdultContent: false };
        try {
            aiAnalysis = await cognitiveService.analyzeImage(uploadResult.blobUrl);
        } catch (err) {
            console.error('Image analysis failed:', err.message);
        }

        // Parse people array from comma-separated string or JSON
        let peopleArray = [];
        if (people) {
            try {
                peopleArray = typeof people === 'string' ? 
                    (people.startsWith('[') ? JSON.parse(people) : people.split(',').map(p => p.trim())) :
                    people;
            } catch (e) {
                peopleArray = [];
            }
        }

        // Create photo document
        const photo = await Photo.create({
            creatorId,
            title,
            caption: caption || '',
            location: location || '',
            people: peopleArray,
            blobUrl: uploadResult.blobUrl,
            blobName: uploadResult.blobName,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            aiTags: aiAnalysis.tags,
            aiDescription: aiAnalysis.description,
            dominantColors: aiAnalysis.dominantColors,
            isAdultContent: aiAnalysis.isAdultContent
        });

        // Update creator's photo count
        await User.findOneAndUpdate(
            { odId: creatorId },
            { $inc: { photoCount: 1 } }
        );

        res.status(201).json({
            success: true,
            message: 'Photo uploaded successfully',
            data: photo
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a photo (Creator only - own photos)
 * PUT /api/photos/:id
 */
const updatePhoto = async (req, res, next) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Photo not found'
            });
        }

        // Check ownership
        if (photo.creatorId !== req.user.oid) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only update your own photos'
            });
        }

        const { title, caption, location, people } = req.body;

        // Update allowed fields
        if (title) photo.title = title;
        if (caption !== undefined) photo.caption = caption;
        if (location !== undefined) photo.location = location;
        if (people !== undefined) {
            photo.people = typeof people === 'string' ?
                (people.startsWith('[') ? JSON.parse(people) : people.split(',').map(p => p.trim())) :
                people;
        }

        await photo.save();

        res.json({
            success: true,
            message: 'Photo updated successfully',
            data: photo
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a photo (Creator only - own photos)
 * DELETE /api/photos/:id
 */
const deletePhoto = async (req, res, next) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Photo not found'
            });
        }

        // Check ownership
        if (photo.creatorId !== req.user.oid) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only delete your own photos'
            });
        }

        // Delete from Azure Blob Storage
        try {
            await blobService.deleteImage(photo.blobName);
        } catch (err) {
            console.error('Failed to delete blob:', err.message);
        }

        // Delete associated comments and ratings
        await Promise.all([
            Comment.deleteMany({ photoId: photo._id }),
            Rating.deleteMany({ photoId: photo._id })
        ]);

        // Delete photo document
        await photo.deleteOne();

        // Update creator's photo count
        await User.findOneAndUpdate(
            { odId: photo.creatorId },
            { $inc: { photoCount: -1 } }
        );

        res.json({
            success: true,
            message: 'Photo deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Search photos
 * GET /api/photos/search
 */
const searchPhotos = async (req, res, next) => {
    try {
        const { q, tags, location, people, page = 1, limit = 20 } = req.query;

        const query = {};

        // Text search
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { caption: { $regex: q, $options: 'i' } },
                { aiDescription: { $regex: q, $options: 'i' } }
            ];
        }

        // Filter by AI tags
        if (tags) {
            const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
            query.aiTags = { $in: tagArray };
        }

        // Filter by location
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Filter by people
        if (people) {
            const peopleArray = people.split(',').map(p => p.trim());
            query.people = { $in: peopleArray };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [photos, total] = await Promise.all([
            Photo.find(query)
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Photo.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: photos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get photos by creator
 * GET /api/photos/creator/:creatorId
 */
const getPhotosByCreator = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [photos, total] = await Promise.all([
            Photo.find({ creatorId: req.params.creatorId })
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Photo.countDocuments({ creatorId: req.params.creatorId })
        ]);

        res.json({
            success: true,
            data: photos,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get trending photos (most viewed/rated)
 * GET /api/photos/trending
 */
const getTrendingPhotos = async (req, res, next) => {
    try {
        const { period = 'week', limit = 10 } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;
        switch (period) {
            case 'day':
                startDate = new Date(now.setDate(now.getDate() - 1));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }

        const photos = await Photo.find({ createdAt: { $gte: startDate } })
            .sort('-viewCount -averageRating')
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: photos
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPhotos,
    getPhotoById,
    createPhoto,
    updatePhoto,
    deletePhoto,
    searchPhotos,
    getPhotosByCreator,
    getTrendingPhotos
};
