const jwt = require('jsonwebtoken');

// Authentication middleware
function authMiddleware(req, res, next) {
    // Check session first
    if (req.session && req.session.adminId) {
        return next();
    }
    
    // Check JWT token in header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.adminId = decoded.id;
        req.adminRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

// Role-based authorization middleware
function authorize(...roles) {
    return (req, res, next) => {
        const userRole = req.session?.role || req.adminRole;
        
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }
        
        next();
    };
}

module.exports = authMiddleware;
module.exports.authorize = authorize;
