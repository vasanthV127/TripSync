# Email Configuration Guide

## Overview
When an admin creates a new student account, the system automatically:
1. Sets the password to the student's roll number (e.g., `22BEC7001`)
2. Sends a welcome email with login credentials
3. Creates the account in the database

## Current Status
✅ Email functionality is **fully implemented**  
⚠️ Email sending is **disabled by default** (requires configuration)

## How It Works

### Without Configuration (Current State)
- Student account is created successfully
- Password is set to roll number
- Email is **not sent** (credentials printed in console instead)
- Admin response shows the default password

### With Configuration (Recommended)
- Student receives professional welcome email with:
  - Roll number
  - Email address
  - Default password
  - Login instructions
  - Security reminders

## Setup Instructions

### Option 1: Gmail (Recommended)

1. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Visit https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → Enter "TripSync"
   - Click "Generate"
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

3. **Update `.env` file**
   ```env
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASSWORD=abcd efgh ijkl mnop  # Your App Password
   ```

4. **Restart the backend server**
   ```bash
   # Press Ctrl+C to stop, then run again:
   uvicorn main:app --reload
   ```

### Option 2: Other Email Providers

**Outlook/Hotmail:**
```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SENDER_EMAIL=your-email@outlook.com
SENDER_PASSWORD=your-password
```

**Yahoo:**
```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SENDER_EMAIL=your-email@yahoo.com
SENDER_PASSWORD=your-app-password
```

**Custom SMTP Server:**
```env
SMTP_SERVER=mail.yourdomain.com
SMTP_PORT=587
SENDER_EMAIL=noreply@yourdomain.com
SENDER_PASSWORD=your-password
```

## Testing Email

1. **Configure email settings** in `.env`
2. **Restart backend server**
3. **Login as admin** → Go to Students section
4. **Click "Add Student"**
5. Fill in details:
   - Roll Number: `TEST001`
   - Name: `Test Student`
   - Email: `your-test-email@gmail.com`
6. **Submit** → Check email inbox

## Email Template Preview

```
Subject: Welcome to TripSync - Your Account Credentials

Dear [Student Name],

Your student account has been created successfully. Here are your login credentials:

┌─────────────────────────────────┐
│ Roll Number: 22BEC7001          │
│ Email: student@example.com      │
│ Password: 22BEC7001             │
└─────────────────────────────────┘

Important:
• Please change your password after first login
• Keep your credentials secure
• Access TripSync at: http://localhost:5173

If you have questions, contact the administrator.
```

## Troubleshooting

### Email not sending?
1. Check console logs for error messages
2. Verify SMTP credentials are correct
3. For Gmail: Ensure App Password (not regular password) is used
4. Check firewall/antivirus isn't blocking SMTP

### "Authentication failed" error?
- Gmail: Use App Password, not account password
- Enable 2-Step Verification first
- Remove spaces from App Password in `.env`

### Student not receiving email?
- Check spam/junk folder
- Verify email address is correct
- Check console for "✅ Welcome email sent successfully"

## Security Notes

⚠️ **Important Security Practices:**
- Never commit `.env` file to git (already in `.gitignore`)
- Use App Passwords, not account passwords
- Rotate passwords periodically
- Use a dedicated email account for system notifications
- Consider using professional email services (SendGrid, AWS SES) for production

## Fallback Behavior

If email is **not configured**:
- ✅ Student account is still created
- ✅ Default password is still set (roll number)
- ❌ Email is not sent
- ℹ️ Console shows: "Email not configured. Credentials: Roll No: XXX, Password: XXX"
- ℹ️ Admin sees success message with default password

This ensures the system works even without email configuration, but **email setup is highly recommended** for production use.

## Production Recommendations

For production deployment, consider:
1. **Professional email service** (SendGrid, AWS SES, Mailgun)
2. **Email queue system** (Celery, Redis) for async sending
3. **Email tracking** (open rates, delivery status)
4. **Custom domain email** (noreply@yourcompany.com)
5. **HTML email templates** with branding
6. **Rate limiting** to prevent abuse

## Need Help?

- Gmail App Password: https://support.google.com/accounts/answer/185833
- SMTP Settings: https://www.gmass.co/blog/gmail-smtp/
- Email Testing: Use https://mailtrap.io for safe testing
