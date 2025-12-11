# 👤 Admin User Management Guide

Complete guide for managing admin users in your WMC Executive Private Hire database.

## 📋 Overview

Your system includes powerful command-line tools to manage admin users who can access the admin dashboard at http://localhost:3000/admin

## 🛠️ Available Commands

### 1. Add New Admin User
```bash
npm run add-admin
```

**What it does:**
- Creates a new admin user in the database
- Securely hashes the password
- Validates all input fields
- Checks for duplicate usernames/emails

**Interactive prompts:**
- Username (unique)
- Email (unique)
- Full name
- Password (min 6 characters)
- Confirm password

**Example:**
```
Enter username: john_admin
Enter email: john@wmcexecutive.co.uk
Enter full name: John Smith
Enter password: ********
Confirm password: ********

✅ Admin user created successfully!
```

### 2. List All Admin Users
```bash
npm run list-admins
```

**What it shows:**
- All admin users in database
- User ID, username, email
- Full name and role
- Active/inactive status
- Last login time
- Creation date

**Example output:**
```
Found 2 admin user(s):

1. System Administrator
   ID: 1
   Username: admin
   Email: admin@wmcexecutive.co.uk
   Role: admin
   Status: ✅ Active
   Last Login: 2024-12-15 10:30:00
   Created: 2024-12-01 09:00:00

2. John Smith
   ID: 2
   Username: john_admin
   Email: john@wmcexecutive.co.uk
   Role: admin
   Status: ✅ Active
   Last Login: Never
   Created: 2024-12-15 11:00:00
```

### 3. Delete Admin User
```bash
npm run delete-admin
```

**What it does:**
- Lists all current admin users
- Prompts for username to delete
- Shows user details for confirmation
- Requires typing "DELETE" to confirm
- Prevents deletion of last admin user

**Safety features:**
- Cannot delete the last admin
- Requires explicit confirmation
- Shows user details before deletion
- Can be cancelled at any time

**Example:**
```
Current admin users:

1. admin (admin@wmcexecutive.co.uk) - System Administrator [Role: admin]
2. john_admin (john@wmcexecutive.co.uk) - John Smith [Role: admin]

Enter username to delete (or "cancel" to exit): john_admin

⚠️  You are about to delete:
   Username: john_admin
   Email: john@wmcexecutive.co.uk
   Full Name: John Smith

⚠️  This action cannot be undone!

Type "DELETE" to confirm: DELETE

✅ Admin user deleted successfully!
```

## 🔐 Default Admin User

When you run `npm run init-db`, a default admin user is created:

**Default Credentials:**
- Username: `admin`
- Password: (shown in terminal after init-db)
- Email: `admin@wmcexecutive.co.uk`
- Role: `admin`

**⚠️ IMPORTANT:** Change the default password immediately after first login!

## 📊 Admin User Roles

Currently supported roles:
- **admin** - Full access to all features
- **manager** - (Future: Limited management access)
- **staff** - (Future: View-only access)

## 🔒 Security Features

**Password Security:**
- Minimum 6 characters required
- Passwords are hashed using bcrypt
- Never stored in plain text
- Salt rounds: 10

**Username/Email Validation:**
- Usernames must be unique
- Emails must be unique
- Email format validation
- No duplicate accounts allowed

**Session Security:**
- JWT tokens for authentication
- Secure session management
- Auto-logout after inactivity
- Password required for sensitive actions

## 💡 Common Use Cases

### Creating Your First Admin
```bash
# After database initialization
npm run add-admin

# Enter your details
Username: your_username
Email: your_email@domain.com
Full Name: Your Name
Password: YourSecurePassword123
```

### Adding Multiple Admins
```bash
# For each new admin user
npm run add-admin

# Example: Add manager
Username: manager_sarah
Email: sarah@wmcexecutive.co.uk
Full Name: Sarah Johnson
Password: ********
```

### Checking Who Has Access
```bash
# View all admin users
npm run list-admins

# Review the list and verify access
```

### Removing Old Admin Accounts
```bash
# Delete inactive or former staff
npm run delete-admin

# Select username to remove
# Confirm deletion
```

## 🚨 Troubleshooting

### "Cannot connect to database"
**Solution:**
1. Make sure XAMPP MySQL is running
2. Check .env file has correct DB settings
3. Verify DB_PASSWORD is empty for XAMPP

### "Username already exists"
**Solution:**
- Choose a different username
- Or delete the existing user first
- Check with `npm run list-admins`

### "Cannot delete the last admin user"
**Solution:**
- Create another admin user first
- Then delete the unwanted one
- Always keep at least one admin

### "Password too short"
**Solution:**
- Use at least 6 characters
- Recommended: 12+ characters
- Mix letters, numbers, symbols

## 📝 Best Practices

**1. Strong Passwords:**
- Use at least 12 characters
- Mix uppercase, lowercase, numbers, symbols
- Don't use common words or patterns
- Example: `Wmc@Exec2024!Secure`

**2. Unique Usernames:**
- Use descriptive usernames
- Include role or department
- Examples: `admin_main`, `manager_ops`, `staff_booking`

**3. Regular Audits:**
- Run `npm run list-admins` monthly
- Remove inactive users
- Update passwords periodically

**4. Access Control:**
- Only create admin accounts for trusted staff
- Remove access when staff leave
- Keep a record of who has access

**5. Email Addresses:**
- Use company email addresses
- Avoid personal emails
- Keep emails up to date

## 🔄 Workflow Examples

### Onboarding New Staff
```bash
# 1. Create admin account
npm run add-admin

# 2. Verify creation
npm run list-admins

# 3. Share credentials securely
# 4. Have them change password on first login
```

### Staff Leaving
```bash
# 1. List current admins
npm run list-admins

# 2. Delete their account
npm run delete-admin

# 3. Verify removal
npm run list-admins
```

### Security Audit
```bash
# 1. Review all admin users
npm run list-admins

# 2. Check last login dates
# 3. Remove inactive accounts
npm run delete-admin

# 4. Verify final list
npm run list-admins
```

## 📞 Quick Reference

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run add-admin` | Create new admin | New staff member |
| `npm run list-admins` | View all admins | Regular audits |
| `npm run delete-admin` | Remove admin | Staff leaving |
| `npm run init-db` | Initialize database | First setup only |

## ✅ Checklist

Before going live:
- [ ] Default admin password changed
- [ ] Personal admin accounts created
- [ ] Test login for each admin
- [ ] Remove any test accounts
- [ ] Document who has access
- [ ] Set up password policy
- [ ] Schedule regular audits

## 🎯 Summary

You now have complete control over admin users:
- ✅ Easy command-line tools
- ✅ Secure password handling
- ✅ User validation
- ✅ Safety features
- ✅ Audit capabilities

**Start managing your admin users now with these simple commands!**
