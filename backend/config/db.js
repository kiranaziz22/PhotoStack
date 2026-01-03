const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/photostack';
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

// Connection options optimized for Azure Cosmos DB (MongoDB API)
const connectionOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: false, // Cosmos DB doesn't support retryable writes
};

let isConnected = false;
let mockMode = false;

const connectDB = async () => {
    // If mock mode is enabled, skip MongoDB connection
    if (USE_MOCK_DB) {
        console.log('🔶 Running in MOCK DATABASE mode - no real database connection');
        mockMode = true;
        isConnected = true;
        return;
    }

    if (isConnected) {
        console.log('Using existing database connection');
        return;
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI, connectionOptions);
        isConnected = true;
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
            isConnected = false;
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
            isConnected = true;
        });

    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        // In development, fall back to mock mode
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔶 Falling back to MOCK DATABASE mode for development');
            mockMode = true;
            isConnected = true;
            return;
        }
        throw error;
    }
};

const disconnectDB = async () => {
    if (!isConnected || mockMode) {
        return;
    }
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
};

const isMockMode = () => mockMode;

module.exports = { connectDB, disconnectDB, isMockMode };
