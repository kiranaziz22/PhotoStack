const express = require('express');
const router = express.Router();
const {
    getRatings,
    addOrUpdateRating,
    getUserRating,
    deleteRating
} = require('../controller/ratingController');
const { authenticate, optionalAuth } = require('../middleware');

// Get ratings for a photo (public)
router.get('/photos/:photoId/ratings', optionalAuth, getRatings);

// Get current user's rating for a photo
router.get('/photos/:photoId/ratings/me', authenticate, getUserRating);

// Add or update rating (authenticated users)
router.post('/photos/:photoId/ratings', authenticate, addOrUpdateRating);

// Delete rating
router.delete('/photos/:photoId/ratings', authenticate, deleteRating);

module.exports = router;
