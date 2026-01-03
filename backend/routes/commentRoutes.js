const express = require('express');
const router = express.Router();
const {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByUser
} = require('../controller/commentController');
const { authenticate, optionalAuth } = require('../middleware');

// Get comments for a photo (public)
router.get('/photos/:photoId/comments', optionalAuth, getComments);

// Add comment to photo (authenticated users)
router.post('/photos/:photoId/comments', authenticate, addComment);

// Update comment (own comments only)
router.put('/comments/:id', authenticate, updateComment);

// Delete comment (own comments only)
router.delete('/comments/:id', authenticate, deleteComment);

// Get comments by user
router.get('/users/:userId/comments', optionalAuth, getCommentsByUser);

module.exports = router;
