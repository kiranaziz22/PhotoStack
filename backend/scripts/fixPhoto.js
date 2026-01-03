require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected');
    
    // Update photo creatorId to match user
    const result = await mongoose.connection.db.collection('photos').updateOne(
        { title: 'Danish Nawaz' },
        { $set: { creatorId: 'user-1767294055460' } }
    );
    
    console.log('Updated:', result.modifiedCount, 'photos');
    
    // Also update user stats
    await mongoose.connection.db.collection('users').updateOne(
        { odId: 'user-1767294055460' },
        { $set: { photoCount: 1, totalViews: 8, commentCount: 2, ratingCount: 1 } }
    );
    
    console.log('Updated user stats');
    
    await mongoose.disconnect();
    console.log('Done!');
}

fix().catch(console.error);
