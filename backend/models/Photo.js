const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    creatorId: { type: String, required: true, index: true },
    title: { type: String, required: true, index: 'text' },
    caption: { type: String, default: '' },
    location: { type: String, default: '', index: true },
    people: { type: [String], default: [], index: true },
    blobUrl: { type: String, required: true },
    blobName: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    // Cognitive Services metadata
    aiTags: { type: [String], default: [] },
    aiDescription: { type: String, default: '' },
    dominantColors: { type: [String], default: [] },
    isAdultContent: { type: Boolean, default: false },
    // Engagement metrics
    viewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
photoSchema.index({ title: 'text', caption: 'text', location: 'text' });
photoSchema.index({ createdAt: -1 });
photoSchema.index({ averageRating: -1, createdAt: -1 });

module.exports = mongoose.model('Photo', photoSchema);

