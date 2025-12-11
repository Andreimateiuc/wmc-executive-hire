# 🔧 Using XAMPP with WMC Executive Private Hire

## Perfect! XAMPP Setup is Easy!

XAMPP includes MySQL (MariaDB), so you don't need to install MySQL separately.

## 📋 Step-by-Step XAMPP Setup:

### Step 1: Start XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** next to **Apache** (for web server)
3. Click **Start** next to **MySQL** (for database)
4. Both should show green "Running" status

### Step 2: Configure .env File for XAMPP

Your `.env` file is already created. Update it with these XAMPP-specific settings:

```env
# Database Configuration for XAMPP
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=wmc_executive_hir
DB_PORT=3306
```

**Important Notes:**
- XAMPP's default MySQL user is `root`
- XAMPP's default MySQL password is **empty** (blank)
- So `DB_PASSWORD=` should be left empty (no password)

### Step 3: Access phpMyAdmin (Optional - to view database)

1. Open browser
2. Go to: http://localhost/phpmyadmin
3. You'll see your databases here after initialization

### Step 4: Initialize Database

Open Command Prompt in your project folder and run:

```bash
npm run init-db
```

You should see:
```
✓ Connected to MySQL server
✓ Database and tables created successfully
✓ Default admin user created
```

### Step 5: Start Your Server

```bash
npm start
```

You should see:
```
╔════════════════════════════════════════════════╗
║   WMC Executive Private Hire - Server Running  ║
╚════════════════════════════════════════════════╝

🚀 Server: http://localhost:3000
```

### Step 6: Access Your Website

- **Website:** http://localhost:3000
- **Admin Panel:** http://localhost:3000/admin
- **phpMyAdmin:** http://localhost/phpmyadmin (to view database)

## 🎯 XAMPP Configuration Summary:

```env
# Your .env file for XAMPP:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # Leave empty for XAMPP default
DB_NAME=wmc_executive_hire
DB_PORT=3306
```

## 🔍 Verify Database in phpMyAdmin:

After running `npm run init-db`, check phpMyAdmin:

1. Go to http://localhost/phpmyadmin
2. Look for database: `wmc_executive_hire`
3. Click on it
4. You should see 7 tables:
   - admin_users
   - booking_notes
   - bookings
   - contact_messages
   - customers
   - services
   - vehicles

## 🆘 Common XAMPP Issues:

### Issue 1: Port 3306 Already in Use
**Solution:** Another MySQL is running. Stop it or change XAMPP MySQL port:
1. XAMPP Control Panel → MySQL Config → my.ini
2. Change port from 3306 to 3307
3. Update `.env`: `DB_PORT=3307`

### Issue 2: Port 80 Already in Use (Apache)
**Solution:** Change Apache port:
1. XAMPP Control Panel → Apache Config → httpd.conf
2. Change `Listen 80` to `Listen 8080`
3. Access phpMyAdmin at: http://localhost:8080/phpmyadmin

### Issue 3: MySQL Won't Start
**Solution:**
1. Close Skype (uses port 3306)
2. Stop other MySQL services
3. Restart XAMPP as Administrator

### Issue 4: "Access Denied" Error
**Solution:** 
- Make sure `DB_PASSWORD=` is empty (no password)
- XAMPP default has no password for root user

## 📊 XAMPP vs Standalone MySQL:

**XAMPP Advantages:**
✅ Easy to install (one package)
✅ Includes phpMyAdmin (visual database manager)
✅ No password setup needed
✅ Easy to start/stop services
✅ Perfect for development

**Configuration Difference:**
- **Standalone MySQL:** Usually requires password
- **XAMPP MySQL:** No password by default

## 🔐 Security Note:

For production/live website:
1. Set a MySQL password in XAMPP
2. Update `.env` with the password
3. Use proper hosting (not XAMPP)

## ✅ Quick Checklist:

- [ ] XAMPP installed
- [ ] Apache started (green in XAMPP)
- [ ] MySQL started (green in XAMPP)
- [ ] `.env` file configured (DB_PASSWORD empty)
- [ ] Ran `npm run init-db`
- [ ] Ran `npm start`
- [ ] Website accessible at http://localhost:3000
- [ ] Can login to admin panel
- [ ] Database visible in phpMyAdmin

## 🎉 You're Ready!

With XAMPP running:
1. Your MySQL database is at: localhost:3306
2. Your website runs at: http://localhost:3000
3. phpMyAdmin at: http://localhost/phpmyadmin
4. Admin panel at: http://localhost:3000/admin

**XAMPP makes it super easy - no complex MySQL installation needed!**

---

## 📞 Need Help?

If you see any errors:
1. Make sure XAMPP MySQL is running (green)
2. Check `.env` has `DB_PASSWORD=` (empty)
3. Try accessing http://localhost/phpmyadmin
4. Check XAMPP error logs in Control Panel
