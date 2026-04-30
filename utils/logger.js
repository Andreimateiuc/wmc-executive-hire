const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '../logs');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let msg = `${timestamp} [${level}]: ${message}`;
        if (Object.keys(meta).length > 0) {
            msg += ` ${JSON.stringify(meta)}`;
        }
        return msg;
    })
);

const transports = [
    new winston.transports.Console({
        format: consoleFormat,
    })
];

try {
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    transports.push(
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        })
    );
} catch (error) {
    console.warn('File logging disabled:', error.message);
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'wmc-executive-hire' },
    transports,
});

// Create a stream object for Morgan HTTP logger
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

// Helper methods for common logging scenarios
logger.logRequest = (req, res, responseTime) => {
    logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
    });
};

logger.logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
    };

    if (req) {
        errorLog.request = {
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            body: req.body,
        };
    }

    logger.error('Application Error', errorLog);
};

logger.logBooking = (bookingData) => {
    logger.info('New Booking Created', {
        bookingReference: bookingData.bookingReference,
        customerEmail: bookingData.customerEmail,
        pickupDate: bookingData.pickupDate,
        vehicle: bookingData.vehicle,
    });
};

logger.logAdminAction = (adminId, action, details) => {
    logger.info('Admin Action', {
        adminId,
        action,
        details,
        timestamp: new Date().toISOString(),
    });
};

logger.logDatabaseQuery = (query, duration) => {
    if (process.env.LOG_LEVEL === 'debug') {
        logger.debug('Database Query', {
            query: query.substring(0, 100), // Log first 100 chars
            duration: `${duration}ms`,
        });
    }
};

logger.logEmailSent = (to, subject, success) => {
    logger.info('Email Sent', {
        to,
        subject,
        success,
        timestamp: new Date().toISOString(),
    });
};

logger.logSecurityEvent = (event, details) => {
    logger.warn('Security Event', {
        event,
        details,
        timestamp: new Date().toISOString(),
    });
};

module.exports = logger;
