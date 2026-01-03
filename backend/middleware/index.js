const { authenticate, requireCreator, requireConsumer, optionalAuth, loadUser } = require('./auth');
const { upload, uploadMultiple, handleMulterError } = require('./upload');
const { errorHandler, notFound, requestLogger } = require('./errorHandler');

module.exports = {
    authenticate,
    requireCreator,
    requireConsumer,
    optionalAuth,
    loadUser,
    upload,
    uploadMultiple,
    handleMulterError,
    errorHandler,
    notFound,
    requestLogger
};
