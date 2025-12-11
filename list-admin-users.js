 const db = require('./database/config');
require('dotenv').config();

async function listAdminUsers() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║           Admin Users in Database              ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    try {
        // Test database connection
        const connected = await db.testConnection();
        if (!connected) {
            console.error('❌ Cannot connect to database. Please check your .env configuration.');
            process.exit(1);
        }

        // Get all admin users
        const users = await db.query(
            `SELECT id, username, email, full_name, role, is_active, 
                    DATE_FORMAT(last_login, '%Y-%m-%d %H:%i:%s') as last_login,
                    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at
             FROM admin_users 
             ORDER BY created_at DESC`
        );

        if (users.length === 0) {
            console.log('📭 No admin users found in database.');
            console.log('\n💡 Run "node add-admin-user.js" to create an admin user.\n');
            process.exit(0);
        }

        console.log(`Found ${users.length} admin user(s):\n`);
        console.log('═'.repeat(100));

        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.full_name || 'N/A'}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Status: ${user.is_active ? '✅ Active' : '❌ Inactive'}`);
            console.log(`   Last Login: ${user.last_login || 'Never'}`);
            console.log(`   Created: ${user.created_at}`);
            console.log('─'.repeat(100));
        });

        console.log('\n✅ Total admin users: ' + users.length);
        console.log('\n💡 To add more users, run: node add-admin-user.js');
        console.log('💡 To delete a user, run: node delete-admin-user.js\n');

    } catch (error) {
        console.error('\n❌ Error listing admin users:', error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Run the script
listAdminUsers();
