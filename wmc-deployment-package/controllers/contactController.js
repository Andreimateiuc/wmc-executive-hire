const db = require('../database/config');
const emailService = require('../utils/emailService');

class ContactController {
    // Create new contact message
    async createContactMessage(messageData) {
        const result = await db.query(
            `INSERT INTO contact_messages (name, email, phone, subject, message)
             VALUES (?, ?, ?, ?, ?)`,
            [
                messageData.name,
                messageData.email,
                messageData.phone || null,
                messageData.subject || 'General Inquiry',
                messageData.message
            ]
        );
        
        const messageId = result.insertId;
        
        // Send notification email to admin
        try {
            await emailService.sendContactNotification({
                name: messageData.name,
                email: messageData.email,
                phone: messageData.phone,
                subject: messageData.subject || 'General Inquiry',
                message: messageData.message
            });
            
            // Send auto-reply to customer
            await emailService.sendContactAutoReply({
                customerName: messageData.name,
                customerEmail: messageData.email
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the message submission if email fails
        }
        
        return { id: messageId };
    }
    
    // Get all contact messages with filters
    async getAllMessages(filters = {}) {
        let query = 'SELECT * FROM contact_messages WHERE 1=1';
        const params = [];
        
        if (filters.status) {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(filters.limit || 50, filters.offset || 0);
        
        const messages = await db.query(query, params);
        return messages;
    }
    
    // Get message by ID
    async getMessageById(messageId) {
        const message = await db.queryOne(
            'SELECT * FROM contact_messages WHERE id = ?',
            [messageId]
        );
        
        return message;
    }
    
    // Update message status
    async updateMessageStatus(messageId, status) {
        const result = await db.query(
            'UPDATE contact_messages SET status = ? WHERE id = ?',
            [status, messageId]
        );
        
        return result.affectedRows > 0;
    }
    
    // Delete message
    async deleteMessage(messageId) {
        const result = await db.query(
            'DELETE FROM contact_messages WHERE id = ?',
            [messageId]
        );
        
        return result.affectedRows > 0;
    }
    
    // Get unread messages count
    async getUnreadCount() {
        const result = await db.queryOne(
            'SELECT COUNT(*) as count FROM contact_messages WHERE status = "new"'
        );
        
        return result.count;
    }
}

module.exports = new ContactController();
