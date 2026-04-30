# WMC Executive Private Hire - Deployment Guide

Complete guide to deploy your website with database to a live domain.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Local Testing](#local-testing)
5. [Domain Deployment Options](#domain-deployment-options)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** (optional but recommended) - [Download](https://git-scm.com/)

### Required Accounts
- Domain registrar account (GoDaddy, Namecheap, etc.)
- Hosting service account (choose one):
  - **Heroku** (easiest, free tier available)
  - **DigitalOcean** (more control, $5/month)
  - **AWS** (scalable, pay-as-you-go)
  - **Shared hosting with Node.js support** (varies)

---

## Database Setup

### Step 1: Install MySQL

**Windows:**
1. Download MySQL Installer from [mysql.com](https://dev.mysql.com/downloads/installer/)
2. Run installer and choose "Developer Default"
3. Set root password (remember this!)
4. Complete installation

**Mac:**
```bash
brew install mysql
brew services start mysql
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

### Step 2: Create Database User

Open MySQL command line:
```bash
mysql -u root -p
```

Create database user:
```sql
CREATE USER 'wmc_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON wmc_executive_hire.* TO 'wmc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## Environment Configuration

### Step 1: Install Dependencies

Open terminal in project directory:
```bash
npm install
```

### Step 2: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` file with your settings:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=wmc_user
DB_PASSWORD=your_secure_password
DB_NAME=wmc_executive_hire
DB_PORT=3306

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=WMC Executive Private Hire <your_email@gmail.com>
EMAIL_TO=help@wmcprivatehire.com

# Admin Dashboard
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeThisPassword123!
JWT_SECRET=your_random_secret_key_here

# Security
SESSION_SECRET=another_random_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 3: Gmail Setup (for email notifications)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Step Verification
3. Generate App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
   - Use this as `EMAIL_PASSWORD` in `.env`

### Step 4: Initialize Database

Run the database initialization script:
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

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

---

## Local Testing

### Step 1: Start the Server

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
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

### Step 2: Test the Website

1. **Homepage:** http://localhost:3000
2. **Contact Form:** http://localhost:3000/contact
   - Fill out and submit a test booking
   - Check your email for confirmation

3. **Admin Panel:** http://localhost:3000/admin/login
   - Login with credentials from initialization
   - View the test booking in dashboard
   - Change admin password in Settings

### Step 3: Verify Database

Check if data is being stored:
```bash
mysql -u wmc_user -p wmc_executive_hire
```

```sql
SELECT * FROM bookings;
SELECT * FROM customers;
SELECT * FROM contact_messages;
```

---

## Domain Deployment Options

### Option 1: Heroku (Recommended for Beginners)

#### Prerequisites
- Heroku account: [signup.heroku.com](https://signup.heroku.com/)
- Heroku CLI: [devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

#### Steps

1. **Login to Heroku:**
```bash
heroku login
```

2. **Create Heroku App:**
```bash
heroku create wmc-executive-hire
```

3. **Add MySQL Database:**
```bash
heroku addons:create jawsdb:kitefin
```

4. **Get Database Credentials:**
```bash
heroku config:get JAWSDB_URL
```

This returns a URL like:
```
mysql://username:password@hostname:port/database_name
```

5. **Set Environment Variables:**
```bash
heroku config:set NODE_ENV=production
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=your_email@gmail.com
heroku config:set EMAIL_PASSWORD=your_app_password
heroku config:set EMAIL_FROM="WMC Executive <your_email@gmail.com>"
heroku config:set EMAIL_TO=help@wmcprivatehire.com
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=SecurePassword123!
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
```

6. **Create Procfile:**
```bash
echo "web: node server.js" > Procfile
```

7. **Deploy:**
```bash
git init
git add .
git commit -m "Initial deployment"
heroku git:remote -a wmc-executive-hire
git push heroku main
```

8. **Initialize Database:**
```bash
heroku run npm run init-db
```

9. **Open Your Site:**
```bash
heroku open
```

10. **Connect Custom Domain:**
```bash
heroku domains:add www.yourdomain.com
heroku domains:add yourdomain.com
```

Then update your domain's DNS settings:
- Add CNAME record: `www` → `your-app.herokuapp.com`
- Add ALIAS/ANAME record: `@` → `your-app.herokuapp.com`

---

### Option 2: DigitalOcean Droplet

#### Prerequisites
- DigitalOcean account
- SSH key setup

#### Steps

1. **Create Droplet:**
   - Choose Ubuntu 22.04 LTS
   - Select $5/month plan
   - Add SSH key
   - Create droplet

2. **Connect to Droplet:**
```bash
ssh root@your_droplet_ip
```

3. **Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. **Install MySQL:**
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

5. **Setup MySQL:**
```bash
sudo mysql
```
```sql
CREATE DATABASE wmc_executive_hire;
CREATE USER 'wmc_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON wmc_executive_hire.* TO 'wmc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

6. **Clone Your Project:**
```bash
cd /var/www
git clone your_repository_url wmc-executive-hire
cd wmc-executive-hire
```

7. **Install Dependencies:**
```bash
npm install
```

8. **Create .env File:**
```bash
nano .env
```
(Paste your production environment variables)

9. **Initialize Database:**
```bash
npm run init-db
```

10. **Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
pm2 start server.js --name wmc-executive
pm2 startup
pm2 save
```

11. **Install Nginx:**
```bash
sudo apt-get install nginx
```

12. **Configure Nginx:**
```bash
sudo nano /etc/nginx/sites-available/wmc-executive
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

13. **Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/wmc-executive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

14. **Setup SSL (Free with Let's Encrypt):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

15. **Point Domain to Droplet:**
   - In your domain registrar, update DNS:
   - A Record: `@` → `your_droplet_ip`
   - A Record: `www` → `your_droplet_ip`

---

### Option 3: Shared Hosting (cPanel)

#### Prerequisites
- Shared hosting with Node.js support
- cPanel access

#### Steps

1. **Upload Files:**
   - Use FTP or cPanel File Manager
   - Upload all project files to `public_html` or subdirectory

2. **Setup Node.js App (in cPanel):**
   - Go to "Setup Node.js App"
   - Create new application
   - Node.js version: 14 or higher
   - Application root: `/home/username/public_html`
   - Application URL: your domain
   - Application startup file: `server.js`

3. **Setup MySQL Database:**
   - Go to "MySQL Databases" in cPanel
   - Create database: `username_wmc`
   - Create user with password
   - Add user to database with all privileges

4. **Import Database Schema:**
   - Go to phpMyAdmin
   - Select your database
   - Import `database/schema.sql`

5. **Configure Environment:**
   - Create `.env` file via File Manager
   - Add production settings with cPanel database credentials

6. **Install Dependencies:**
   - Use cPanel Terminal or SSH:
   ```bash
   cd public_html
   npm install
   ```

7. **Start Application:**
   - In Node.js App section, click "Start"

---

## Post-Deployment

### 1. Security Checklist

- [ ] Change default admin password
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL certificate
- [ ] Set secure session secrets
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Regular backups setup

### 2. Test Everything

- [ ] Homepage loads correctly
- [ ] All pages accessible
- [ ] Contact form submits successfully
- [ ] Email notifications working
- [ ] Admin login works
- [ ] Admin dashboard displays data
- [ ] Booking creation works
- [ ] Mobile responsive

### 3. SEO Setup

1. **Google Search Console:**
   - Add property: yourdomain.com
   - Verify ownership
   - Submit sitemap

2. **Google Analytics:**
   - Create property
   - Add tracking code to all pages

3. **Google My Business:**
   - Create business listing
   - Add location and contact info

### 4. Monitoring

Set up monitoring for:
- Server uptime
- Database performance
- Email delivery
- Error logs

Recommended tools:
- UptimeRobot (free uptime monitoring)
- LogRocket (error tracking)
- Google Analytics (traffic monitoring)

### 5. Backup Strategy

**Daily Backups:**
```bash
# Database backup script
mysqldump -u wmc_user -p wmc_executive_hire > backup_$(date +%Y%m%d).sql
```

**Automated Backups:**
- Use hosting provider's backup service
- Or setup cron job for daily backups
- Store backups off-site (Google Drive, Dropbox)

---

## Troubleshooting

### Database Connection Issues

**Error:** `ER_ACCESS_DENIED_ERROR`
- Check database credentials in `.env`
- Verify user has correct privileges
- Test connection: `mysql -u username -p`

**Error:** `ECONNREFUSED`
- MySQL service not running
- Start MySQL: `sudo systemctl start mysql`

### Email Not Sending

- Verify Gmail app password is correct
- Check EMAIL_HOST and EMAIL_PORT
- Enable "Less secure app access" (if not using app password)
- Check spam folder

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 PID
```

### Admin Login Not Working

- Clear browser cache and cookies
- Check session secret is set
- Verify admin user exists in database:
```sql
SELECT * FROM admin_users;
```

### 500 Internal Server Error

- Check server logs: `pm2 logs` or `heroku logs --tail`
- Verify all environment variables are set
- Check database connection
- Ensure all dependencies installed

---

## Support

For issues or questions:
- Email: help@wmcprivatehire.com
- Phone: +44 7501 073623

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check booking requests
- Review error logs
- Monitor email delivery

**Monthly:**
- Database backup
- Update dependencies: `npm update`
- Review security patches

**Quarterly:**
- Update Node.js version
- Review and update prices
- Check SSL certificate expiry

---

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Heroku Dev Center](https://devcenter.heroku.com/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Author:** BLACKBOXAI
