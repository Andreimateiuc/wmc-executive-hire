const db = require('../database/config');
const emailService = require('../utils/emailService');
const moment = require('moment');

class BookingController {
    // Create new booking
    async createBooking(bookingData) {
        return await db.transaction(async (connection) => {
            // Check if customer exists
            let [customers] = await connection.execute(
                'SELECT id FROM customers WHERE email = ?',
                [bookingData.email]
            );
            
            let customerId;
            
            if (customers.length > 0) {
                // Customer exists, update their info
                customerId = customers[0].id;
                await connection.execute(
                    'UPDATE customers SET full_name = ?, phone = ?, updated_at = NOW() WHERE id = ?',
                    [bookingData.fullName, bookingData.phone, customerId]
                );
            } else {
                // Create new customer
                const [result] = await connection.execute(
                    'INSERT INTO customers (full_name, email, phone) VALUES (?, ?, ?)',
                    [bookingData.fullName, bookingData.email, bookingData.phone]
                );
                customerId = result.insertId;
            }
            
            // Create booking
            const [bookingResult] = await connection.execute(
                `INSERT INTO bookings 
                (customer_id, vehicle_type, service_type, passengers, pickup_location, 
                dropoff_location, pickup_date, pickup_time, return_journey, return_date, special_requests)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    customerId,
                    bookingData.vehicle,
                    bookingData.serviceType,
                    bookingData.passengers,
                    bookingData.pickupLocation,
                    bookingData.dropoffLocation,
                    bookingData.pickupDate,
                    bookingData.pickupTime,
                    bookingData.returnJourney || 'no',
                    bookingData.returnDate || null,
                    bookingData.specialRequests || null
                ]
            );
            
            const bookingId = bookingResult.insertId;
            
            // Get booking reference
            const [booking] = await connection.execute(
                'SELECT booking_reference FROM bookings WHERE id = ?',
                [bookingId]
            );
            
            const bookingReference = booking[0].booking_reference;
            
            // Send confirmation email
            try {
                await emailService.sendBookingConfirmation({
                    customerName: bookingData.fullName,
                    customerEmail: bookingData.email,
                    bookingReference: bookingReference,
                    pickupDate: bookingData.pickupDate,
                    pickupTime: bookingData.pickupTime,
                    pickupLocation: bookingData.pickupLocation,
                    dropoffLocation: bookingData.dropoffLocation,
                    vehicle: bookingData.vehicle,
                    passengers: bookingData.passengers
                });
                
                // Send notification to admin
                await emailService.sendAdminNotification({
                    bookingReference: bookingReference,
                    customerName: bookingData.fullName,
                    customerEmail: bookingData.email,
                    customerPhone: bookingData.phone,
                    pickupDate: bookingData.pickupDate,
                    pickupTime: bookingData.pickupTime,
                    pickupLocation: bookingData.pickupLocation,
                    dropoffLocation: bookingData.dropoffLocation,
                    vehicle: bookingData.vehicle,
                    serviceType: bookingData.serviceType,
                    passengers: bookingData.passengers,
                    specialRequests: bookingData.specialRequests
                });
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the booking if email fails
            }
            
            return {
                bookingId,
                customerId,
                bookingReference
            };
        });
    }
    
    // Get booking by reference
    async getBookingByReference(reference) {
        const booking = await db.queryOne(
            `SELECT b.*, c.full_name, c.email, c.phone
             FROM bookings b
             JOIN customers c ON b.customer_id = c.id
             WHERE b.booking_reference = ?`,
            [reference]
        );
        
        return booking;
    }
    
    // Get all bookings with filters
    async getAllBookings(filters = {}) {
        let query = `
            SELECT b.*, c.full_name, c.email, c.phone
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            WHERE 1=1
        `;
        const params = [];
        
        if (filters.status) {
            query += ' AND b.status = ?';
            params.push(filters.status);
        }
        
        if (filters.date) {
            query += ' AND b.pickup_date = ?';
            params.push(filters.date);
        }
        
        query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
        params.push(filters.limit || 50, filters.offset || 0);
        
        const bookings = await db.query(query, params);
        return bookings;
    }
    
    // Update booking status
    async updateBookingStatus(bookingId, status) {
        const result = await db.query(
            'UPDATE bookings SET status = ?, updated_at = NOW() WHERE id = ?',
            [status, bookingId]
        );
        
        return result.affectedRows > 0;
    }
    
    // Delete booking
    async deleteBooking(bookingId) {
        const result = await db.query(
            'DELETE FROM bookings WHERE id = ?',
            [bookingId]
        );
        
        return result.affectedRows > 0;
    }
    
    // Get bookings by date range
    async getBookingsByDateRange(startDate, endDate) {
        const bookings = await db.query(
            `SELECT b.*, c.full_name, c.email, c.phone
             FROM bookings b
             JOIN customers c ON b.customer_id = c.id
             WHERE b.pickup_date BETWEEN ? AND ?
             ORDER BY b.pickup_date, b.pickup_time`,
            [startDate, endDate]
        );
        
        return bookings;
    }
    
    // Get today's bookings
    async getTodaysBookings() {
        const today = moment().format('YYYY-MM-DD');
        return await this.getBookingsByDateRange(today, today);
    }
    
    // Get upcoming bookings
    async getUpcomingBookings(days = 7) {
        const startDate = moment().format('YYYY-MM-DD');
        const endDate = moment().add(days, 'days').format('YYYY-MM-DD');
        
        return await this.getBookingsByDateRange(startDate, endDate);
    }
}

module.exports = new BookingController();
