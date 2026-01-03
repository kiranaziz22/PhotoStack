const multer = require('multer');
const config = require('../config');

// Configure multer for memory storage (for Azure Blob upload)
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
    if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`), false);
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
        files: 1 // Single file upload
    }
});

// Multiple files upload (up to 10)
const uploadMultiple = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: config.upload.maxFileSize,
        files: 10
    }
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Bad Request',
                message: `File too large. Maximum size is ${config.upload.maxFileSize / (1024 * 1024)}MB`
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Too many files uploaded'
            });
        }
        return res.status(400).json({
            error: 'Bad Request',
            message: err.message
        });
    }
    
    if (err) {
        return res.status(400).json({
            error: 'Bad Request',
            message: err.message
        });
    }
    
    next();
};

module.exports = {
    upload,
    uploadMultiple,
    handleMulterError
};
