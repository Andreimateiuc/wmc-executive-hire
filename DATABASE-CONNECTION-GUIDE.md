# 🔌 Connect to Your MySQL Database - Step by Step

## Step 1: Create .env File

1. **Copy the template file:**
   - Right-click on `.env.example` in your project folder
   - Select "Copy"
   - Right-click in the same folder
   - Select "Paste"
   - Rename the copy to `.env` (remove the .example part)

2. **Open .env file in a text editor** (Notepad, VS Code, etc.)

## Step 2: Configure Database Connection

Edit the `.env` file and update these lines with YOUR MySQL information:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration - CHANGE THESE!
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=wmc_executive_hire
DB_PORT=3306

# Email Configuration - CHANGE THESE!
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
EMAIL_FROM=WMC Executive Private Hire <your_email@gmail.com>
EMAIL_TO=help@wmcprivatehire.com

# Admin Dashboard - CHANGE THESE!
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
JWT_SECRET=your_random_secret_key_change_this

# Security
SESSION_SECRET=another_random_secret_change_this

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Step 3: Find Your MySQL Password

### If you just installed MySQL:
- The password is what you set during installation
- Usually it's the root password you created

### If you forgot your password:
1. Open MySQL Workbench or Command Prompt
2. Try logging in: `mysql -u root -p`
3. If it doesn't work, you may need to reset it

### To reset MySQL password (if needed):
**Windows:**
1. Stop MySQL service (Services → MySQL → Stop)
2. Open Command Prompt as Administrator
3. Run: `mysqld --skip-grant-tables`
4. Open another Command Prompt
5. Run: `mysql -u root`
6. Run: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';`
7. Run: `FLUSH PRIVILEGES;`
8. Restart MySQL service

## Step 4: Test MySQL Connection

Open Command Prompt and test:

```bash
mysql -u root -p
```

Enter your password. If it works, you'll see:
```
mysql>
```

Type `exit` to quit.

## Step 5: Initialize Database

Once your `.env` file is configured, run:

```bash
npm run init-db
```

You should see:
```
✓ Connected to MySQL server
✓ Schema file loaded
✓ Database and tables created successfully
✓ Default admin user created
  Username: admin
  Password: ChangeThisPassword123!
```

## Step 6: Start the Server

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════╗
║   WMC Executive Private Hire - Server Running  ║
╚════════════════════════════════════════════════╝

🚀 Server: http://localhost:3000
🌐 Website: http://localhost:3000
🔧 Admin Panel: http://localhost:3000/admin
📊 API Health: http://localhost:3000/api/health

📝 Environment: development
💾 Database: wmc_executive_hire
```

## 📁 Database Folder Structure

Your database files are located in the `database/` folder:

```
database/
├── schema.sql          # Database structure (tables, views, etc.)
├── config.js           # Database connection configuration
└── init-database.js    # Script to initialize database
```

## 🔍 Verify Database Connection

### Option 1: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to localhost
3. Look for database: `wmc_executive_hire`
4. You should see 7 tables:
   - bookings
   - customers
   - vehicles
   - services
   - contact_messages
   - admin_users
   - booking_notes

### Option 2: Using Command Line
```bash
mysql -u root -p
```

Then:
```sql
USE wmc_executive_hire;
SHOW TABLES;
```

You should see:
```
+--------------------------------+
| Tables_in_wmc_executive_hire   |
+--------------------------------+
| admin_users                    |
| booking_notes                  |
| bookings                       |
| contact_messages               |
| customers                      |
| services                       |
| vehicles                       |
+--------------------------------+
```

## 🎯 Quick Configuration Checklist

- [ ] Created `.env` file from `.env.example`
- [ ] Updated `DB_PASSWORD` with your MySQL password
- [ ] Updated `EMAIL_USER` with your Gmail address
- [ ] Updated `EMAIL_PASSWORD` with Gmail app password
- [ ] Updated `ADMIN_PASSWORD` with a secure password
- [ ] Ran `npm run init-db` successfully
- [ ] Started server with `npm start`
- [ ] Verified database exists in MySQL

## 🆘 Common Issues

### Error: "Access denied for user 'root'@'localhost'"
**Solution:** Wrong password in `.env` file. Update `DB_PASSWORD`

### Error: "Cannot connect to MySQL server"
**Solution:** MySQL service not running. Start it:
- Windows: Services → MySQL → Start
- Mac: `brew services start mysql`
- Linux: `sudo systemctl start mysql`

### Error: "Database 'wmc_executive_hire' doesn't exist"
**Solution:** Run `npm run init-db` to create it

### Error: "Port 3000 already in use"
**Solution:** Change `PORT=3001` in `.env` file

## 📧 Gmail App Password Setup

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "WMC Executive Hire"
6. Click "Generate"
7. Copy the 16-character password
8. Paste it as `EMAIL_PASSWORD` in `.env`

## ✅ Success Indicators

When everything is working:
1. ✅ Server starts without errors
2. ✅ You can access http://localhost:3000
3. ✅ You can login to http://localhost:3000/admin
4. ✅ Booking form submissions work
5. ✅ Emails are sent successfully

## 📞 Need Help?

If you're still having issues:
1. Check the error message in the terminal
2. Verify MySQL is running
3. Double-check `.env` file settings
4. Make sure all passwords are correct
5. Try restarting MySQL service

---

**Your database folder exists at:** `c:/Users/matei/Desktop/wmc-executive-hire/database/`

**Files in database folder:**
- `schema.sql` - Creates all tables and structure
- `config.js` - Handles MySQL connection
- `init-database.js` - Initialization script

**Next step:** Create your `.env` file and configure it with your MySQL password!
