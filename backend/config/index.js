require('dotenv').config();

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database Configuration
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/photostack',
    
    // Azure AD B2C Configuration
    azureAd: {
        tenantId: process.env.AZURE_AD_TENANT_ID,
        clientId: process.env.AZURE_AD_CLIENT_ID,
        audience: process.env.AZURE_AD_AUDIENCE || process.env.AZURE_AD_CLIENT_ID,
        issuer: process.env.AZURE_AD_ISSUER,
        jwksUri: process.env.AZURE_AD_JWKS_URI
    },
    
    // Azure Blob Storage Configuration
    azureStorage: {
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
        containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'photos',
        accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME
    },
    
    // Azure Cognitive Services Configuration
    cognitiveServices: {
        endpoint: process.env.AZURE_COGNITIVE_ENDPOINT,
        key: process.env.AZURE_COGNITIVE_KEY
    },
    
    // Azure Text Analytics for Sentiment Analysis
    textAnalytics: {
        endpoint: process.env.AZURE_TEXT_ANALYTICS_ENDPOINT,
        key: process.env.AZURE_TEXT_ANALYTICS_KEY
    },
    
    // CORS Configuration
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    
    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: process.env.RATE_LIMIT_MAX || 100 // limit each IP to 100 requests per windowMs
    },
    
    // Upload Configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
};
