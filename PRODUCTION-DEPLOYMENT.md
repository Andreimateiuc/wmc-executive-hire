# WMC Executive Private Hire - Production Deployment Guide

## 🚀 Complete Production Deployment Package

This guide covers deploying your fully optimized and secured WMC Executive Private Hire website to a live production server.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] `.env` file configured with production values
- [ ] All secrets are strong and unique (JWT_SECRET, SESSION_SECRET)
- [ ] Database credentials are secure
- [ ] Email service configured and tested
- [ ] CORS origins set to your actual domain
- [ ] NODE_ENV set to 'production'

### 2. Security Verification
- [ ] No hardcoded secrets in code
- [ ] All admin routes protected with authentication
- [ ] Rate limiting configured
- [ ] Input sanitization enabled
- [ ] HTTPS/SSL certificate ready
- [ ] Security headers configured

### 3. Database
- [ ] Database backup created
- [ ] Schema initialized
- [ ] Admin user created
- [ ] Test data removed

### 4. Dependencies
- [ ] All npm packages installed
- [ ] No security vulnerabilities (`npm audit`)
- [ ] Production dependencies only

---

## 📦 Installation Steps

### Step 1: Install Production Dependencies

```bash
# Install all dependencies
npm install --production

# Or if you need dev dependencies for build
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with production values
nano .env
```

**Critical Environment Variables:**

```env
NODE_ENV=production
PORT=3000

# Database (use your production database)
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=strong-password-here
DB_NAME=wmc_executive_hire

# Security (generate new secrets!)
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS (your actual domain)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Step 3: Initialize Database

```bash
# Run database initialization
npm run init-db

# Create admin user
npm run add-admin
```

### Step 4: Test Locally

```bash
# Start in production mode
npm run prod

# Or use PM2
pm2 start ecosystem.config.js --env production
```

Visit: http://localhost:3000/api/health

Expected response:
```json
{
  "status": "OK",
  "database": "connected",
  "cache": { "enabled": true },
  "environment": "production"
}
```

---

## 🌐 Deployment Options

### Option 1: VPS/Dedicated Server (Recommended)

#### A. DigitalOcean/Linode/Vultr

**1. Create Droplet/Server**
- Ubuntu 22.04 LTS
- Minimum 1GB RAM
- SSH access configured

**2. Connect and Setup**

```bash
# Connect via SSH
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install MySQL
apt install -y mysql-server
mysql_secure_installation

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx

# Install Certbot for SSL
apt install -y certbot python3-certbot-nginx
```

**3. Setup MySQL Database**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE wmc_executive_hire CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'wmc_user'@'localhost' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON wmc_executive_hire.* TO 'wmc_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**4. Deploy Application**

```bash
# Create application directory
mkdir -p /var/www/wmc-executive-hire
cd /var/www/wmc-executive-hire

# Clone or upload your files
# Option A: Git
git clone your-repository-url .

# Option B: Upload via SCP from local machine
# scp -r /path/to/project/* root@your-server-ip:/var/www/wmc-executive-hire/

# Install dependencies
npm install --production

# Create .env file
nano .env
# (paste your production environment variables)

# Initialize database
npm run init-db

# Create admin user
npm run add-admin
```

**5. Configure PM2**

```bash
# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# (follow the command it outputs)

# Monitor
pm2 monit
```

**6. Configure Nginx**

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/wmc-executive-hire
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Root directory
    root /var/www/wmc-executive-hire;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/wmc-access.log;
    error_log /var/log/nginx/wmc-error.log;
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/wmc-executive-hire /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

**7. Setup SSL with Let's Encrypt**

```bash
# Obtain SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

**8. Setup Firewall**

```bash
# Configure UFW
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

**9. Setup Automated Backups**

```bash
# Create backup script
nano /usr/local/bin/backup-wmc.sh
```

```bash
#!/bin/bash
cd /var/www/wmc-executive-hire
npm run backup-db
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-wmc.sh

# Add to crontab (daily at 2 AM)
crontab -e
```

Add line:
```
0 2 * * * /usr/local/bin/backup-wmc.sh
```

---

### Option 2: Heroku

**1. Install Heroku CLI**

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login
```

**2. Create Heroku App**

```bash
# Create app
heroku create wmc-executive-hire

# Add MySQL database
heroku addons:create jawsdb:kitefin

# Get database URL
heroku config:get JAWSDB_URL
```

**3. Configure Environment**

```bash
# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set SESSION_SECRET=$(openssl rand -base64 32)
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
# ... add all other variables
```

**4. Deploy**

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Production deployment"

# Add Heroku remote
heroku git:remote -a wmc-executive-hire

# Deploy
git push heroku main

# Initialize database
heroku run npm run init-db

# Open app
heroku open
```

**5. Add Custom Domain**

```bash
heroku domains:add www.yourdomain.com
heroku domains:add yourdomain.com

# Configure DNS at your registrar
# Add CNAME: www → your-app.herokuapp.com
# Add ALIAS: @ → your-app.herokuapp.com
```

---

### Option 3: Shared Hosting (cPanel)

**Requirements:**
- Node.js support
- SSH access
- MySQL database

**Steps:**

1. **Upload Files**
   - Use FTP or cPanel File Manager
   - Upload to `public_html` or subdirectory

2. **Setup Node.js App** (in cPanel)
   - Go to "Setup Node.js App"
   - Create application
   - Set entry point: `server.js`
   - Install dependencies

3. **Create Database**
   - Use cPanel MySQL Database Wizard
   - Create database and user
   - Note credentials

4. **Configure .env**
   - Create `.env` file
   - Add production settings

5. **Initialize Database**
   - SSH into server
   - Run: `npm run init-db`

6. **Start Application**
   - In cPanel Node.js App section
   - Click "Start"

---

## 🔒 Post-Deployment Security

### 1. Change Default Credentials

```bash
# Login to admin panel
# Go to Settings → Change Password
# Use strong password (16+ characters)
```

### 2. Enable Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Setup Error Tracking (Optional)

- Sign up for Sentry.io
- Add DSN to `.env`
- Restart application

### 4. Regular Maintenance

```bash
# Weekly tasks
- Check logs: pm2 logs
- Review bookings
- Check disk space: df -h
- Update dependencies: npm update

# Monthly tasks
- Review security: npm audit
- Check SSL expiry: certbot certificates
- Database optimization
- Backup verification
```

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Application logs
pm2 logs wmc-executive-hire

# Nginx logs
tail -f /var/log/nginx/wmc-access.log
tail -f /var/log/nginx/wmc-error.log

# Application logs (custom)
npm run logs
npm run logs:error
```

### Monitor Performance

```bash
# PM2 monitoring
pm2 monit

# System resources
htop

# Database
mysql -u wmc_user -p -e "SHOW PROCESSLIST;"
```

---

## 🆘 Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs

# Check environment
pm2 env 0

# Restart
pm2 restart wmc-executive-hire
```

### Database Connection Failed

```bash
# Test connection
mysql -u wmc_user -p wmc_executive_hire

# Check .env file
cat .env | grep DB_

# Verify user permissions
mysql -u root -p -e "SHOW GRANTS FOR 'wmc_user'@'localhost';"
```

### 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx configuration
nginx -t

# Restart services
pm2 restart all
systemctl restart nginx
```

---

## 📞 Support

For deployment assistance:
- Email: help@wmcprivatehire.com
- Phone: +44 7501 073623

---

**Deployment completed successfully! 🎉**

Your WMC Executive Private Hire website is now live and ready to accept bookings!
