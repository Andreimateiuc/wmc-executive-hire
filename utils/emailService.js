const nodemailer = require('nodemailer');
const moment = require('moment');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    
    // Send booking confirmation to customer
    async sendBookingConfirmation(bookingData) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'WMC Executive Private Hire <noreply@wmcexecutive.co.uk>',
            to: bookingData.customerEmail,
            subject: `Booking Confirmation - ${bookingData.bookingReference}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #D4AF37; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                        .booking-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #D4AF37; }
                        .detail-row { margin: 10px 0; }
                        .label { font-weight: bold; color: #000; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                        .button { display: inline-block; padding: 12px 30px; background: #D4AF37; color: #000; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>WMC Executive Private Hire</h1>
                            <p>Booking Confirmation</p>
                        </div>
                        <div class="content">
                            <h2>Dear ${bookingData.customerName},</h2>
                            <p>Thank you for choosing WMC Executive Private Hire. Your booking request has been received and is being processed.</p>
                            
                            <div class="booking-details">
                                <h3>Booking Details</h3>
                                <div class="detail-row">
                                    <span class="label">Booking Reference:</span> ${bookingData.bookingReference}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Pickup Date:</span> ${moment(bookingData.pickupDate).format('dddd, MMMM Do YYYY')}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Pickup Time:</span> ${bookingData.pickupTime}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Pickup Location:</span> ${bookingData.pickupLocation}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Drop-off Location:</span> ${bookingData.dropoffLocation}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Vehicle:</span> ${this.formatVehicleName(bookingData.vehicle)}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Passengers:</span> ${bookingData.passengers}
                                </div>
                            </div>
                            
                            <p><strong>What happens next?</strong></p>
                            <ul>
                                <li>We will review your booking request</li>
                                <li>You will receive a confirmation email with the final quote within 30 minutes</li>
                                <li>Our team will contact you to confirm all details</li>
                            </ul>
                            
                            <p>If you have any questions, please don't hesitate to contact us:</p>
                            <p>
                                📞 Phone: <a href="tel:+447501073623">+44 7501 073623</a><br>
                                📧 Email: <a href="mailto:wmctransportltd@gmail.com">wmctransportltd@gmail.com</a><br>
                                💬 WhatsApp: <a href="https://wa.me/447501073623">Message Us</a>
                            </p>
                        </div>
                        <div class="footer">
                            <p>WMC Executive Private Hire - Premium Private Hire Service in Northampton</p>
                            <p>24/7 Service Available | Licensed & Insured</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Booking confirmation email sent to:', bookingData.customerEmail);
        } catch (error) {
            console.error('Failed to send booking confirmation email:', error);
            throw error;
        }
    }
    
    // Send booking notification to admin
    async sendAdminNotification(bookingData) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'WMC Executive Private Hire <noreply@wmcexecutive.co.uk>',
            to: process.env.EMAIL_TO || 'wmctransportltd@gmail.com',
            subject: `New Booking Request - ${bookingData.bookingReference}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #D4AF37; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                        .booking-details { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #D4AF37; }
                        .detail-row { margin: 10px 0; }
                        .label { font-weight: bold; color: #000; }
                        .urgent { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Booking Request</h1>
                        </div>
                        <div class="content">
                            <div class="urgent">
                                <strong>⚠️ Action Required:</strong> New booking request received. Please review and confirm.
                            </div>
                            
                            <div class="booking-details">
                                <h3>Booking Information</h3>
                                <div class="detail-row">
                                    <span class="label">Booking Reference:</span> ${bookingData.bookingReference}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Customer Name:</span> ${bookingData.customerName}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Email:</span> ${bookingData.customerEmail}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Phone:</span> ${bookingData.customerPhone}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Pickup Date:</span> ${moment(bookingData.pickupDate).format('dddd, MMMM Do YYYY')}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Pickup Time:</span> ${bookingData.pickupTime}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Pickup Location:</span> ${bookingData.pickupLocation}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Drop-off Location:</span> ${bookingData.dropoffLocation}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Vehicle:</span> ${this.formatVehicleName(bookingData.vehicle)}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Service Type:</span> ${this.formatServiceType(bookingData.serviceType)}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Passengers:</span> ${bookingData.passengers}
                                </div>
                                ${bookingData.specialRequests ? `
                                <div class="detail-row">
                                    <span class="label">Special Requests:</span><br>
                                    ${bookingData.specialRequests}
                                </div>
                                ` : ''}
                            </div>
                            
                            <p><strong>Next Steps:</strong></p>
                            <ol>
                                <li>Review the booking details</li>
                                <li>Check vehicle availability</li>
                                <li>Calculate and confirm the price</li>
                                <li>Contact the customer to confirm</li>
                            </ol>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Admin notification email sent');
        } catch (error) {
            console.error('Failed to send admin notification email:', error);
            throw error;
        }
    }
    
    // Send contact form notification to admin
    async sendContactNotification(contactData) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'WMC Executive Private Hire <noreply@wmcexecutive.co.uk>',
            to: process.env.EMAIL_TO || 'wmctransportltd@gmail.com',
            subject: `New Contact Message - ${contactData.subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #D4AF37; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                        .message-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #D4AF37; }
                        .detail-row { margin: 10px 0; }
                        .label { font-weight: bold; color: #000; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>New Contact Message</h1>
                        </div>
                        <div class="content">
                            <div class="message-box">
                                <div class="detail-row">
                                    <span class="label">From:</span> ${contactData.name}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Email:</span> ${contactData.email}
                                </div>
                                ${contactData.phone ? `
                                <div class="detail-row">
                                    <span class="label">Phone:</span> ${contactData.phone}
                                </div>
                                ` : ''}
                                <div class="detail-row">
                                    <span class="label">Subject:</span> ${contactData.subject}
                                </div>
                                <div class="detail-row">
                                    <span class="label">Message:</span><br>
                                    <p>${contactData.message}</p>
                                </div>
                            </div>
                            
                            <p><strong>Reply to:</strong> <a href="mailto:${contactData.email}">${contactData.email}</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Contact notification email sent');
        } catch (error) {
            console.error('Failed to send contact notification email:', error);
            throw error;
        }
    }
    
    // Send auto-reply to contact form submission
    async sendContactAutoReply(contactData) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'WMC Executive Private Hire <noreply@wmcexecutive.co.uk>',
            to: contactData.customerEmail,
            subject: 'Thank you for contacting WMC Executive Private Hire',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #000; color: #D4AF37; padding: 20px; text-align: center; }
                        .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>WMC Executive Private Hire</h1>
                        </div>
                        <div class="content">
                            <h2>Dear ${contactData.customerName},</h2>
                            <p>Thank you for contacting WMC Executive Private Hire. We have received your message and will respond as soon as possible.</p>
                            <p>Our team typically responds within 2-4 hours during business hours (9am-6pm, Monday-Friday). For urgent inquiries, please call us directly at <a href="tel:+447501073623">+44 7501 073623</a>.</p>
                            <p>We look forward to serving you!</p>
                            <p>Best regards,<br>WMC Executive Private Hire Team</p>
                        </div>
                        <div class="footer">
                            <p>WMC Executive Private Hire - Premium Private Hire Service in Northampton</p>
                            <p>📞 +44 7501 073623 | 📧 wmctransportltd@gmail.com</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        try {
            await this.transporter.sendMail(mailOptions);
            console.log('Contact auto-reply email sent to:', contactData.customerEmail);
        } catch (error) {
            console.error('Failed to send contact auto-reply email:', error);
            throw error;
        }
    }
    
    // Helper methods
    formatVehicleName(vehicle) {
        const vehicles = {
            'e-class': 'Mercedes E-Class',
            's-class': 'Mercedes S-Class',
            'v-class': 'Mercedes V-Class'
        };
        return vehicles[vehicle] || vehicle;
    }
    
    formatServiceType(serviceType) {
        const services = {
            'airport': 'Airport Transfer',
            'corporate': 'Corporate Travel',
            'event': 'Special Event',
            'hourly': 'Hourly Hire',
            'distance': 'Long Distance',
            'other': 'Other'
        };
        return services[serviceType] || serviceType;
    }
}

module.exports = new EmailService();
