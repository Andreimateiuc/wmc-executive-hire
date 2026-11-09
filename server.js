const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

// Import utilities and middleware
const db = require('./database/config');
const logger = require('./utils/logger');
const { cache } = require('./utils/cache');
const security = require('./middleware/security');

// Import routes
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');

// Validate environment variables
try {
    security.validateEnvVars();
} catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
let databaseAvailable = false;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Helmet - Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["https://www.google.com", "https://maps.google.com"],
            objectSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Additional security headers
app.use(security.securityHeaders);

// CORS configuration
app.use(cors(security.getCorsOptions()));

// Compression
app.use(compression());

// Cookie parser
app.use(cookieParser());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization
app.use(security.sanitizeInput);

// Detect suspicious activity
app.use(security.detectSuspiciousActivity);

// Request logging
app.use(security.requestLogger);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    },
    name: 'sessionId' // Don't use default 'connect.sid'
}));

// ============================================
// STATIC FILES
// ============================================

app.use(express.static(path.join(__dirname), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true,
    lastModified: true
}));

app.use('/css', express.static(path.join(__dirname, 'css'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0
}));

app.use('/js', express.static(path.join(__dirname, 'js'), {
    maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0
}));

app.use('/images', express.static(path.join(__dirname, 'images'), {
    maxAge: process.env.NODE_ENV === 'production' ? '30d' : 0
}));

// ============================================
// API ROUTES
// ============================================

// Apply rate limiting to all API routes
app.use('/api/', security.apiLimiter);

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// QUOTE GEOCODE / ROUTE PROXIES (OpenStreetMap)
// Browser calls same-origin only (CSP connect-src 'self').
// Upstream: Nominatim + public OSRM. No new dependencies.
// ============================================
const https = require('https');
const OSM_UA = 'WMC-Executive-Quote/1.0 (help@wmcprivatehire.com)';
const osmCache = new Map(); // key -> { expires, value }
let osmGate = Promise.resolve();
let osmNextAt = 0;

function osmCacheGet(key) {
    const hit = osmCache.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expires) {
        osmCache.delete(key);
        return undefined;
    }
    return hit.value;
}

function osmCacheSet(key, value, ttlMs) {
    osmCache.set(key, { expires: Date.now() + ttlMs, value });
    if (osmCache.size > 400) {
        const oldest = osmCache.keys().next().value;
        osmCache.delete(oldest);
    }
}

function httpsGetJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': OSM_UA,
                'Accept': 'application/json'
            },
            timeout: 12000
        }, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 400) {
                    return reject(new Error('Upstream HTTP ' + res.statusCode));
                }
                try {
                    resolve(JSON.parse(body || 'null'));
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Upstream timeout'));
        });
    });
}

// Serialize upstream calls to ~1 request/second (Nominatim usage policy)
function withOsmRateLimit(fn) {
    const run = osmGate.then(async () => {
        const wait = Math.max(0, osmNextAt - Date.now());
        if (wait) await new Promise((r) => setTimeout(r, wait));
        osmNextAt = Date.now() + 1000;
        return fn();
    });
    osmGate = run.then(() => undefined, () => undefined);
    return run;
}

function parseLatLon(pair) {
    if (typeof pair !== 'string') return null;
    const parts = pair.split(',');
    if (parts.length !== 2) return null;
    const lat = Number(parts[0].trim());
    const lon = Number(parts[1].trim());
    if (!isFinite(lat) || !isFinite(lon)) return null;
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
    return { lat, lon };
}

app.get('/api/geocode', async (req, res) => {
    try {
        const q = String(req.query.q || '').trim();
        if (q.length < 3 || q.length > 120) {
            return res.status(400).json({
                success: false,
                message: 'Query must be between 3 and 120 characters.'
            });
        }

        const cacheKey = 'geo:' + q.toLowerCase();
        const cached = osmCacheGet(cacheKey);
        if (cached) {
            return res.json({ success: true, cached: true, results: cached });
        }

        const url = 'https://nominatim.openstreetmap.org/search?' + new URLSearchParams({
            format: 'json',
            countrycodes: 'gb',
            limit: '5',
            q
        }).toString();

        const data = await withOsmRateLimit(() => httpsGetJson(url));
        const results = (Array.isArray(data) ? data : [])
            .map((r) => ({
                display_name: r.display_name,
                lat: Number(r.lat),
                lon: Number(r.lon)
            }))
            .filter((r) => r.display_name && isFinite(r.lat) && isFinite(r.lon));

        osmCacheSet(cacheKey, results, 60 * 60 * 1000);
        return res.json({ success: true, cached: false, results });
    } catch (error) {
        logger.error('Geocode proxy failed:', error);
        return res.status(502).json({
            success: false,
            message: 'Address lookup is temporarily unavailable.'
        });
    }
});

