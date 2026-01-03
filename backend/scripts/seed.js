/**
 * Seed script to create test data for development
 * Run with: node scripts/seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, Photo } = require('../models');
const config = require('../config');

const seedUsers = [
    {
        odId: 'creator-001',
        email: 'creator1@example.com',
        displayName: 'John Creator',
        role: 'creator',
        bio: 'Professional photographer sharing my work'
    },
    {
        odId: 'creator-002',
        email: 'creator2@example.com',
        displayName: 'Jane Artist',
        role: 'creator',
        bio: 'Nature and landscape photography'
    },
    {
        odId: 'consumer-001',
        email: 'consumer1@example.com',
        displayName: 'Bob Viewer',
        role: 'consumer',
        bio: 'Photography enthusiast'
    },
    {
        odId: 'consumer-002',
        email: 'consumer2@example.com',
        displayName: 'Alice Fan',
        role: 'consumer',
        bio: 'Love discovering new photographers'
    }
];

const seedPhotos = [
    {
        creatorId: 'creator-001',
        title: 'Sunset at the Beach',
        caption: 'Beautiful sunset captured at Malibu beach',
        location: 'Malibu, CA',
        people: ['nature'],
        blobUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        blobName: 'creator-001/sample1.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024000,
        aiTags: ['sunset', 'beach', 'ocean', 'sky', 'nature'],
        aiDescription: 'A beautiful sunset over the ocean',
        dominantColors: ['orange', 'blue', 'purple']
    },
    {
        creatorId: 'creator-001',
        title: 'Mountain Peak',
        caption: 'Reached the summit after a 6-hour hike',
        location: 'Rocky Mountains, CO',
        people: [],
        blobUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        blobName: 'creator-001/sample2.jpg',
        mimeType: 'image/jpeg',
        fileSize: 2048000,
        aiTags: ['mountain', 'peak', 'snow', 'hiking', 'adventure'],
        aiDescription: 'A snow-capped mountain peak',
        dominantColors: ['white', 'blue', 'gray']
    },
    {
        creatorId: 'creator-002',
        title: 'City Lights',
        caption: 'NYC skyline at night',
        location: 'New York, NY',
        people: [],
        blobUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
        blobName: 'creator-002/sample3.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1536000,
        aiTags: ['city', 'skyline', 'night', 'lights', 'urban'],
        aiDescription: 'City skyline illuminated at night',
        dominantColors: ['black', 'yellow', 'blue']
    },
    {
        creatorId: 'creator-002',
        title: 'Forest Path',
        caption: 'A peaceful walk through the redwoods',
        location: 'Muir Woods, CA',
        people: [],
        blobUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        blobName: 'creator-002/sample4.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1800000,
        aiTags: ['forest', 'trees', 'path', 'nature', 'green'],
        aiDescription: 'Sunlight filtering through tall forest trees',
        dominantColors: ['green', 'brown', 'yellow']
    },
    {
        creatorId: 'creator-001',
        title: 'Ocean Waves',
        caption: 'The power of nature',
        location: 'Big Sur, CA',
        people: [],
        blobUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800',
        blobName: 'creator-001/sample5.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1400000,
        aiTags: ['ocean', 'waves', 'water', 'beach', 'nature'],
        aiDescription: 'Powerful ocean waves crashing on shore',
        dominantColors: ['blue', 'white', 'teal']
    },
    {
        creatorId: 'creator-002',
        title: 'Northern Lights',
        caption: 'Aurora borealis in Iceland',
        location: 'Iceland',
        people: [],
        blobUrl: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        blobName: 'creator-002/sample6.jpg',
        mimeType: 'image/jpeg',
        fileSize: 2200000,
        aiTags: ['aurora', 'northern lights', 'night', 'sky', 'iceland'],
        aiDescription: 'Green aurora borealis illuminating the night sky',
        dominantColors: ['green', 'blue', 'black']
    }
];

async function seed() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(config.mongodbUri);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Photo.deleteMany({});

        // Seed users
        console.log('Seeding users...');
        await User.insertMany(seedUsers);
        console.log(`Created ${seedUsers.length} users`);

        // Seed photos
        console.log('Seeding photos...');
        await Photo.insertMany(seedPhotos);
        console.log(`Created ${seedPhotos.length} photos`);

        // Update user photo counts
        await User.findOneAndUpdate(
            { odId: 'creator-001' },
            { photoCount: 2 }
        );
        await User.findOneAndUpdate(
            { odId: 'creator-002' },
            { photoCount: 1 }
        );

        console.log('\n✅ Seed completed successfully!');
        console.log('\nTest Users:');
        console.log('  Creators: creator-001, creator-002');
        console.log('  Consumers: consumer-001, consumer-002');

    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from database');
        process.exit(0);
    }
}

seed();
