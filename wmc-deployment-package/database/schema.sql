-- WMC Executive Private Hire Database Schema
-- MySQL Database Structure

-- Create database
CREATE DATABASE IF NOT EXISTS wmc_executive_hire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wmc_executive_hire;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    description TEXT,
    features TEXT,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    passengers INT NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    dropoff_location VARCHAR(255) NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    return_journey ENUM('yes', 'no') DEFAULT 'no',
    return_date DATE NULL,
    special_requests TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    total_price DECIMAL(10, 2) NULL,
    booking_reference VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_booking_reference (booking_reference),
    INDEX idx_status (status),
    INDEX idx_pickup_date (pickup_date),
    INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking notes table (for internal notes)
CREATE TABLE IF NOT EXISTS booking_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    admin_id INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default vehicles
INSERT INTO vehicles (name, type, capacity, description, features, image_url) VALUES
('Mercedes E-Class', 'e-class', 3, 'Perfect for executive travel and airport transfers with sophisticated comfort and style', 'Leather seats, Climate control, Premium sound system, Wi-Fi, Phone chargers', 'images/mercedes-e-class.jpeg'),
('Mercedes S-Class', 's-class', 3, 'The pinnacle of luxury with cutting-edge technology and unparalleled comfort', 'Executive leather seats, Advanced climate control, Premium Burmester sound, Wi-Fi, Massage seats, Ambient lighting', 'images/mercedes-s-class.jpeg'),
('Mercedes V-Class', 'v-class', 7, 'Spacious luxury MPV ideal for group travel and family airport transfers', 'Spacious interior, Individual climate zones, Entertainment system, Wi-Fi, USB charging ports, Ample luggage space', 'images/mercedes-v-class.jpg');

-- Insert default services
INSERT INTO services (name, type, description, base_price) VALUES
('Airport Transfer', 'airport', 'Reliable airport transfers to all major UK airports', 80.00),
('Corporate Travel', 'corporate', 'Professional executive transport for business', 70.00),
('Special Events', 'event', 'Elegant transportation for weddings and celebrations', 100.00),
('Hourly Hire', 'hourly', 'Flexible hourly hire service', 50.00),
('Long Distance', 'distance', 'Comfortable long-distance journeys across the UK', 1.50);

-- Create views for reporting
CREATE OR REPLACE VIEW booking_summary AS
SELECT 
    b.id,
    b.booking_reference,
    c.full_name,
    c.email,
    c.phone,
    b.vehicle_type,
    b.service_type,
    b.pickup_location,
    b.dropoff_location,
    b.pickup_date,
    b.pickup_time,
    b.status,
    b.total_price,
    b.created_at
FROM bookings b
JOIN customers c ON b.customer_id = c.id
ORDER BY b.created_at DESC;

-- Create view for daily bookings
CREATE OR REPLACE VIEW daily_bookings AS
SELECT 
    DATE(pickup_date) as booking_date,
    COUNT(*) as total_bookings,
    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bookings,
    SUM(total_price) as total_revenue
FROM bookings
GROUP BY DATE(pickup_date)
ORDER BY booking_date DESC;

-- Create stored procedure for generating booking reference
DELIMITER //
CREATE PROCEDURE generate_booking_reference(OUT ref VARCHAR(50))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE temp_ref VARCHAR(50);
    
    REPEAT
        SET temp_ref = CONCAT('WMC', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
        
        IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_reference = temp_ref) THEN
            SET ref = temp_ref;
            SET done = TRUE;
        END IF;
    UNTIL done END REPEAT;
END //
DELIMITER ;

-- Create trigger to auto-generate booking reference
DELIMITER //
CREATE TRIGGER before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_reference IS NULL OR NEW.booking_reference = '' THEN
        CALL generate_booking_reference(@new_ref);
        SET NEW.booking_reference = @new_ref;
    END IF;
END //
DELIMITER ;

-- Grant privileges (adjust username as needed)
-- GRANT ALL PRIVILEGES ON wmc_executive_hire.* TO 'wmc_user'@'localhost';
-- FLUSH PRIVILEGES;
