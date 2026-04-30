const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const logger = require('../utils/logger');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.logSecurityEvent('Rate Limit Exceeded', {
            ip: req.ip,
            url: req.url,
            userAgent: req.get('user-agent')
        });
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.'
        });
    }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    handler: (req, res) => {
        logger.logSecurityEvent('Auth Rate Limit Exceeded', {
            ip: req.ip,
            url: req.url,
            username: req.body.username
        });
        res.status(429).json({
            success: false,
            message: 'Too many login attempts, please try again after 15 minutes.'
        });
    }
});

// Contact form rate limiter
const contactLimiter = rateLimit({
    windowMs: parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000, // 1 hour
    max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX_REQUESTS) || 5,
    message: {
        success: false,
        message: 'Too many contact form submissions. Please try again later.'
    },
    handler: (req, res) => {
        logger.logSecurityEvent('Contact Form Rate Limit Exceeded', {
            ip: req.ip,
            email: req.body.email
        });
        res.status(429).json({
            success: false,
            message: 'Too many contact form submissions. Please try again later.'
        });
    }
});

// Booking rate limiter
const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 bookings per hour
    message: {
        success: false,
        message: 'Too many booking requests. Please try again later or call us directly.'
    },
    handler: (req, res) => {
        logger.logSecurityEvent('Booking Rate Limit Exceeded', {
            ip: req.ip,
            email: req.body.email
        });
        res.status(429).json({
            success: false,
            message: 'Too many booking requests. Please try again later or call us at +44 7501 073623.'
        });
    }
});

// Input sanitization middleware
const sanitizeInput = [
    mongoSanitize(), // Prevent NoSQL injection
    hpp(), // Prevent HTTP Parameter Pollution
    xss() // Prevent XSS attacks
];

// Validate required environment variables
const validateEnvVars = () => {
    const required = [
        'JWT_SECRET',
        'SESSION_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        logger.error('Missing required environment variables:', missing);
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    const missingDbConfig = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter(key => !process.env[key]);
    if (missingDbConfig.length > 0) {
        logger.warn('Database environment variables are missing. API routes may be unavailable until database settings are configured.', {
            missing: missingDbConfig
        });
    }

    // Warn about default values
    if (process.env.JWT_SECRET === 'your-secret-key' || 
        process.env.SESSION_SECRET === 'your-secret-key') {
        logger.warn('Using default secret keys! Please change them in production.');
    }
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Remove powered by header
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
};

// IP whitelist middleware (for admin routes if needed)
const ipWhitelist = (allowedIPs = []) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress;
        
        if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
            logger.logSecurityEvent('IP Blocked', {
                ip: clientIP,
                url: req.url
            });
            return res.status(403).json({
                success: false,
                message: 'Access denied from your IP address.'
            });
        }
        
        next();
    };
};

// Detect suspicious activity
const detectSuspiciousActivity = (req, res, next) => {
    const suspiciousPatterns = [
        /(\.\.|\/etc\/|\/var\/|\/usr\/)/i, // Path traversal
        /(union|select|insert|update|delete|drop|create|alter)/i, // SQL keywords
        /(<script|javascript:|onerror=|onload=)/i, // XSS patterns
        /(eval\(|exec\(|system\()/i, // Code execution
    ];

    const checkString = JSON.stringify({
        url: req.url,
        query: req.query,
        body: req.body
    });

    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            logger.logSecurityEvent('Suspicious Activity Detected', {
                ip: req.ip,
                url: req.url,
                pattern: pattern.toString(),
                userAgent: req.get('user-agent')
            });
            
            return res.status(400).json({
                success: false,
                message: 'Invalid request detected.'
            });
        }
    }

    next();
};

// CORS configuration
const getCorsOptions = () => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
        : ['http://localhost:3000'];

    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, Postman, etc.)
            if (!origin) return callback(null, true);
            
            if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                callback(null, true);
            } else {
                logger.logSecurityEvent('CORS Blocked', {
                    origin,
                    allowedOrigins
                });
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };
};

// Request logger middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(req, res, duration);
    });
    
    next();
};

module.exports = {
    apiLimiter,
    authLimiter,
    contactLimiter,
    bookingLimiter,
    sanitizeInput,
    validateEnvVars,
    securityHeaders,
    ipWhitelist,
    detectSuspiciousActivity,
    getCorsOptions,
    requestLogger
};
