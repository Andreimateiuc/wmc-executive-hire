# 🎯 WMC Executive Private Hire - Final Production Checklist

## ✅ PRODUCTION READINESS VERIFICATION

Use this checklist before deploying to ensure everything is configured correctly.

---

## 📋 Phase 1: Pre-Deployment Verification

### Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `NODE_ENV` set to `production`
- [ ] `PORT` configured (default: 3000)
- [ ] All required environment variables set
- [ ] No default/placeholder values in production `.env`

### Security Configuration
- [ ] `JWT_SECRET` is unique and strong (32+ characters)
- [ ] `SESSION_SECRET` is unique and strong (32+ characters)
- [ ] Database password is strong
- [ ] `ALLOWED_ORIGINS` set to actual domain(s)
- [ ] No hardcoded secrets in code
- [ ] Admin default password will be changed after first login

### Database Setup
- [ ] MySQL server installed and running
- [ ] Database created: `wmc_executive_hire`
- [ ] Database user created with proper permissions
- [ ] Database credentials in `.env` are correct
- [ ] Schema initialized: `npm run init-db`
- [ ] Admin user created: `npm run add-admin`
- [ ] Test data removed (if any)

### Email Configuration
- [ ] Email service configured (Gmail/SMTP)
- [ ] App-specific password generated (for Gmail)
- [ ] `EMAIL_HOST`, `EMAIL_PORT` configured
- [ ] `EMAIL_USER`, `EMAIL_PASSWORD` set
- [ ] `EMAIL_FROM`, `EMAIL_TO` configured
- [ ] Test email sent successfully

### Dependencies
- [ ] All npm packages installed: `npm install`
- [ ] No security vulnerabilities: `npm audit`
- [ ] Production dependencies only (or dev deps for build)
- [ ] Node.js version >= 14.0.0
- [ ] MySQL version >= 5.7

---

## 📋 Phase 2: Code Verification

### Security Features
- [ ] All admin routes protected with `authMiddleware`
- [ ] Rate limiting configured on all forms
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection enabled
- [ ] CORS properly configured
- [ ] Helmet security headers active
- [ ] Session security configured

### Logging & Monitoring
- [ ] Winston logger configured
- [ ] Log files directory created: `logs/`
- [ ] Error logging functional
- [ ] Request logging enabled
- [ ] Admin action logging working

### Performance
- [ ] Compression middleware enabled
- [ ] Caching configured
- [ ] Static file caching headers set
- [ ] Database connection pooling optimized
- [ ] Image optimization completed

### Error Handling
- [ ] Global error handler configured
- [ ] Graceful shutdown implemented
- [ ] Database error handling
- [ ] Email error handling (non-blocking)
- [ ] 404 handler configured

---

## 📋 Phase 3: Testing

### Local Testing
- [ ] Server starts without errors: `npm start`
- [ ] Health check responds: `http://localhost:3000/api/health`
- [ ] Homepage loads: `http://localhost:3000`
- [ ] All pages accessible
- [ ] Contact form submits successfully
- [ ] Booking form submits successfully
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Email notifications received

### API Testing
- [ ] `POST /api/bookings` - Creates booking
- [ ] `GET /api/bookings/:reference` - Retrieves booking
- [ ] `GET /api/bookings` - Lists bookings (admin)
- [ ] `POST /api/contact` - Submits contact form
- [ ] `GET /api/contact` - Lists messages (admin)
- [ ] `POST /api/admin/login` - Admin authentication
- [ ] `GET /api/health` - Health check

### Security Testing
- [ ] Rate limiting triggers after threshold
- [ ] Invalid input rejected
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] Unauthorized access blocked
- [ ] CORS blocks unauthorized origins

### Database Testing
- [ ] Bookings saved correctly
- [ ] Customers created/updated
- [ ] Contact messages stored
- [ ] Admin users authenticated
- [ ] Foreign key constraints work
- [ ] Triggers execute properly

---

## 📋 Phase 4: Deployment Preparation

### File Organization
- [ ] All source files present
- [ ] `.gitignore` configured properly
- [ ] No sensitive files in repository
- [ ] Documentation complete
- [ ] README.md updated
- [ ] Deployment guides available

### Backup Strategy
- [ ] Backup script created: `scripts/backup-database.js`
- [ ] Backup directory exists: `backups/`
- [ ] Manual backup tested: `npm run backup-db`
- [ ] Backup retention configured
- [ ] Backup restoration tested

### PM2 Configuration
- [ ] `ecosystem.config.js` configured
- [ ] PM2 installed globally (on server)
- [ ] Application starts with PM2
- [ ] PM2 startup configured
- [ ] PM2 logs accessible

