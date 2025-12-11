const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');
const { bookingLimiter } = require('../middleware/security');
const logger = require('../utils/logger');

// Validation rules for booking
const bookingValidation = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('vehicle').notEmpty().withMessage('Vehicle type is required'),
    body('serviceType').notEmpty().withMessage('Service type is required'),
    body('passengers').isInt({ min: 1, max: 7 }).withMessage('Passengers must be between 1 and 7'),
    body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
    body('dropoffLocation').trim().notEmpty().withMessage('Drop-off location is required'),
    body('pickupDate').isDate().withMessage('Valid pickup date is required'),
    body('pickupTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid pickup time is required'),
    body('returnJourney').optional().isIn(['yes', 'no']),
    body('returnDate').optional().isDate(),
    body('specialRequests').optional().trim()
];

// Create new booking (with rate limiting)
router.post('/', bookingLimiter, bookingValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const booking = await bookingController.createBooking(req.body);
        
        logger.logBooking({
            bookingReference: booking.bookingReference,
            customerEmail: req.body.email,
            pickupDate: req.body.pickupDate,
            vehicle: req.body.vehicle
        });
        
        res.status(201).json({
            success: true,
            message: 'Booking request received successfully',
            data: {
                bookingReference: booking.bookingReference,
                customerId: booking.customerId,
                bookingId: booking.bookingId
            }
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
});

// Get booking by reference
router.get('/:reference', async (req, res) => {
    try {
        const booking = await bookingController.getBookingByReference(req.params.reference);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            data: booking
        });
        
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve booking',
            error: error.message
        });
    }
});

// Get all bookings (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, date, limit = 50, offset = 0 } = req.query;
        
        const bookings = await bookingController.getAllBookings({
            status,
            date,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            success: true,
            data: bookings
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve bookings',
            error: error.message
        });
    }
});

// Update booking status (admin only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }
        
        const updated = await bookingController.updateBookingStatus(req.params.id, status);
        
        if (updated) {
            logger.logAdminAction(req.adminId, 'UPDATE_BOOKING_STATUS', {
                bookingId: req.params.id,
                newStatus: status
            });
        }
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Booking status updated successfully'
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: error.message
        });
    }
});

// Delete booking (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deleted = await bookingController.deleteBooking(req.params.id);
        
        if (deleted) {
            logger.logAdminAction(req.adminId, 'DELETE_BOOKING', {
                bookingId: req.params.id
            });
        }
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: error.message
        });
    }
});

module.exports = router;
