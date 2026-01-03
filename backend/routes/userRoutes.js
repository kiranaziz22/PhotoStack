const express = require('express');
const router = express.Router();
const {
    getCurrentUser,
    updateCurrentUser,
    getUserById,
    getUserByOid,
    getCreators,
    updateUserRole,
    registerUser,
    getUserStats
} = require('../controller/userController');
const { authenticate } = require('../middleware');

// Protected routes - MUST come before /:id routes
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateCurrentUser);
router.get('/me/stats', authenticate, getUserStats);
router.post('/register', authenticate, registerUser);

// Public routes
router.get('/creators', getCreators);
router.get('/oid/:oid', getUserByOid);

// Parameterized routes - MUST come last
router.get('/:id', getUserById);

// Admin routes
router.put('/:id/role', authenticate, updateUserRole);

module.exports = router;
