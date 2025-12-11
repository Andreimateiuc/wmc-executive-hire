const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create backups directory if it doesn't exist
const backupsDir = path.join(__dirname, '../backups');
if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
}

// Generate backup filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const backupFile = path.join(backupsDir, `wmc_backup_${timestamp}.sql`);

// Database credentials from environment
const dbHost = process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'wmc_executive_hire';
const dbPort = process.env.DB_PORT || 3306;

console.log('\n╔════════════════════════════════════════════════╗');
console.log('║        Database Backup Utility                  ║');
console.log('╚════════════════════════════════════════════════╝\n');

console.log(`📦 Database: ${dbName}`);
console.log(`📁 Backup Location: ${backupFile}`);
console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

// Build mysqldump command
const command = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > "${backupFile}"`;

// Execute backup
exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Backup failed:', error.message);
        console.error('\nPossible solutions:');
        console.error('1. Ensure MySQL is running');
        console.error('2. Check database credentials in .env');
        console.error('3. Verify mysqldump is installed and in PATH');
        console.error('4. Check database permissions\n');
        process.exit(1);
    }

    if (stderr && !stderr.includes('Warning')) {
        console.error('⚠️  Warning:', stderr);
    }

    // Check if backup file was created
    if (fs.existsSync(backupFile)) {
        const stats = fs.statSync(backupFile);
        const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log('✅ Backup completed successfully!');
        console.log(`📊 Backup size: ${fileSizeInMB} MB`);
        console.log(`📄 File: ${backupFile}\n`);

        // Clean up old backups (keep last 30 days)
        cleanOldBackups();
    } else {
        console.error('❌ Backup file was not created\n');
        process.exit(1);
    }
});

// Function to clean up old backups
function cleanOldBackups() {
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    fs.readdir(backupsDir, (err, files) => {
        if (err) {
            console.error('Error reading backups directory:', err);
            return;
        }

        let deletedCount = 0;
        files.forEach(file => {
            if (file.startsWith('wmc_backup_') && file.endsWith('.sql')) {
                const filePath = path.join(backupsDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < cutoffDate) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                    console.log(`🗑️  Deleted old backup: ${file}`);
                }
            }
        });

        if (deletedCount > 0) {
            console.log(`\n🧹 Cleaned up ${deletedCount} old backup(s)\n`);
        }
    });
}
