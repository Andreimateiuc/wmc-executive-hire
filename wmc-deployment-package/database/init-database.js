const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function initializeDatabase() {
    let connection;
    
    try {
        console.log('Starting database initialization...\n');
        
        // Connect to MySQL without specifying database
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });
        
        console.log('✓ Connected to MySQL server');
        
        // Read and execute schema file
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('✓ Schema file loaded');
        console.log('Creating database and tables...\n');
        
        await connection.query(schema);
        
        console.log('✓ Database and tables created successfully');
        
        // Create default admin user
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await connection.query(
            `USE ${process.env.DB_NAME || 'wmc_executive_hire'}`
        );
        
        // Check if admin already exists
        const [existingAdmin] = await connection.query(
            'SELECT id FROM admin_users WHERE username = ?',
            [adminUsername]
        );
        
        if (existingAdmin.length === 0) {
            await connection.query(
                `INSERT INTO admin_users (username, password_hash, email, full_name, role) 
                 VALUES (?, ?, ?, ?, ?)`,
                [adminUsername, hashedPassword, 'admin@wmcexecutive.co.uk', 'System Administrator', 'admin']
            );
            console.log('✓ Default admin user created');
            console.log(`  Username: ${adminUsername}`);
            console.log(`  Password: ${adminPassword}`);
            console.log('  ⚠️  IMPORTANT: Change the admin password immediately!\n');
        } else {
            console.log('✓ Admin user already exists\n');
        }
        
        console.log('✓ Database initialization completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Copy .env.example to .env and configure your settings');
        console.log('2. Run: npm install');
        console.log('3. Run: npm start');
        console.log('4. Access admin panel at: http://localhost:3000/admin');
        
    } catch (error) {
        console.error('✗ Database initialization failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run initialization
initializeDatabase();
