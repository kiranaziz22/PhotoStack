const { Rating, Photo, User } = require('../models');

/**
 * Get ratings for a photo
 * GET /api/photos/:photoId/ratings
 */
const getRatings = async (req, res, next) => {
    try {
        const ratings = await Rating.find({ photoId: req.params.photoId }).lean();

        // Calculate stats
        const total = ratings.length;
        const sum = ratings.reduce((acc, r) => acc + r.value, 0);
        const average = total > 0 ? (sum / total).toFixed(2) : 0;

        // Distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach(r => {
            distribution[r.value]++;
        });

        res.json({
            success: true,
            data: {
                average: parseFloat(average),
                total,
                distribution
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add or update rating for a photo (Consumer/Creator)
 * POST /api/photos/:photoId/ratings
 */
const addOrUpdateRating = async (req, res, next) => {
    try {
        const { value } = req.body;
        const numValue = parseInt(value);

        if (!numValue || numValue < 1 || numValue > 5) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Rating must be between 1 and 5'
            });
        }

        // Verify photo exists
        const photo = await Photo.findById(req.params.photoId);
        if (!photo) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Photo not found'
            });
        }

        // Check if user already rated
        let rating = await Rating.findOne({
            photoId: req.params.photoId,
            userId: req.user.oid
        });

        let isNew = false;
        if (rating) {
            // Update existing rating
            rating.value = numValue;
            await rating.save();
        } else {
            // Create new rating
            rating = await Rating.create({
                photoId: req.params.photoId,
                userId: req.user.oid,
                value: numValue
            });
            isNew = true;

            // Update user rating count
            await User.findOneAndUpdate(
                { odId: req.user.oid },
                { $inc: { ratingCount: 1 } }
            );
        }

        // Recalculate photo average rating
        const allRatings = await Rating.find({ photoId: req.params.photoId });
        const sum = allRatings.reduce((acc, r) => acc + r.value, 0);
        const average = allRatings.length > 0 ? sum / allRatings.length : 0;

        await Photo.findByIdAndUpdate(req.params.photoId, {
            averageRating: average,
            ratingCount: allRatings.length
        });

        res.status(isNew ? 201 : 200).json({
            success: true,
            message: isNew ? 'Rating added successfully' : 'Rating updated successfully',
            data: {
                rating: rating,
                photoStats: {
                    averageRating: average.toFixed(2),
                    ratingCount: allRatings.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's rating for a photo
 * GET /api/photos/:photoId/ratings/me
 */
const getUserRating = async (req, res, next) => {
    try {
        const rating = await Rating.findOne({
            photoId: req.params.photoId,
            userId: req.user.oid
        });

        res.json({
            success: true,
            data: rating ? { value: rating.value } : null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete user's rating for a photo
 * DELETE /api/photos/:photoId/ratings
 */
const deleteRating = async (req, res, next) => {
    try {
        const rating = await Rating.findOne({
            photoId: req.params.photoId,
            userId: req.user.oid
        });

        if (!rating) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Rating not found'
            });
        }

        await rating.deleteOne();

        // Recalculate photo average rating
        const allRatings = await Rating.find({ photoId: req.params.photoId });
        const sum = allRatings.reduce((acc, r) => acc + r.value, 0);
        const average = allRatings.length > 0 ? sum / allRatings.length : 0;

        await Photo.findByIdAndUpdate(req.params.photoId, {
            averageRating: average,
            ratingCount: allRatings.length
        });

        // Update user rating count
        await User.findOneAndUpdate(
            { odId: req.user.oid },
            { $inc: { ratingCount: -1 } }
        );

        res.json({
            success: true,
            message: 'Rating removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRatings,
    addOrUpdateRating,
    getUserRating,
    deleteRating
};
