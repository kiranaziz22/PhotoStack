const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('../config');
const { User } = require('../models');

// JWKS client for Azure AD B2C token validation
let client = null;

const getJwksClient = () => {
    if (!client && config.azureAd.jwksUri) {
        client = jwksClient({
            jwksUri: config.azureAd.jwksUri,
            cache: true,
            cacheMaxAge: 86400000, // 24 hours
            rateLimit: true,
            jwksRequestsPerMinute: 10
        });
    }
    return client;
};

// Get signing key from JWKS
const getSigningKey = (header, callback) => {
    const jwks = getJwksClient();
    if (!jwks) {
        return callback(new Error('JWKS client not configured'));
    }
    
    jwks.getSigningKey(header.kid, (err, key) => {
        if (err) {
            return callback(err);
        }
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
};

/**
 * Middleware to authenticate JWT tokens from Azure AD B2C
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        // For development without Azure AD B2C
        if (process.env.NODE_ENV === 'development' && !config.azureAd.jwksUri) {
            // Simple JWT verification for development
            try {
                // Try JWT decode first
                let decoded = jwt.decode(token);
                
                // If that fails, try base64 decode (for mock tokens)
                if (!decoded) {
                    try {
                        decoded = JSON.parse(atob(token));
                    } catch (e) {
                        // Try URL-safe base64
                        try {
                            decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
                        } catch (e2) {
                            return res.status(401).json({
                                error: 'Unauthorized',
                                message: 'Invalid token format'
                            });
                        }
                    }
                }
                
                if (!decoded) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Invalid token'
                    });
                }
                req.user = {
                    oid: decoded.oid || decoded.sub || `user-${Date.now()}`,
                    email: decoded.email || decoded.emails?.[0],
                    name: decoded.name || decoded.displayName,
                    role: decoded.extension_Role || decoded.role || 'consumer'
                };
                return next();
            } catch (err) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid token'
                });
            }
        }

        // Production: Verify with Azure AD B2C JWKS
        jwt.verify(
            token,
            getSigningKey,
            {
                audience: config.azureAd.audience,
                issuer: config.azureAd.issuer,
                algorithms: ['RS256']
            },
            async (err, decoded) => {
                if (err) {
                    console.error('Token verification failed:', err.message);
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Invalid or expired token'
                    });
                }

                // Extract user info from token claims
                req.user = {
                    oid: decoded.oid || decoded.sub,
                    email: decoded.email || decoded.emails?.[0],
                    name: decoded.name || decoded.given_name,
                    role: decoded.extension_Role || 'consumer'
                };

                next();
            }
        );
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication failed'
        });
    }
};

/**
 * Middleware to check if user is a creator
 */
const requireCreator = async (req, res, next) => {
    try {
        // First check token role
        if (req.user?.role === 'creator') {
            return next();
        }

        // Then check database
        const user = await User.findOne({ odId: req.user?.oid });
        if (user && user.role === 'creator') {
            req.dbUser = user;
            return next();
        }

        return res.status(403).json({
            error: 'Forbidden',
            message: 'Creator access required'
        });
    } catch (error) {
        console.error('Role check error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Role verification failed'
        });
    }
};

/**
 * Middleware to check if user is a consumer
 */
const requireConsumer = async (req, res, next) => {
    try {
        if (req.user?.role === 'consumer' || req.user?.role === 'creator') {
            return next();
        }

        const user = await User.findOne({ odId: req.user?.oid });
        if (user) {
            req.dbUser = user;
            return next();
        }

        return res.status(403).json({
            error: 'Forbidden',
            message: 'Consumer access required'
        });
    } catch (error) {
        console.error('Role check error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Role verification failed'
        });
    }
};

/**
 * Optional authentication - continues even without token
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    // Try to authenticate but don't fail if invalid
    authenticate(req, res, (err) => {
        if (err) {
            req.user = null;
        }
        next();
    });
};

/**
 * Load user from database and attach to request
 */
const loadUser = async (req, res, next) => {
    try {
        if (!req.user?.oid) {
            return next();
        }

        let user = await User.findOne({ odId: req.user.oid });

        // Auto-create user if doesn't exist
        if (!user && req.user.email) {
            user = await User.create({
                odId: req.user.oid,
                email: req.user.email,
                displayName: req.user.name || 'User',
                role: req.user.role || 'consumer'
            });
            console.log(`Auto-created user: ${user.email}`);
        }

        if (user) {
            // Update last login
            user.lastLoginAt = new Date();
            await user.save();
            req.dbUser = user;
        }

        next();
    } catch (error) {
        console.error('Load user error:', error);
        next(); // Continue even if user load fails
    }
};

module.exports = {
    authenticate,
    requireCreator,
    requireConsumer,
    optionalAuth,
    loadUser
};
