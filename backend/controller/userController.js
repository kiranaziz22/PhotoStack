const { User, Photo, Comment, Rating } = require('../models');

/**
 * Get current user profile
 * GET /api/users/me
 */
const getCurrentUser = async (req, res, next) => {
    try {
        // Try to find by odId first, then by email
        let user = await User.findOne({ odId: req.user.oid });
        
        if (!user && req.user.email) {
            user = await User.findOne({ email: req.user.email });
            // Update odId if found by email
            if (user) {
                user.odId = req.user.oid;
                await user.save();
            }
        }

        // Auto-create user if doesn't exist
        if (!user) {
            user = await User.create({
                odId: req.user.oid,
                email: req.user.email,
                displayName: req.user.name || 'User',
                role: req.user.role || 'consumer'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        // Handle duplicate key error
        if (error.code === 11000) {
            // Find existing user
            const existingUser = await User.findOne({ email: req.user.email });
            if (existingUser) {
                return res.json({
                    success: true,
                    data: existingUser
                });
            }
        }
        next(error);
    }
};

/**
 * Update current user profile
 * PUT /api/users/me
 */
const updateCurrentUser = async (req, res, next) => {
    try {
        const { displayName, bio, avatar } = req.body;

        const user = await User.findOne({ odId: req.user.oid });

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        // Update allowed fields
        if (displayName) user.displayName = displayName;
        if (bio !== undefined) user.bio = bio;
        if (avatar) user.avatar = avatar;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by ID
 * GET /api/users/:id
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-odId -email');

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by OID (Azure AD Object ID)
 * GET /api/users/oid/:oid
 */
const getUserByOid = async (req, res, next) => {
    try {
        const user = await User.findOne({ odId: req.params.oid }).select('-email');

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all creators (for browsing)
 * GET /api/users/creators
 */
const getCreators = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, sort = '-photoCount' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [creators, total] = await Promise.all([
            User.find({ role: 'creator', isActive: true })
                .select('-odId -email')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            User.countDocuments({ role: 'creator', isActive: true })
        ]);

        res.json({
            success: true,
            data: creators,
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
 * Update user role (Admin function - for seeding creators)
 * This should be protected in production
 * PUT /api/users/:id/role
 */
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['creator', 'consumer'].includes(role)) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid role. Must be "creator" or "consumer"'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        user.role = role;
        await user.save();

        res.json({
            success: true,
            message: `User role updated to ${role}`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Register user (create account on first login)
 * POST /api/users/register
 */
const registerUser = async (req, res, next) => {
    try {
        // Check if user already exists
        let user = await User.findOne({ odId: req.user.oid });

        if (user) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User already registered'
            });
        }

        const { displayName, bio } = req.body;

        user = await User.create({
            odId: req.user.oid,
            email: req.user.email,
            displayName: displayName || req.user.name || 'User',
            role: req.user.role || 'consumer',
            bio: bio || ''
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user statistics
 * GET /api/users/me/stats
 */
const getUserStats = async (req, res, next) => {
    try {
        const user = await User.findOne({ odId: req.user.oid });

        if (!user) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'User not found'
            });
        }

        // Calculate real stats from database
        const photos = await Photo.find({ creatorId: req.user.oid }).lean();
        const photoCount = photos.length;
        const totalViews = photos.reduce((sum, p) => sum + (p.viewCount || 0), 0);
        const totalRatings = photos.reduce((sum, p) => sum + (p.ratingCount || 0), 0);
        
        // Count comments made by this user
        const commentCount = await Comment.countDocuments({ userId: req.user.oid });
        
        // Count ratings made by this user
        const ratingCount = await Rating.countDocuments({ userId: req.user.oid });

        const stats = {
            role: user.role,
            photoCount,
            totalViews,
            totalRatings,  // ratings received on user's photos
            commentCount,  // comments made by user
            ratingCount,   // ratings made by user
            memberSince: user.createdAt,
            lastLogin: user.lastLoginAt
        };

        // Update cached values in user document
        await User.updateOne(
            { odId: req.user.oid },
            { $set: { photoCount, totalViews, commentCount, ratingCount } }
        );

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getCurrentUser,
    updateCurrentUser,
    getUserById,
    getUserByOid,
    getCreators,
    updateUserRole,
    registerUser,
    getUserStats
};
