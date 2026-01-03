const photoController = require('./photoController');
const userController = require('./userController');
const commentController = require('./commentController');
const ratingController = require('./ratingController');

module.exports = {
    ...photoController,
    ...userController,
    ...commentController,
    ...ratingController
};
