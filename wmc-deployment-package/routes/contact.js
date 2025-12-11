const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');
const { contactLimiter } = require('../middleware/security');
const logger = require('../utils/logger');

// Validation rules for contact form
const contactValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('subject').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required')
];

// Submit contact form (with rate limiting)
router.post('/', contactLimiter, contactValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const message = await contactController.createContactMessage(req.body);
        
        logger.info('Contact form submitted', {
            email: req.body.email,
            subject: req.body.subject
        });
        
        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon.',
            data: {
                messageId: message.id
            }
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// Get all contact messages (admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;
        
        const messages = await contactController.getAllMessages({
            status,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        res.json({
            success: true,
            data: messages
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve messages',
            error: error.message
        });
    }
});

// Update message status (admin only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }
        
        const updated = await contactController.updateMessageStatus(req.params.id, status);
        
        if (updated) {
            logger.logAdminAction(req.adminId, 'UPDATE_CONTACT_STATUS', {
                messageId: req.params.id,
                newStatus: status
            });
        }
        
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Message status updated successfully'
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to update message status',
            error: error.message
        });
    }
});

// Delete message (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deleted = await contactController.deleteMessage(req.params.id);
        
        if (deleted) {
            logger.logAdminAction(req.adminId, 'DELETE_CONTACT_MESSAGE', {
                messageId: req.params.id
            });
        }
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
        
    } catch (error) {
        logger.logError(error, req);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: error.message
        });
    }
});

module.exports = router;
