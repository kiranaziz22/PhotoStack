// Mock routes for development without MongoDB
const express = require('express');
const router = express.Router();
const { mockUsers, mockPhotos, mockComments, mockRatings } = require('./mockData');

// Deep clone helper
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// ============ PHOTOS ============

// Get all photos
router.get('/photos', (req, res) => {
    const { page = 1, limit = 12, tag, search } = req.query;
    let photos = clone(mockPhotos);
    
    if (tag) {
        photos = photos.filter(p => p.tags.includes(tag.toLowerCase()));
    }
    if (search) {
        const q = search.toLowerCase();
        photos = photos.filter(p => 
            p.title.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some(t => t.includes(q))
        );
    }
    
    const total = photos.length;
    const start = (page - 1) * limit;
    const paginated = photos.slice(start, start + parseInt(limit));
    
    res.json({
        data: paginated,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Get trending photos
router.get('/photos/trending', (req, res) => {
    const trending = clone(mockPhotos)
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 6);
    res.json({ data: trending });
});

// Search photos
router.get('/photos/search', (req, res) => {
    const { q, tags } = req.query;
    let photos = clone(mockPhotos);
    
    if (q) {
        const query = q.toLowerCase();
        photos = photos.filter(p => 
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.tags.some(t => t.includes(query)) ||
            p.aiTags.some(t => t.includes(query))
        );
    }
    
    if (tags) {
        const tagList = tags.split(',').map(t => t.trim().toLowerCase());
        photos = photos.filter(p => 
            tagList.some(tag => p.tags.includes(tag))
        );
    }
    
    res.json({ data: photos, total: photos.length });
});

// Get photo by ID
router.get('/photos/:id', (req, res) => {
    const photo = mockPhotos.find(p => p._id === req.params.id);
    if (!photo) {
        return res.status(404).json({ message: 'Photo not found' });
    }
    res.json(clone(photo));
});

// Get photos by creator
router.get('/photos/creator/:creatorId', (req, res) => {
    const photos = mockPhotos.filter(p => p.creatorId === req.params.creatorId);
    res.json({ data: clone(photos), total: photos.length });
});

// Upload photo (mock)
router.post('/photos', (req, res) => {
    const newPhoto = {
        _id: `photo-${Date.now()}`,
        title: req.body.title || 'Untitled',
        description: req.body.description || '',
        blobUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400',
        creator: mockUsers[0],
        creatorId: 'user-1',
        tags: req.body.tags || [],
        aiTags: ['photo', 'image'],
        aiCaption: 'An uploaded photo',
        viewCount: 0,
        ratingAvg: 0,
        ratingCount: 0,
        commentCount: 0,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    mockPhotos.unshift(newPhoto);
    res.status(201).json(newPhoto);
});

// ============ USERS ============

// Get current user
router.get('/users/me', (req, res) => {
    // Return mock creator user
    res.json(clone(mockUsers[0]));
});

// Update current user
router.put('/users/me', (req, res) => {
    const user = clone(mockUsers[0]);
    if (req.body.name) user.name = req.body.name;
    if (req.body.bio) user.bio = req.body.bio;
    res.json(user);
});

// Get user stats
router.get('/users/me/stats', (req, res) => {
    const userPhotos = mockPhotos.filter(p => p.creatorId === 'user-1');
    res.json({
        totalPhotos: userPhotos.length,
        totalViews: userPhotos.reduce((sum, p) => sum + p.viewCount, 0),
        totalRatings: userPhotos.reduce((sum, p) => sum + p.ratingCount, 0),
        avgRating: userPhotos.length > 0 
            ? (userPhotos.reduce((sum, p) => sum + p.ratingAvg, 0) / userPhotos.length).toFixed(2)
            : 0
    });
});

// Get creators
router.get('/users/creators', (req, res) => {
    const creators = mockUsers.filter(u => u.role === 'creator');
    res.json({ data: clone(creators) });
});

// Get user by ID
router.get('/users/:id', (req, res) => {
    const user = mockUsers.find(u => u._id === req.params.id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(clone(user));
});

// Register user (mock)
router.post('/users/register', (req, res) => {
    const newUser = {
        _id: `user-${Date.now()}`,
        email: req.body.email,
        name: req.body.name || 'New User',
        role: req.body.role || 'consumer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: '',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    mockUsers.push(newUser);
    res.status(201).json(newUser);
});

// ============ COMMENTS ============

// Get comments for photo
router.get('/photos/:photoId/comments', (req, res) => {
    const comments = mockComments.filter(c => c.photoId === req.params.photoId);
    res.json({ data: clone(comments), total: comments.length });
});

// Add comment
router.post('/photos/:photoId/comments', (req, res) => {
    const newComment = {
        _id: `comment-${Date.now()}`,
        photoId: req.params.photoId,
        userId: 'user-2',
        user: clone(mockUsers[1]),
        content: req.body.content,
        sentiment: 'neutral',
        sentimentScore: 0.5,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    mockComments.push(newComment);
    
    // Update photo comment count
    const photo = mockPhotos.find(p => p._id === req.params.photoId);
    if (photo) photo.commentCount++;
    
    res.status(201).json(newComment);
});

// ============ RATINGS ============

// Get ratings for photo
router.get('/photos/:photoId/ratings', (req, res) => {
    const photo = mockPhotos.find(p => p._id === req.params.photoId);
    res.json({
        average: photo?.ratingAvg || 0,
        count: photo?.ratingCount || 0
    });
});

// Get my rating
router.get('/photos/:photoId/ratings/me', (req, res) => {
    const rating = mockRatings.find(r => r.photoId === req.params.photoId && r.userId === 'user-2');
    if (!rating) {
        return res.status(404).json({ message: 'Rating not found' });
    }
    res.json(rating);
});

// Add rating
router.post('/photos/:photoId/ratings', (req, res) => {
    const newRating = {
        _id: `rating-${Date.now()}`,
        photoId: req.params.photoId,
        userId: 'user-2',
        value: req.body.value
    };
    mockRatings.push(newRating);
    res.status(201).json(newRating);
});

module.exports = router;
