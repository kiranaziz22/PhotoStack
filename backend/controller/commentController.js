const { Comment, Photo, User } = require('../models');
const { textAnalyticsService } = require('../services');

/**
 * Get comments for a photo
 * GET /api/photos/:photoId/comments
 */
const getComments = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [comments, total] = await Promise.all([
            Comment.find({ photoId: req.params.photoId, isDeleted: false })
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Comment.countDocuments({ photoId: req.params.photoId, isDeleted: false })
        ]);

        res.json({
            success: true,
            data: comments,
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
 * Add a comment to a photo (Consumer/Creator)
 * POST /api/photos/:photoId/comments
 */
const addComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Comment content is required'
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

        // Get user display name
        let displayName = req.user.name || 'Anonymous';
        const user = await User.findOne({ odId: req.user.oid });
        if (user) {
            displayName = user.displayName;
        }

        // Analyze sentiment (async, don't block)
        let sentimentResult = { sentiment: 'unknown', score: 0 };
        try {
            sentimentResult = await textAnalyticsService.analyzeSentiment(content);
        } catch (err) {
            console.error('Sentiment analysis failed:', err.message);
        }

        // Create comment
        const comment = await Comment.create({
            photoId: req.params.photoId,
            userId: req.user.oid,
            userDisplayName: displayName,
            content: content.trim(),
            sentiment: sentimentResult.sentiment,
            sentimentScore: sentimentResult.score
        });

        // Update photo comment count
        await Photo.findByIdAndUpdate(req.params.photoId, {
            $inc: { commentCount: 1 }
        });

        // Update user comment count
        await User.findOneAndUpdate(
            { odId: req.user.oid },
            { $inc: { commentCount: 1 } }
        );

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a comment (own comments only)
 * PUT /api/comments/:id
 */
const updateComment = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Comment content is required'
            });
        }

        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.userId !== req.user.oid) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only edit your own comments'
            });
        }

        // Re-analyze sentiment
        let sentimentResult = { sentiment: 'unknown', score: 0 };
        try {
            sentimentResult = await textAnalyticsService.analyzeSentiment(content);
        } catch (err) {
            console.error('Sentiment analysis failed:', err.message);
        }

        comment.content = content.trim();
        comment.sentiment = sentimentResult.sentiment;
        comment.sentimentScore = sentimentResult.score;
        comment.isEdited = true;

        await comment.save();

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: comment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a comment (soft delete, own comments only)
 * DELETE /api/comments/:id
 */
const deleteComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Comment not found'
            });
        }

        // Check ownership
        if (comment.userId !== req.user.oid) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only delete your own comments'
            });
        }

        // Soft delete
        comment.isDeleted = true;
        await comment.save();

        // Update photo comment count
        await Photo.findByIdAndUpdate(comment.photoId, {
            $inc: { commentCount: -1 }
        });

        // Update user comment count
        await User.findOneAndUpdate(
            { odId: req.user.oid },
            { $inc: { commentCount: -1 } }
        );

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get comments by user
 * GET /api/users/:userId/comments
 */
const getCommentsByUser = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [comments, total] = await Promise.all([
            Comment.find({ userId: req.params.userId, isDeleted: false })
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit))
                .populate('photoId', 'title blobUrl')
                .lean(),
            Comment.countDocuments({ userId: req.params.userId, isDeleted: false })
        ]);

        res.json({
            success: true,
            data: comments,
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

module.exports = {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByUser
};
