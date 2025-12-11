# WMC Executive Private Hire - Deployment Package

## 🚀 Quick Deployment Guide

This package contains everything you need to deploy your website.

### Step 1: Extract Files
Extract this ZIP to your desired location.

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### Step 4: Initialize Database
```bash
npm run init-db
npm run add-admin
```

### Step 5: Start Server
```bash
# Development
npm start

# Production
npm run prod
# OR
pm2 start ecosystem.config.js --env production
```

## 📚 Documentation

- **START-HERE.md** - Quick start guide
- **PRODUCTION-DEPLOYMENT.md** - Complete deployment instructions
- **FINAL-PRODUCTION-CHECKLIST.md** - Pre-deployment checklist

## 📞 Support

- Email: wmctransportltd@gmail.com
- Phone: +44 7501 073623

## ✅ Package Contents

- ✅ All source code files
- ✅ Database schema (database/schema.sql)
- ✅ Configuration files
- ✅ Admin panel
- ✅ Security middleware
- ✅ Logging system
- ✅ Caching layer
- ✅ Backup scripts
- ✅ Complete documentation

**Status:** Production Ready
**Version:** 1.0
**Date:** 2025-12-05
