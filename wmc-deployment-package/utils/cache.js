const NodeCache = require('node-cache');

// Create cache instance
const cache = new NodeCache({
    stdTTL: parseInt(process.env.CACHE_TTL) || 3600, // Default 1 hour
    checkperiod: 120, // Check for expired keys every 2 minutes
    useClones: false, // Don't clone objects (better performance)
    deleteOnExpire: true,
});

// Cache statistics
let hits = 0;
let misses = 0;

// Wrapper functions
const cacheMiddleware = {
    // Get value from cache
    get: (key) => {
        const value = cache.get(key);
        if (value !== undefined) {
            hits++;
            return value;
        }
        misses++;
        return null;
    },

    // Set value in cache
    set: (key, value, ttl = null) => {
        if (ttl) {
            return cache.set(key, value, ttl);
        }
        return cache.set(key, value);
    },

    // Delete value from cache
    del: (key) => {
        return cache.del(key);
    },

    // Delete multiple keys
    delMultiple: (keys) => {
        return cache.del(keys);
    },

    // Clear all cache
    flush: () => {
        hits = 0;
        misses = 0;
        return cache.flushAll();
    },

    // Check if key exists
    has: (key) => {
        return cache.has(key);
    },

    // Get cache statistics
    getStats: () => {
        return {
            hits,
            misses,
            hitRate: hits + misses > 0 ? (hits / (hits + misses) * 100).toFixed(2) + '%' : '0%',
            keys: cache.keys().length,
            ...cache.getStats(),
        };
    },

    // Get all keys
    keys: () => {
        return cache.keys();
    },

    // Get TTL for a key
    getTtl: (key) => {
        return cache.getTtl(key);
    },

    // Update TTL for a key
    ttl: (key, ttl) => {
        return cache.ttl(key, ttl);
    },
};

// Express middleware for caching responses
const cacheResponse = (duration = 300) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = cacheMiddleware.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        }

        // Store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json
        res.json = (body) => {
            // Cache the response
            cacheMiddleware.set(key, body, duration);
            return originalJson(body);
        };

        next();
    };
};

// Cache key generators
const cacheKeys = {
    booking: (id) => `booking:${id}`,
    bookingReference: (ref) => `booking:ref:${ref}`,
    bookings: (filters) => `bookings:${JSON.stringify(filters)}`,
    customer: (id) => `customer:${id}`,
    vehicle: (id) => `vehicle:${id}`,
    vehicles: () => 'vehicles:all',
    services: () => 'services:all',
    adminUser: (id) => `admin:${id}`,
};

// Cache invalidation helpers
const invalidateCache = {
    booking: (id) => {
        cacheMiddleware.del(cacheKeys.booking(id));
        // Also invalidate list caches
        const keys = cacheMiddleware.keys();
        keys.forEach(key => {
            if (key.startsWith('bookings:')) {
                cacheMiddleware.del(key);
            }
        });
    },

    customer: (id) => {
        cacheMiddleware.del(cacheKeys.customer(id));
    },

    vehicle: (id) => {
        cacheMiddleware.del(cacheKeys.vehicle(id));
        cacheMiddleware.del(cacheKeys.vehicles());
    },

    allBookings: () => {
        const keys = cacheMiddleware.keys();
        keys.forEach(key => {
            if (key.startsWith('booking')) {
                cacheMiddleware.del(key);
            }
        });
    },
};

// Event listeners
cache.on('expired', (key, value) => {
    console.log(`Cache key expired: ${key}`);
});

cache.on('flush', () => {
    console.log('Cache flushed');
});

module.exports = {
    cache: cacheMiddleware,
    cacheResponse,
    cacheKeys,
    invalidateCache,
};
