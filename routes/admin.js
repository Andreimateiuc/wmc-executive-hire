const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Login validation
const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Registration validation
const registrationValidation = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('fullName')
        .trim()
        .notEmpty().withMessage('Full name is required')
];

// Admin registration
router.post('/register', registrationValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const result = await adminController.register({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            fullName: req.body.fullName
        });
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }
        
        res.status(201).json({
            success: true,
            message: result.message,
            data: {
                adminId: result.adminId
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Admin login
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const result = await adminController.login(req.body.username, req.body.password);
        
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message
            });
        }
        
        // Set session
        req.session.adminId = result.admin.id;
        req.session.username = result.admin.username;
        req.session.role = result.admin.role;
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                username: result.admin.username,
                role: result.admin.role,
                token: result.token
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Admin logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// Check authentication status
router.get('/auth/check', (req, res) => {
    if (req.session.adminId) {
        res.json({
            success: true,
            authenticated: true,
            user: {
                username: req.session.username,
                role: req.session.role
            }
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

// Get dashboard statistics (protected route)
router.get('/dashboard/stats', authMiddleware, async (req, res) => {
    try {
        const stats = await adminController.getDashboardStats();
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard statistics',
            error: error.message
        });
    }
});

// Get recent bookings (protected route)
router.get('/bookings/recent', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const bookings = await adminController.getRecentBookings(limit);
        
        res.json({
            success: true,
            data: bookings
        });
        
    } catch (error) {
        console.error('Recent bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve recent bookings',
            error: error.message
        });
    }
});

// Get bookings by date range (protected route)
router.get('/bookings/date-range', authMiddleware, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }
        
        const bookings = await adminController.getBookingsByDateRange(startDate, endDate);
        
        res.json({
            success: true,
            data: bookings
        });
        
    } catch (error) {
        console.error('Date range bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve bookings',
            error: error.message
        });
    }
});

// Get revenue statistics (protected route)
router.get('/revenue/stats', authMiddleware, async (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const stats = await adminController.getRevenueStats(period);
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Revenue stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve revenue statistics',
            error: error.message
        });
    }
});

// Change password (protected route)
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }
        
        const result = await adminController.changePassword(
            req.session.adminId,
            currentPassword,
            newPassword
        );
        
        if (!result.success) {
            return res.status(400).json(result);
        }
        
        res.json(result);
        
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: error.message
        });
    }
});

module.exports = router;
