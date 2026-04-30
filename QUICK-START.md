# 🚀 Quick Start Guide - WMC Executive Private Hire

## ⚡ Get Running in 5 Minutes

### Step 1: Install Requirements (2 minutes)

**Node.js:**
- Download: https://nodejs.org/
- Install LTS version
- Verify: Open terminal and type `node --version`

**MySQL:**
- Windows: https://dev.mysql.com/downloads/installer/
- Mac: `brew install mysql && brew services start mysql`
- Linux: `sudo apt-get install mysql-server`

### Step 2: Setup Project (1 minute)

Open terminal in project folder:

```bash
# Install dependencies
npm install

# Copy environment file
copy .env.example .env
```

### Step 3: Configure (1 minute)

Edit `.env` file - change these lines:

```env
DB_PASSWORD=your_mysql_root_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
ADMIN_PASSWORD=YourSecurePassword123!
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Click "App passwords"
4. Generate password for "Mail"
5. Copy 16-character code to EMAIL_PASSWORD

### Step 4: Initialize Database (30 seconds)

```bash
npm run init-db
```

You'll see admin credentials - save them!

### Step 5: Start Server (30 seconds)

```bash
npm start
```

## ✅ You're Done!

Open in browser:
- **Website:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

## 🎯 Test It

1. Go to Contact page
2. Fill booking form
3. Submit
4. Check your email
5. Login to admin panel
6. See your booking!

## 🆘 Problems?

**Can't connect to database?**
- Make sure MySQL is running
- Check password in .env

**Emails not working?**
- Use Gmail app password (not regular password)
- Check spam folder

**Port 3000 in use?**
- Change PORT in .env to 3001

## 📚 Full Documentation

- **SETUP-README.md** - Complete setup guide
- **DEPLOYMENT-GUIDE.md** - Deploy to live domain

## 🎉 Next Steps

1. Change admin password (Settings in admin panel)
2. Update contact info in HTML files
3. Add your images to images/ folder
4. Test booking flow
5. Deploy to production!

---

**Need Help?**
- Email: help@wmcprivatehire.com
- Phone: +44 7501 073623
