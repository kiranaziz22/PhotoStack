const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    photoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Photo', 
        required: true, 
        index: true 
    },
    userId: { type: String, required: true, index: true },
    userDisplayName: { type: String, required: true },
    content: { type: String, required: true, maxlength: 1000 },
    // Sentiment analysis from Cognitive Services
    sentiment: { 
        type: String, 
        enum: ['positive', 'neutral', 'negative', 'unknown'],
        default: 'unknown'
    },
    sentimentScore: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Compound index for fetching comments on a photo
commentSchema.index({ photoId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
