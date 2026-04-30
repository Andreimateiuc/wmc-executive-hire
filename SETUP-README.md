# WMC Executive Private Hire - Complete Setup Guide

🚗 **Premium Private Hire Booking System with Database & Admin Dashboard**

## 🎯 What You Have

A complete, production-ready website with:

✅ **Frontend Website**
- 6 professional HTML pages (Home, About, Services, Fleet, Prices, Contact)
- Responsive design (mobile-friendly)
- Booking form with validation
- WhatsApp integration
- SEO optimized

✅ **Backend System**
- Node.js/Express server
- RESTful API endpoints
- Form submission handling
- Email notifications (customer + admin)
- Security features (rate limiting, CORS, helmet)

✅ **Database**
- MySQL database with complete schema
- Tables for bookings, customers, messages, admin users
- Automatic booking reference generation
- Data relationships and indexes

✅ **Admin Dashboard**
- Secure login system
- Real-time statistics
- Booking management
- Customer database
- Message inbox
- Password management

✅ **Email System**
- Automated booking confirmations
- Admin notifications
- Contact form auto-replies
- Professional HTML email templates

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Requirements

**Install Node.js:**
- Download from [nodejs.org](https://nodejs.org/)
- Choose LTS version (v18 or higher)
- Verify: `node --version`

**Install MySQL:**
- Windows: [MySQL Installer](https://dev.mysql.com/downloads/installer/)
- Mac: `brew install mysql`
- Linux: `sudo apt-get install mysql-server`

### Step 2: Setup Project

```bash
# Navigate to project folder
cd c:/Users/matei/Desktop/wmc-executive-hire

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Step 3: Configure Environment

Edit `.env` file with your settings:

```env
# Database (use your MySQL credentials)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=wmc_executive_hire

# Email (use Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_TO=help@wmcprivatehire.com

# Admin (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ChangeMe123!
```

**📧 Gmail Setup:**
1. Go to [Google Account](https://myaccount.google.com/)
2. Security → 2-Step Verification → Enable
3. App passwords → Generate for "Mail"
4. Copy 16-character password to `EMAIL_PASSWORD`

### Step 4: Initialize Database

```bash
npm run init-db
```

You'll see:
```
✓ Database and tables created successfully
✓ Default admin user created
  Username: admin
  Password: ChangeMe123!
```

### Step 5: Start Server

```bash
npm start
```

Visit:
- 🌐 Website: http://localhost:3000
- 🔧 Admin: http://localhost:3000/admin

---

## 📁 Project Structure

```
wmc-executive-hire/
├── 📄 index.html              # Homepage
├── 📄 about.html              # About page
├── 📄 services.html           # Services page
├── 📄 fleet.html              # Fleet page
├── 📄 prices.html             # Pricing page
├── 📄 contact.html            # Contact/Booking page
│
├── 📁 css/
│   └── styles.css             # Main stylesheet
│
├── 📁 js/
│   └── main.js                # Frontend JavaScript
│
├── 📁 images/                 # Website images
│
├── 📁 admin/                  # Admin Dashboard
│   ├── login.html             # Admin login page
│   ├── index.html             # Dashboard
│   ├── admin-styles.css       # Dashboard styles
│   └── admin-script.js        # Dashboard logic
│
├── 📁 database/               # Database files
│   ├── schema.sql             # Database structure
│   ├── config.js              # DB connection
│   └── init-database.js       # Setup script
│
├── 📁 routes/                 # API routes
│   ├── bookings.js            # Booking endpoints
│   ├── contact.js             # Contact endpoints
│   └── admin.js               # Admin endpoints
│
├── 📁 controllers/            # Business logic
│   ├── bookingController.js   # Booking operations
│   ├── contactController.js   # Contact operations
│   └── adminController.js     # Admin operations
│
├── 📁 middleware/             # Express middleware
│   └── auth.js                # Authentication
│
├── 📁 utils/                  # Utilities
│   └── emailService.js        # Email sending
│
├── 📄 server.js               # Main server file
├── 📄 package.json            # Dependencies
├── 📄 .env.example            # Environment template
├── 📄 DEPLOYMENT-GUIDE.md     # Deployment instructions
└── 📄 SETUP-README.md         # This file
```

---

## 🔧 Configuration Details

### Database Tables

**bookings** - Customer booking requests
- Booking reference (auto-generated)
- Customer details
- Journey information
- Status tracking
- Special requests

**customers** - Customer database
- Contact information
- Booking history
- Auto-created on first booking

**contact_messages** - General inquiries
- Message content
- Status (new/read/replied)
- Timestamp

**admin_users** - Admin accounts
- Secure password hashing
- Role-based access
- Login tracking

**vehicles** - Fleet information
- Pre-populated with Mercedes fleet
- Capacity and features

**services** - Service types
- Pre-populated service catalog
- Base pricing

### API Endpoints

**Public Endpoints:**
```
POST   /api/bookings          # Create booking
GET    /api/bookings/:ref     # Get booking by reference
POST   /api/contact           # Send contact message
GET    /api/health            # Health check
```

**Admin Endpoints (Protected):**
```
POST   /api/admin/login                    # Admin login
POST   /api/admin/logout                   # Admin logout
GET    /api/admin/auth/check               # Check auth status
GET    /api/admin/dashboard/stats          # Dashboard statistics
GET    /api/admin/bookings/recent          # Recent bookings
GET    /api/admin/bookings/date-range      # Bookings by date
PATCH  /api/bookings/:id/status            # Update booking status
GET    /api/contact                        # Get all messages
PATCH  /api/contact/:id/status             # Update message status
POST   /api/admin/change-password          # Change password
```

---

## 🎨 Customization

### Update Contact Information

**In HTML files:**
Search and replace:
- `+447501073623` → Your phone number
- `help@wmcprivatehire.com` → Your email

**In .env file:**
```env
EMAIL_TO=your_business_email@gmail.com
```

### Update Prices

Edit `prices.html`:
```html
<div class="price-value">£XX</div>
```

### Add/Change Images

Place images in `images/` folder:
- `hero-background.jpg` - Homepage hero
- `mercedes-e-class.jpeg` - E-Class
- `mercedes-s-class.jpeg` - S-Class
- `mercedes-v-class.jpg` - V-Class
- Other service/about images

### Modify Colors

Edit `css/styles.css`:
```css
:root {
    --color-black: #000000;
    --color-gold: #D4AF37;
    --color-silver: #C0C0C0;
}
```

---

## 🧪 Testing

### Test Booking Flow

1. Go to http://localhost:3000/contact
2. Fill out booking form
3. Submit
4. Check email for confirmation
5. Login to admin panel
6. View booking in dashboard

### Test Admin Dashboard

1. Go to http://localhost:3000/admin
2. Login with credentials from init-db
3. View dashboard statistics
4. Check bookings section
5. Test status updates
6. Change password in settings

### Test Email Notifications

Emails sent automatically:
- ✉️ Customer booking confirmation
- ✉️ Admin booking notification
- ✉️ Contact form auto-reply
- ✉️ Admin contact notification

---

## 🚀 Deployment

### Option 1: Heroku (Easiest)

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create wmc-executive-hire

# Add MySQL
heroku addons:create jawsdb:kitefin

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set EMAIL_USER=your_email@gmail.com
# ... (see DEPLOYMENT-GUIDE.md)

# Deploy
git init
git add .
git commit -m "Initial deployment"
git push heroku main

# Initialize database
heroku run npm run init-db

# Open site
heroku open
```

### Option 2: DigitalOcean

See detailed instructions in `DEPLOYMENT-GUIDE.md`

### Option 3: Shared Hosting

See cPanel setup in `DEPLOYMENT-GUIDE.md`

---

## 🔒 Security

### Default Security Features

✅ Password hashing (bcrypt)
✅ JWT authentication
✅ Session management
✅ Rate limiting (100 requests/15min)
✅ CORS protection
✅ Helmet security headers
✅ SQL injection prevention
✅ XSS protection

### Important Security Steps

1. **Change Default Password:**
   - Login to admin panel
   - Go to Settings
   - Change password immediately

2. **Use Strong Secrets:**
   ```env
   JWT_SECRET=$(openssl rand -base64 32)
   SESSION_SECRET=$(openssl rand -base64 32)
   ```

3. **Enable HTTPS:**
   - Use Let's Encrypt (free)
   - Or hosting provider's SSL

4. **Regular Updates:**
   ```bash
   npm update
   npm audit fix
   ```

---

## 📊 Admin Dashboard Features

### Dashboard
- Total bookings count
- Pending bookings
- Today's bookings
- Total customers
- Unread messages
- Monthly revenue
- Recent bookings list

### Bookings Management
- View all bookings
- Filter by status/date
- Update booking status
- View customer details
- Booking reference tracking

### Customer Database
- All customer records
- Contact information
- Booking history

### Messages
- Contact form submissions
- Mark as read/replied
- Filter by status

### Settings
- Change admin password
- Account management

---

## 🐛 Troubleshooting

### Server Won't Start

**Error: Port 3000 already in use**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Error: Cannot connect to database**
- Check MySQL is running
- Verify credentials in `.env`
- Test: `mysql -u root -p`

### Emails Not Sending

- Verify Gmail app password
- Check spam folder
- Test email settings:
```javascript
// In utils/emailService.js
console.log('Email config:', {
    host: process.env.EMAIL_HOST,
    user: process.env.EMAIL_USER
});
```

### Admin Login Issues

- Clear browser cache
- Check admin user exists:
```sql
SELECT * FROM admin_users;
```
- Reset password:
```bash
npm run init-db
```

### Database Errors

**Error: Table doesn't exist**
```bash
npm run init-db
```

**Error: Access denied**
```sql
GRANT ALL PRIVILEGES ON wmc_executive_hire.* TO 'user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 📈 Next Steps

### After Setup

1. ✅ Test all functionality locally
2. ✅ Customize content and images
3. ✅ Update contact information
4. ✅ Configure email settings
5. ✅ Change admin password
6. ✅ Deploy to production
7. ✅ Setup domain and SSL
8. ✅ Configure Google Analytics
9. ✅ Submit to Google Search Console
10. ✅ Setup regular backups

### Optional Enhancements

- Payment integration (Stripe/PayPal)
- SMS notifications (Twilio)
- Real-time chat (Socket.io)
- Customer portal
- Driver app
- Advanced analytics
- Multi-language support
- Booking calendar view

---

## 📞 Support

**Business Contact:**
- Phone: +44 7501 073623
- Email: help@wmcprivatehire.com
- WhatsApp: [Message Us](https://wa.me/447501073623)

**Technical Issues:**
- Check `DEPLOYMENT-GUIDE.md`
- Review error logs
- Test database connection
- Verify environment variables

---

## 📝 Maintenance

### Daily
- Check new bookings
- Respond to messages
- Monitor email delivery

### Weekly
- Review booking statistics
- Check error logs
- Backup database

### Monthly
- Update dependencies: `npm update`
- Review security patches
- Test all features
- Update content

### Quarterly
- Update Node.js version
- Review and update prices
- Check SSL certificate
- Performance optimization

---

## 📚 Documentation

- **DEPLOYMENT-GUIDE.md** - Complete deployment instructions
- **README.md** - Original website documentation
- **database/schema.sql** - Database structure
- **API Documentation** - See routes/ folder comments

---

## 🎉 You're Ready!

Your complete booking system is ready to use:

1. ✅ Professional website
2. ✅ Working database
3. ✅ Admin dashboard
4. ✅ Email notifications
5. ✅ Secure authentication
6. ✅ Ready for deployment

**Start the server and begin accepting bookings!**

```bash
npm start
```

Then visit: http://localhost:3000

---

**Version:** 1.0.0  
**Created:** 2024  
**Developer:** BLACKBOXAI  
**License:** Proprietary - WMC Executive Private Hire