app.get('/api/route', async (req, res) => {
    try {
        const from = parseLatLon(String(req.query.from || ''));
        const to = parseLatLon(String(req.query.to || ''));
        if (!from || !to) {
            return res.status(400).json({
                success: false,
                message: 'from and to must be lat,lon pairs.'
            });
        }

        const cacheKey = 'route:' + from.lat.toFixed(5) + ',' + from.lon.toFixed(5) + '>' + to.lat.toFixed(5) + ',' + to.lon.toFixed(5);
        const cached = osmCacheGet(cacheKey);
        if (cached) {
            return res.json({ success: true, cached: true, ...cached });
        }

        // OSRM expects lon,lat
        const path = from.lon + ',' + from.lat + ';' + to.lon + ',' + to.lat;
        const url = 'https://router.project-osrm.org/route/v1/driving/' + path + '?overview=false';

        const data = await withOsmRateLimit(() => httpsGetJson(url));
        const route = data && Array.isArray(data.routes) ? data.routes[0] : null;
        if (!route || !(route.distance >= 0)) {
            return res.status(502).json({
                success: false,
                message: 'No driving route found for those points.'
            });
        }

        const metres = route.distance;
        const miles = Math.round((metres / 1609.344) * 10) / 10;
        const durationSeconds = Math.round(route.duration || 0);
        const payload = {
            miles,
            metres: Math.round(metres),
            durationSeconds,
            durationMinutes: Math.round(durationSeconds / 60)
        };
        osmCacheSet(cacheKey, payload, 60 * 60 * 1000);
        return res.json({ success: true, cached: false, ...payload });
    } catch (error) {
        logger.error('Route proxy failed:', error);
        return res.status(502).json({
            success: false,
            message: 'Route lookup is temporarily unavailable.'
        });
    }
});


// ============================================
// HEALTH CHECK & MONITORING
// ============================================

app.get('/api/health', async (req, res) => {
    try {
        // Check database connection
        databaseAvailable = await db.testConnection();
        
        // Get cache stats
        const cacheStats = cache.getStats();

        const payload = {
            status: databaseAvailable ? 'OK' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: databaseAvailable ? 'connected' : 'disconnected',
            cache: {
                enabled: process.env.CACHE_ENABLED === 'true',
                stats: cacheStats
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
            },
            version: require('./package.json').version
        };
        
        res.status(200).json(payload);
    } catch (error) {
        logger.logError(error);
        res.status(503).json({
            status: 'ERROR',
            message: 'Service unavailable',
            timestamp: new Date().toISOString()
        });
    }
});

// Cache statistics endpoint (admin only)
app.get('/api/cache/stats', (req, res) => {
    res.json({
        success: true,
        data: cache.getStats()
    });
});

// Clear cache endpoint (admin only)
app.post('/api/cache/clear', (req, res) => {
    cache.flush();
    logger.info('Cache cleared manually');
    res.json({
        success: true,
        message: 'Cache cleared successfully'
    });
});

// ============================================
// HTML PAGES
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'services.html'));
});

app.get('/fleet', (req, res) => {
    res.sendFile(path.join(__dirname, 'fleet.html'));
});

app.get('/prices', (req, res) => {
    res.sendFile(path.join(__dirname, 'prices.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/index.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/login.html'));
});

app.get('/admin/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/register.html'));
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
    logger.warn('404 Not Found', {
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found'
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    // Log error
    logger.logError(err, req);
    
    // Don't expose error details in production
    const errorResponse = {
        success: false,
        error: err.message || 'Internal Server Error'
    };
    
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }
    
    res.status(err.status || 500).json(errorResponse);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    const finalizeShutdown = async () => {
        try {
            await db.pool.end();
            logger.info('Database connections closed');
        } catch (error) {
            logger.error('Error closing database connections:', error);
        }

        try {
            cache.flush();
            logger.info('Cache cleared');
        } catch (error) {
            logger.error('Error clearing cache:', error);
        }
    };

    if (!server) {
        await finalizeShutdown();
        process.exit(signal === 'uncaughtException' ? 1 : 0);
        return;
    }

    // Stop accepting new connections
    server.close(async () => {
        logger.info('HTTP server closed');
        
        await finalizeShutdown();
        logger.info('Graceful shutdown completed');
        process.exit(signal === 'uncaughtException' ? 1 : 0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// ============================================
// START SERVER
// ============================================

let server;

async function startServer() {
    try {
        // Test database connection
        databaseAvailable = await db.testConnection();

        if (!databaseAvailable) {
            logger.warn('Database connection failed during startup. Serving static pages in degraded mode until the database becomes available.');
            console.error('\n⚠️ Database connection failed. Starting in degraded mode.');
            console.log('\nMake sure to:');
            console.log('1. Configure database settings in your hosting environment');
            console.log('2. Verify the MySQL server is reachable from the app');
            console.log('3. Recheck /api/health after updating the database config\n');
        }
        
        // Start server
        server = app.listen(PORT, () => {
            console.log('\n╔════════════════════════════════════════════════╗');
            console.log('║   WMC Executive Private Hire - Server Running  ║');
            console.log('╚════════════════════════════════════════════════╝\n');
            console.log(`🚀 Server: http://localhost:${PORT}`);
            console.log(`🌐 Website: http://localhost:${PORT}`);
            console.log(`🔧 Admin Panel: http://localhost:${PORT}/admin`);
            console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
            console.log(`\n📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Database: ${databaseAvailable ? 'Connected' : 'Disconnected (degraded mode)'}`);
            console.log(`🔒 Security: Enhanced`);
            console.log(`📦 Cache: ${process.env.CACHE_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`);
            console.log(`📝 Logging: ${process.env.LOG_LEVEL || 'info'}\n`);
            
            logger.info('Server started successfully', {
                port: PORT,
                environment: process.env.NODE_ENV || 'development',
                nodeVersion: process.version,
                databaseAvailable
            });
        });
        
    } catch (error) {
        logger.error('Failed to start server:', error);
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
