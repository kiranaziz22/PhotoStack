const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    photoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Photo', 
        required: true, 
        index: true 
    },
    userId: { type: String, required: true, index: true },
    value: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    }
}, {
    timestamps: true
});

// Ensure one rating per user per photo
ratingSchema.index({ photoId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
