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

async function deleteAdminUser() {
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║        Delete Admin User from Database         ║');
    console.log('╚════════════════════════════════════════════════╝\n');

    try {
        // Test database connection
        const connected = await db.testConnection();
        if (!connected) {
            console.error('❌ Cannot connect to database. Please check your .env configuration.');
            process.exit(1);
        }

        // List all admin users first
        const users = await db.query(
            `SELECT id, username, email, full_name, role 
             FROM admin_users 
             ORDER BY created_at DESC`
        );

        if (users.length === 0) {
            console.log('📭 No admin users found in database.\n');
            process.exit(0);
        }

        console.log('Current admin users:\n');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.full_name || 'N/A'} [Role: ${user.role}]`);
        });

        console.log('\n');
        const usernameToDelete = await question('Enter username to delete (or "cancel" to exit): ');

        if (usernameToDelete.toLowerCase() === 'cancel') {
            console.log('\n❌ Operation cancelled.\n');
            process.exit(0);
        }

        // Find the user
        const userToDelete = await db.queryOne(
            'SELECT id, username, email, full_name FROM admin_users WHERE username = ?',
            [usernameToDelete]
        );

        if (!userToDelete) {
            console.error(`\n❌ User "${usernameToDelete}" not found!`);
            process.exit(1);
        }

        // Confirm deletion
        console.log('\n⚠️  You are about to delete:');
        console.log(`   Username: ${userToDelete.username}`);
        console.log(`   Email: ${userToDelete.email}`);
        console.log(`   Full Name: ${userToDelete.full_name || 'N/A'}`);
        console.log('\n⚠️  This action cannot be undone!');

        const confirm = await question('\nType "DELETE" to confirm: ');

        if (confirm !== 'DELETE') {
            console.log('\n❌ Deletion cancelled.\n');
            process.exit(0);
        }

        // Check if this is the last admin
        const adminCount = await db.queryOne(
            'SELECT COUNT(*) as count FROM admin_users WHERE role = "admin"'
        );

        if (adminCount.count <= 1) {
            console.error('\n❌ Cannot delete the last admin user!');
            console.log('💡 Create another admin user first before deleting this one.\n');
            process.exit(1);
        }

        // Delete the user
        await db.query('DELETE FROM admin_users WHERE id = ?', [userToDelete.id]);

        console.log('\n✅ Admin user deleted successfully!');
        console.log(`   Username "${userToDelete.username}" has been removed from the database.\n`);

    } catch (error) {
        console.error('\n❌ Error deleting admin user:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        process.exit(0);
    }
}

// Run the script
deleteAdminUser();
