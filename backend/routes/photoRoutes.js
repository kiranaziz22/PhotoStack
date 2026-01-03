const express = require('express');
const router = express.Router();
const {
    getPhotos,
    getPhotoById,
    createPhoto,
    updatePhoto,
    deletePhoto,
    searchPhotos,
    getPhotosByCreator,
    getTrendingPhotos
} = require('../controller/photoController');
const {
    authenticate,
    requireCreator,
    optionalAuth,
    upload,
    handleMulterError
} = require('../middleware');

// Public routes (no auth required)
router.get('/search', searchPhotos);
router.get('/trending', getTrendingPhotos);
router.get('/creator/:creatorId', getPhotosByCreator);

// Public routes with optional auth (for personalized experience)
router.get('/', optionalAuth, getPhotos);
router.get('/:id', optionalAuth, getPhotoById);

// Protected routes - Creator only
router.post('/', 
    authenticate, 
    requireCreator, 
    upload.single('image'),
    handleMulterError,
    createPhoto
);

router.put('/:id', 
    authenticate, 
    requireCreator, 
    updatePhoto
);

router.delete('/:id', 
    authenticate, 
    requireCreator, 
    deletePhoto
);

module.exports = router;
