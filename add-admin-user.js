const bcrypt = require('bcryptjs');
const readline = require('readline');
const db = require('./database/config');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function addAdminUser() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║        Add Admin User to Database              ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    try {
        // Test database connection
        const connected = await db.testConnection();
        if (!connected) {
            console.error('❌ Cannot connect to database. Please check your .env configuration.');
            process.exit(1);
        }

        // Get user input
        const username = await question('Enter username: ');
        const email = await question('Enter email: ');
        const fullName = await question('Enter full name: ');
        const password = await question('Enter password: ');
        const confirmPassword = await question('Confirm password: ');

        // Validate input
        if (!username || !email || !fullName || !password) {
            console.error('\n❌ All fields are required!');
            process.exit(1);
        }

        if (password !== confirmPassword) {
            console.error('\n❌ Passwords do not match!');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('\n❌ Password must be at least 6 characters long!');
            process.exit(1);
        }

        // Check if username already exists
        const existingUser = await db.queryOne(
            'SELECT id FROM admin_users WHERE username = ?',
            [username]
        );

        if (existingUser) {
            console.error(`\n❌ Username "${username}" already exists!`);
            process.exit(1);
        }

        // Check if email already exists
        const existingEmail = await db.queryOne(
            'SELECT id FROM admin_users WHERE email = ?',
            [email]
        );

        if (existingEmail) {
            console.error(`\n❌ Email "${email}" already exists!`);
            process.exit(1);
        }

        // Hash password
        console.log('\n⏳ Creating admin user...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin user
        const result = await db.query(
            `INSERT INTO admin_users (username, password_hash, email, full_name, role, is_active) 
             VALUES (?, ?, ?, ?, 'admin', TRUE)`,
            [username, hashedPassword, email, fullName]
        );

        console.log('\n✅ Admin user created successfully!');
        console.log('\n📋 User Details:');
        console.log(`   Username: ${username}`);
        console.log(`   Email: ${email}`);
        console.log(`   Full Name: ${fullName}`);
        console.log(`   Role: admin`);
        console.log(`   User ID: ${result.insertId}`);
        console.log('\n🔐 Login at: http://localhost:3000/admin/login');
        console.log('\n✅ You can now login with these credentials!\n');

    } catch (error) {
        console.error('\n❌ Error creating admin user:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run the script
addAdminUser();
