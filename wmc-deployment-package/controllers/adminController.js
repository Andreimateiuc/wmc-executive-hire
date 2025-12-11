const db = require('../database/config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');

class AdminController {
    // Admin login
    async login(username, password) {
        try {
            const admin = await db.queryOne(
                'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
                [username]
            );
            
            if (!admin) {
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }
            
            const isValidPassword = await bcrypt.compare(password, admin.password_hash);
            
            if (!isValidPassword) {
                return {
                    success: false,
                    message: 'Invalid username or password'
                };
            }
            
            // Update last login
            await db.query(
                'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
                [admin.id]
            );
            
            // Generate JWT token
            const token = jwt.sign(
                { id: admin.id, username: admin.username, role: admin.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );
            
            return {
                success: true,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                },
                token
            };
            
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    
    // Get dashboard statistics
    async getDashboardStats() {
        const stats = {};
        
        // Total bookings
        const totalBookings = await db.queryOne(
            'SELECT COUNT(*) as count FROM bookings'
        );
        stats.totalBookings = totalBookings.count;
        
        // Pending bookings
        const pendingBookings = await db.queryOne(
            'SELECT COUNT(*) as count FROM bookings WHERE status = "pending"'
        );
        stats.pendingBookings = pendingBookings.count;
        
        // Today's bookings
        const todayBookings = await db.queryOne(
            'SELECT COUNT(*) as count FROM bookings WHERE pickup_date = CURDATE()'
        );
        stats.todayBookings = todayBookings.count;
        
        // This month's bookings
        const monthBookings = await db.queryOne(
            'SELECT COUNT(*) as count FROM bookings WHERE MONTH(pickup_date) = MONTH(CURDATE()) AND YEAR(pickup_date) = YEAR(CURDATE())'
        );
        stats.monthBookings = monthBookings.count;
        
        // Total customers
        const totalCustomers = await db.queryOne(
            'SELECT COUNT(*) as count FROM customers'
        );
        stats.totalCustomers = totalCustomers.count;
        
        // Unread messages
        const unreadMessages = await db.queryOne(
            'SELECT COUNT(*) as count FROM contact_messages WHERE status = "new"'
        );
        stats.unreadMessages = unreadMessages.count;
        
        // Revenue this month (if total_price is set)
        const monthRevenue = await db.queryOne(
            `SELECT COALESCE(SUM(total_price), 0) as revenue 
             FROM bookings 
             WHERE MONTH(pickup_date) = MONTH(CURDATE()) 
             AND YEAR(pickup_date) = YEAR(CURDATE())
             AND status IN ('confirmed', 'completed')`
        );
        stats.monthRevenue = parseFloat(monthRevenue.revenue);
        
        // Bookings by status
        const bookingsByStatus = await db.query(
            'SELECT status, COUNT(*) as count FROM bookings GROUP BY status'
        );
        stats.bookingsByStatus = bookingsByStatus;
        
        // Recent activity (last 7 days)
        const recentActivity = await db.query(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM bookings 
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DATE(created_at)
             ORDER BY date DESC`
        );
        stats.recentActivity = recentActivity;
        
        return stats;
    }
    
    // Get recent bookings
    async getRecentBookings(limit = 10) {
        const bookings = await db.query(
            `SELECT b.*, c.full_name, c.email, c.phone
             FROM bookings b
             JOIN customers c ON b.customer_id = c.id
             ORDER BY b.created_at DESC
             LIMIT ?`,
            [limit]
        );
        
        return bookings;
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
    
    // Get revenue statistics
    async getRevenueStats(period = 'month') {
        let dateCondition;
        
        switch (period) {
            case 'today':
                dateCondition = 'DATE(pickup_date) = CURDATE()';
                break;
            case 'week':
                dateCondition = 'pickup_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'month':
                dateCondition = 'MONTH(pickup_date) = MONTH(CURDATE()) AND YEAR(pickup_date) = YEAR(CURDATE())';
                break;
            case 'year':
                dateCondition = 'YEAR(pickup_date) = YEAR(CURDATE())';
                break;
            default:
                dateCondition = 'MONTH(pickup_date) = MONTH(CURDATE()) AND YEAR(pickup_date) = YEAR(CURDATE())';
        }
        
        const stats = await db.queryOne(
            `SELECT 
                COUNT(*) as total_bookings,
                COALESCE(SUM(total_price), 0) as total_revenue,
                COALESCE(AVG(total_price), 0) as average_booking_value
             FROM bookings 
             WHERE ${dateCondition} AND status IN ('confirmed', 'completed')`
        );
        
        // Get revenue by service type
        const revenueByService = await db.query(
            `SELECT 
                service_type,
                COUNT(*) as bookings,
                COALESCE(SUM(total_price), 0) as revenue
             FROM bookings 
             WHERE ${dateCondition} AND status IN ('confirmed', 'completed')
             GROUP BY service_type`
        );
        
        return {
            ...stats,
            revenueByService
        };
    }
    
    // Change password
    async changePassword(adminId, currentPassword, newPassword) {
        try {
            const admin = await db.queryOne(
                'SELECT password_hash FROM admin_users WHERE id = ?',
                [adminId]
            );
            
            if (!admin) {
                return {
                    success: false,
                    message: 'Admin user not found'
                };
            }
            
            const isValidPassword = await bcrypt.compare(currentPassword, admin.password_hash);
            
            if (!isValidPassword) {
                return {
                    success: false,
                    message: 'Current password is incorrect'
                };
            }
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await db.query(
                'UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
                [hashedPassword, adminId]
            );
            
            return {
                success: true,
                message: 'Password changed successfully'
            };
            
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }
    
    // Create new admin user
    async createAdminUser(userData) {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const result = await db.query(
                `INSERT INTO admin_users (username, password_hash, email, full_name, role)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    userData.username,
                    hashedPassword,
                    userData.email,
                    userData.fullName,
                    userData.role || 'staff'
                ]
            );
            
            return {
                success: true,
                adminId: result.insertId
            };
            
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'Username already exists'
                };
            }
            throw error;
        }
    }
    
    // Register new admin user (public registration)
    async register(userData) {
        try {
            // Validate input
            if (!userData.username || !userData.email || !userData.password || !userData.fullName) {
                return {
                    success: false,
                    message: 'All fields are required'
                };
            }
            
            // Check username length
            if (userData.username.length < 3 || userData.username.length > 50) {
                return {
                    success: false,
                    message: 'Username must be between 3 and 50 characters'
                };
            }
            
            // Check if username already exists
            const existingUsername = await db.queryOne(
                'SELECT id FROM admin_users WHERE username = ?',
                [userData.username]
            );
            
            if (existingUsername) {
                return {
                    success: false,
                    message: 'Username already exists'
                };
            }
            
            // Check if email already exists
            const existingEmail = await db.queryOne(
                'SELECT id FROM admin_users WHERE email = ?',
                [userData.email]
            );
            
            if (existingEmail) {
                return {
                    success: false,
                    message: 'Email already exists'
                };
            }
            
            // Validate password length
            if (userData.password.length < 6) {
                return {
                    success: false,
                    message: 'Password must be at least 6 characters long'
                };
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            // Insert new user with 'staff' role by default
            const result = await db.query(
                `INSERT INTO admin_users (username, password_hash, email, full_name, role, is_active)
                 VALUES (?, ?, ?, ?, 'staff', TRUE)`,
                [
                    userData.username,
                    hashedPassword,
                    userData.email,
                    userData.fullName
                ]
            );
            
            return {
                success: true,
                message: 'Registration successful',
                adminId: result.insertId
            };
            
        } catch (error) {
            console.error('Registration error:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return {
                    success: false,
                    message: 'Username or email already exists'
                };
            }
            throw error;
        }
    }
}

module.exports = new AdminController();
