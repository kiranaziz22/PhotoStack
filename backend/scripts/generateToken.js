/**
 * Script to generate a development JWT token
 * Run with: node scripts/generateToken.js [role]
 * 
 * Example:
 *   node scripts/generateToken.js creator
 *   node scripts/generateToken.js consumer
 */

const jwt = require('jsonwebtoken');

const role = process.argv[2] || 'consumer';

if (!['creator', 'consumer'].includes(role)) {
    console.error('Invalid role. Use "creator" or "consumer"');
    process.exit(1);
}

const userId = role === 'creator' ? 'creator-001' : 'consumer-001';
const email = role === 'creator' ? 'creator1@example.com' : 'consumer1@example.com';
const name = role === 'creator' ? 'John Creator' : 'Bob Viewer';

// Create a simple JWT for development (expires in 24 hours)
const token = jwt.sign(
    {
        oid: userId,
        sub: userId,
        email: email,
        name: name,
        role: role,
        extension_Role: role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    },
    'development-secret-key',
    { algorithm: 'HS256' }
);

console.log(`\n🔑 Development Token (${role}):`);
console.log('═'.repeat(50));
console.log(token);
console.log('═'.repeat(50));
console.log('\n📋 Token Payload:');
console.log(JSON.stringify(jwt.decode(token), null, 2));
console.log('\n📌 Usage:');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/users/me`);
console.log('\n⚠️  This token is for DEVELOPMENT only!\n');
