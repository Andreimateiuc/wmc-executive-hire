# Admin Registration Feature Documentation

## Overview
This document describes the newly implemented admin registration feature for the WMC Executive Private Hire system. The feature allows new users to create admin accounts with proper validation and security measures.

## Features Implemented

### 1. Backend Implementation

#### Controller Method (`controllers/adminController.js`)
- **Method**: `register(userData)`
- **Functionality**:
  - Validates all required fields (username, email, password, fullName)
  - Checks username length (3-50 characters)
  - Verifies username uniqueness in database
  - Verifies email uniqueness in database
  - Validates password length (minimum 6 characters)
  - Hashes password using bcrypt (10 salt rounds)
  - Creates new admin user with 'staff' role by default
  - Sets user as active by default

#### API Endpoint (`routes/admin.js`)
- **Route**: `POST /api/admin/register`
- **Validation Rules**:
  - Username: Required, 3-50 characters, alphanumeric + underscore only
  - Email: Required, valid email format
  - Password: Required, minimum 6 characters
  - Full Name: Required
- **Response Codes**:
  - 201: Registration successful
  - 400: Validation failed or duplicate username/email
  - 500: Server error

### 2. Frontend Implementation

#### Registration Page (`admin/register.html`)
- **URL**: `http://localhost:3000/admin/register`
- **Form Fields**:
  1. Full Name (required)
  2. Username (required, 3+ chars, alphanumeric + underscore)
  3. Email (required, valid email format)
  4. Password (required, 6+ chars)
  5. Confirm Password (required, must match password)

- **Features**:
  - Real-time password match validation
  - Client-side validation before submission
  - Clear error messages for each field
  - Loading state during submission
  - Success message with auto-redirect to login
  - Link to login page for existing users
  - Professional UI matching login page design

#### Login Page Update (`admin/login.html`)
- Added "Don't have an account? Register here" link
- Links to registration page

#### Server Route (`server.js`)
- Added route: `GET /admin/register`
- Serves the registration HTML page

## Security Features

1. **Password Security**:
   - Minimum 6 characters required
   - Hashed using bcrypt with 10 salt rounds
   - Never stored in plain text

2. **Input Validation**:
   - Server-side validation using express-validator
   - Client-side validation for better UX
   - SQL injection prevention through parameterized queries

3. **Duplicate Prevention**:
   - Checks for existing username before registration
   - Checks for existing email before registration
   - Database unique constraints on username field

4. **Default Security Settings**:
   - New users assigned 'staff' role (not 'admin')
   - Users set as active by default
   - Session-based authentication after login

## User Flow

1. **Registration Process**:
   ```
   User visits /admin/register
   → Fills out registration form
   → Client-side validation
   → Submit to /api/admin/register
   → Server-side validation
   → Check for duplicates
   → Hash password
   → Create user in database
   → Show success message
   → Auto-redirect to /admin/login (after 2 seconds)
   ```

2. **Login After Registration**:
   ```
   User redirected to /admin/login
   → Enter credentials
   → Authenticate
   → Redirect to /admin dashboard
   ```

## API Documentation

### Register New Admin User

**Endpoint**: `POST /api/admin/register`

**Request Body**:
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "adminId": 1
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Username already exists"
}
```

**Validation Error Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Username must be between 3 and 50 characters",
      "param": "username",
      "location": "body"
    }
  ]
}
```

## Testing Guide

### Manual Testing Steps

1. **Test Valid Registration**:
   - Navigate to `http://localhost:3000/admin/register`
   - Fill in all fields with valid data
   - Submit form
   - Verify success message appears
   - Verify redirect to login page
   - Login with new credentials
   - Verify successful login

2. **Test Duplicate Username**:
   - Try to register with an existing username
   - Verify error message: "Username already exists"

3. **Test Duplicate Email**:
   - Try to register with an existing email
   - Verify error message: "Email already exists"

4. **Test Password Validation**:
   - Try password less than 6 characters
   - Verify error message appears
   - Try mismatched passwords
   - Verify error message appears

5. **Test Username Validation**:
   - Try username less than 3 characters
   - Try username with special characters (not alphanumeric or underscore)
   - Verify appropriate error messages

6. **Test Email Validation**:
   - Try invalid email format
   - Verify error message appears

7. **Test Navigation**:
   - Click "Login here" link on registration page
   - Verify redirect to login page
   - Click "Register here" link on login page
   - Verify redirect to registration page

### Database Verification

After successful registration, verify in database:
```sql
SELECT * FROM admin_users WHERE username = 'testuser';
```

Expected results:
- User exists in database
- Password is hashed (not plain text)
- Role is 'staff'
- is_active is TRUE
- created_at timestamp is set

## Files Modified/Created

### Created Files:
1. `admin/register.html` - Registration page

### Modified Files:
1. `controllers/adminController.js` - Added register() method
2. `routes/admin.js` - Added registration endpoint
3. `admin/login.html` - Added link to registration
4. `server.js` - Added route for registration page

## Configuration

No additional configuration required. The feature uses existing:
- Database connection
- Session management
- bcrypt for password hashing
- express-validator for validation

## Future Enhancements (Optional)

1. **Email Verification**:
   - Send verification email after registration
   - Require email confirmation before activation

2. **Password Strength Indicator**:
   - Visual indicator for password strength
   - Recommendations for stronger passwords

3. **CAPTCHA**:
   - Add CAPTCHA to prevent automated registrations

4. **Admin Approval**:
   - Require admin approval before new users can login
   - Set is_active to FALSE by default

5. **Role Selection**:
   - Allow super admins to assign roles during registration
   - Add role-based registration forms

## Support

For issues or questions:
1. Check server logs for error messages
2. Verify database connection
3. Ensure all dependencies are installed
4. Check browser console for client-side errors

## Conclusion

The registration feature is fully implemented and ready for use. Users can now create their own admin accounts, which will be assigned the 'staff' role by default. The feature includes comprehensive validation, security measures, and a user-friendly interface.
