const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    odId: { type: String, required: true, unique: true, index: true }, // Azure AD B2C Object ID
    email: { type: String, required: true, unique: true, index: true },
    displayName: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['creator', 'consumer'], 
        default: 'consumer',
        index: true 
    },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    // Creator-specific fields
    photoCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    // Consumer-specific fields
    commentCount: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    // Account status
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Method to check if user is a creator
userSchema.methods.isCreator = function() {
    return this.role === 'creator';
};

// Method to check if user is a consumer
userSchema.methods.isConsumer = function() {
    return this.role === 'consumer';
};

module.exports = mongoose.model('User', userSchema);
