// Mock data for development without MongoDB

const mockUsers = [
    {
        _id: 'user-1',
        azureId: 'azure-user-1',
        email: 'creator@photostack.com',
        name: 'Alex Creator',
        role: 'creator',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        bio: 'Professional photographer sharing my work',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
    },
    {
        _id: 'user-2',
        azureId: 'azure-user-2',
        email: 'consumer@photostack.com',
        name: 'Sam Viewer',
        role: 'consumer',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        bio: 'Photography enthusiast',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
    }
];

const mockPhotos = [
    {
        _id: 'photo-1',
        title: 'Mountain Sunrise',
        description: 'A breathtaking sunrise over the Rocky Mountains',
        blobUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        creator: mockUsers[0],
        creatorId: 'user-1',
        tags: ['nature', 'mountains', 'sunrise', 'landscape'],
        aiTags: ['mountain', 'sky', 'cloud', 'nature'],
        aiCaption: 'A mountain range with sun rising over peaks',
        aiObjects: ['mountain', 'sky', 'cloud'],
        dominantColors: ['#FF6B35', '#2E4057', '#048A81'],
        viewCount: 1250,
        ratingAvg: 4.7,
        ratingCount: 89,
        commentCount: 23,
        isPublic: true,
        createdAt: new Date('2025-06-15'),
        updatedAt: new Date('2025-06-15')
    },
    {
        _id: 'photo-2',
        title: 'City Lights',
        description: 'New York City skyline at night',
        blobUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
        creator: mockUsers[0],
        creatorId: 'user-1',
        tags: ['city', 'night', 'urban', 'skyline'],
        aiTags: ['city', 'building', 'night', 'lights'],
        aiCaption: 'City skyline illuminated at night',
        aiObjects: ['building', 'skyscraper', 'light'],
        dominantColors: ['#1A1A2E', '#16213E', '#E94560'],
        viewCount: 2340,
        ratingAvg: 4.9,
        ratingCount: 156,
        commentCount: 45,
        isPublic: true,
        createdAt: new Date('2025-07-20'),
        updatedAt: new Date('2025-07-20')
    },
    {
        _id: 'photo-3',
        title: 'Ocean Waves',
        description: 'Powerful waves crashing on the shore',
        blobUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400',
        creator: mockUsers[0],
        creatorId: 'user-1',
        tags: ['ocean', 'waves', 'beach', 'nature'],
        aiTags: ['ocean', 'wave', 'water', 'beach'],
        aiCaption: 'Ocean waves breaking on a sandy beach',
        aiObjects: ['water', 'wave', 'sand'],
        dominantColors: ['#1E88E5', '#90CAF9', '#FFF9C4'],
        viewCount: 890,
        ratingAvg: 4.5,
        ratingCount: 67,
        commentCount: 12,
        isPublic: true,
        createdAt: new Date('2025-08-10'),
        updatedAt: new Date('2025-08-10')
    },
    {
        _id: 'photo-4',
        title: 'Forest Path',
        description: 'A peaceful trail through ancient redwoods',
        blobUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
        creator: mockUsers[0],
        creatorId: 'user-1',
        tags: ['forest', 'trees', 'path', 'nature'],
        aiTags: ['forest', 'tree', 'path', 'green'],
        aiCaption: 'Sunlight filtering through tall forest trees',
        aiObjects: ['tree', 'path', 'sunlight'],
        dominantColors: ['#2D5016', '#8BC34A', '#FFC107'],
        viewCount: 567,
        ratingAvg: 4.3,
        ratingCount: 34,
        commentCount: 8,
        isPublic: true,
        createdAt: new Date('2025-09-05'),
        updatedAt: new Date('2025-09-05')
    },
    {
        _id: 'photo-5',
        title: 'Desert Dunes',
        description: 'Golden sand dunes at sunset',
        blobUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400',
        creator: mockUsers[0],
        creatorId: 'user-1',
        tags: ['desert', 'sand', 'sunset', 'landscape'],
        aiTags: ['desert', 'sand', 'dune', 'sunset'],
        aiCaption: 'Sand dunes stretching to the horizon at sunset',
        aiObjects: ['sand', 'dune', 'sky'],
        dominantColors: ['#FF9800', '#FFE0B2', '#5D4037'],
        viewCount: 423,
        ratingAvg: 4.6,
        ratingCount: 28,
        commentCount: 5,
        isPublic: true,
        createdAt: new Date('2025-10-01'),
        updatedAt: new Date('2025-10-01')
    },
    {
        _id: 'photo-6',
        title: 'Northern Lights',
        description: 'Aurora borealis dancing in the Arctic sky',
        blobUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
        creator: mockUsers[0],
        creatorId: 'user-1',
        tags: ['aurora', 'night', 'arctic', 'sky'],
        aiTags: ['aurora', 'night', 'sky', 'stars'],
        aiCaption: 'Green aurora borealis illuminating the night sky',
        aiObjects: ['aurora', 'sky', 'star'],
        dominantColors: ['#00E676', '#1B5E20', '#0D47A1'],
        viewCount: 3100,
        ratingAvg: 4.95,
        ratingCount: 245,
        commentCount: 78,
        isPublic: true,
        createdAt: new Date('2025-11-15'),
        updatedAt: new Date('2025-11-15')
    }
];

const mockComments = [
    {
        _id: 'comment-1',
        photoId: 'photo-1',
        userId: 'user-2',
        user: mockUsers[1],
        content: 'Absolutely stunning capture! The colors are incredible.',
        sentiment: 'positive',
        sentimentScore: 0.95,
        createdAt: new Date('2025-06-16'),
        updatedAt: new Date('2025-06-16')
    },
    {
        _id: 'comment-2',
        photoId: 'photo-1',
        userId: 'user-2',
        user: mockUsers[1],
        content: 'This makes me want to visit the mountains!',
        sentiment: 'positive',
        sentimentScore: 0.85,
        createdAt: new Date('2025-06-17'),
        updatedAt: new Date('2025-06-17')
    },
    {
        _id: 'comment-3',
        photoId: 'photo-2',
        userId: 'user-2',
        user: mockUsers[1],
        content: 'NYC never looked so good!',
        sentiment: 'positive',
        sentimentScore: 0.90,
        createdAt: new Date('2025-07-21'),
        updatedAt: new Date('2025-07-21')
    }
];

const mockRatings = [
    { _id: 'rating-1', photoId: 'photo-1', userId: 'user-2', value: 5 },
    { _id: 'rating-2', photoId: 'photo-2', userId: 'user-2', value: 5 },
    { _id: 'rating-3', photoId: 'photo-3', userId: 'user-2', value: 4 }
];

module.exports = {
    mockUsers,
    mockPhotos,
    mockComments,
    mockRatings
};
