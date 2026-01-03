const express = require("express");
const cors = require("cors");
require("dotenv").config();

const config = require("./config");
const { connectDB, isMockMode } = require("./config/db");
const { photoRoutes, userRoutes, commentRoutes, ratingRoutes } = require("./routes");
const { errorHandler, notFound, requestLogger } = require("./middleware");

const app = express();

// Trust proxy for Azure App Service
app.set('trust proxy', 1);

// CORS configuration
app.use(cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'PhotoStack API',
        version: '1.0.0',
        description: 'Cloud-native photo sharing platform API',
        endpoints: {
            photos: {
                'GET /api/photos': 'Get all photos (paginated)',
                'GET /api/photos/search': 'Search photos',
                'GET /api/photos/trending': 'Get trending photos',
                'GET /api/photos/:id': 'Get photo by ID',
                'GET /api/photos/creator/:creatorId': 'Get photos by creator',
                'POST /api/photos': 'Upload photo (Creator only)',
                'PUT /api/photos/:id': 'Update photo (Creator only)',
                'DELETE /api/photos/:id': 'Delete photo (Creator only)'
            },
            users: {
                'GET /api/users/me': 'Get current user profile',
                'PUT /api/users/me': 'Update current user profile',
                'GET /api/users/me/stats': 'Get user statistics',
                'GET /api/users/creators': 'Get all creators',
                'GET /api/users/:id': 'Get user by ID',
                'POST /api/users/register': 'Register new user'
            },
            comments: {
                'GET /api/photos/:photoId/comments': 'Get comments for photo',
                'POST /api/photos/:photoId/comments': 'Add comment to photo',
                'PUT /api/comments/:id': 'Update comment',
                'DELETE /api/comments/:id': 'Delete comment'
            },
            ratings: {
                'GET /api/photos/:photoId/ratings': 'Get ratings for photo',
                'GET /api/photos/:photoId/ratings/me': 'Get my rating for photo',
                'POST /api/photos/:photoId/ratings': 'Add/update rating',
                'DELETE /api/photos/:photoId/ratings': 'Remove my rating'
            }
        }
    });
});

// Start server
const startServer = async () => {
    try {
        // Connect to database (will fall back to mock mode if unavailable)
        await connectDB();
        
        // Configure routes AFTER DB connection but BEFORE error handlers
        if (isMockMode()) {
            const mockRoutes = require('./mock/mockRoutes');
            app.use('/api', mockRoutes);
            console.log('📦 Mock API routes loaded');
        } else {
            app.use('/api/photos', photoRoutes);
            app.use('/api/users', userRoutes);
            app.use('/api', commentRoutes);
            app.use('/api', ratingRoutes);
            console.log('🔌 Database API routes loaded');
        }
        
        // 404 handler - AFTER all routes
        app.use(notFound);
        
        // Global error handler
        app.use(errorHandler);
        
        const mode = isMockMode() ? '🔶 MOCK MODE' : '🟢 DATABASE MODE';
        console.log(`Database status: ${mode}`);

        // Start Express server
        app.listen(config.port, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                   PhotoStack API Server                    ║
╠═══════════════════════════════════════════════════════════╣
║  Status:      Running                                      ║
║  Mode:        ${(isMockMode() ? 'Mock Data' : 'Database').padEnd(43)}║
║  Port:        ${config.port.toString().padEnd(43)}║
║  Environment: ${config.nodeEnv.padEnd(43)}║
║  API Docs:    http://localhost:${config.port}/api${' '.repeat(24)}║
╚═══════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    const { disconnectDB } = require("./config/db");
    await disconnectDB();
    process.exit(0);
});

startServer();