### Server Requirements
- [ ] Node.js installed (v14+)
- [ ] MySQL installed (v5.7+)
- [ ] Nginx installed (if using reverse proxy)
- [ ] SSL certificate obtained
- [ ] Domain DNS configured
- [ ] Firewall configured

---

## 📋 Phase 5: Deployment

### Initial Deployment
- [ ] Files uploaded to server
- [ ] Dependencies installed on server
- [ ] `.env` file created on server
- [ ] Database initialized on server
- [ ] Admin user created on server
- [ ] Application started
- [ ] Nginx configured (if applicable)
- [ ] SSL certificate installed

### Domain Configuration
- [ ] Domain points to server IP
- [ ] WWW subdomain configured
- [ ] SSL certificate covers all domains
- [ ] HTTPS redirect working
- [ ] DNS propagation complete

### Post-Deployment Testing
- [ ] Website accessible via domain
- [ ] HTTPS working
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Emails sent successfully
- [ ] Admin panel accessible
- [ ] Mobile responsive
- [ ] Cross-browser compatible

---

## 📋 Phase 6: Post-Deployment

### Security Hardening
- [ ] Default admin password changed
- [ ] Database root password secured
- [ ] SSH key authentication enabled
- [ ] Unnecessary ports closed
- [ ] Fail2ban configured (optional)
- [ ] Regular security updates scheduled

### Monitoring Setup
- [ ] PM2 monitoring active
- [ ] Log rotation configured
- [ ] Disk space monitoring
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Error tracking (Sentry, optional)
- [ ] Analytics installed (Google Analytics)

### Backup Automation
- [ ] Daily database backups scheduled
- [ ] Backup verification process
- [ ] Off-site backup storage
- [ ] Backup restoration tested
- [ ] Backup retention policy set

### Documentation
- [ ] Server access credentials documented
- [ ] Database credentials documented
- [ ] Email credentials documented
- [ ] Domain registrar info documented
- [ ] Hosting provider info documented
- [ ] Emergency contacts listed

---

## 📋 Phase 7: Maintenance Plan

### Daily Tasks
- [ ] Monitor error logs
- [ ] Check booking submissions
- [ ] Verify email delivery
- [ ] Review contact messages

### Weekly Tasks
- [ ] Check server resources (CPU, RAM, disk)
- [ ] Review application logs
- [ ] Test backup restoration
- [ ] Check SSL certificate expiry
- [ ] Update content if needed

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Security audit: `npm audit`
- [ ] Database optimization
- [ ] Performance review
- [ ] Backup verification
- [ ] Review and respond to all inquiries

### Quarterly Tasks
- [ ] Update Node.js version
- [ ] Review and update prices
- [ ] Security penetration testing
- [ ] Performance optimization
- [ ] User feedback review
- [ ] Feature planning

---

## 🎯 Success Criteria

Your deployment is successful when:

✅ Website is accessible via HTTPS
✅ All forms submit without errors
✅ Emails are received for bookings and contacts
✅ Admin panel is functional
✅ No console errors in browser
✅ No server errors in logs
✅ Mobile version works perfectly
✅ Page load time < 3 seconds
✅ SSL certificate is valid
✅ Backups are running automatically

---

## 📞 Emergency Contacts

**Technical Support:**
- Developer: [Your contact]
- Hosting Provider: [Provider support]
- Domain Registrar: [Registrar support]

**Business Contacts:**
- Email: help@wmcprivatehire.com
- Phone: +44 7501 073623

---

## 🚨 Rollback Plan

If deployment fails:

1. **Stop the application**
   ```bash
   pm2 stop wmc-executive-hire
   ```

2. **Restore database backup**
   ```bash
   mysql -u wmc_user -p wmc_executive_hire < backups/latest_backup.sql
   ```

3. **Revert to previous version**
   ```bash
   git checkout previous-stable-tag
   npm install
   pm2 restart wmc-executive-hire
   ```

4. **Verify rollback**
   - Check health endpoint
   - Test critical functionality
   - Monitor logs

5. **Investigate and fix**
   - Review error logs
   - Identify root cause
   - Fix issues
   - Test in staging
   - Re-deploy

---

## ✅ Final Sign-Off

**Deployment Date:** _______________

**Deployed By:** _______________

**Verified By:** _______________

**Production URL:** _______________

**Notes:**
_________________________________
_________________________________
_________________________________

---

**🎉 Congratulations! Your WMC Executive Private Hire website is production-ready!**

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Created By:** BLACKBOXAI
