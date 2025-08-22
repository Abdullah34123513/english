# Email Verification System Setup

This document provides instructions for setting up the email verification system for the English Learning Platform.

## Overview

The email verification system ensures that users verify their email addresses before they can access the platform. This provides:
- **Security**: Prevents fake accounts and spam
- **Compliance**: Meets regulatory requirements
- **Communication**: Ensures users can receive important notifications

## Prerequisites

1. **SMTP Service**: You need access to an SMTP server to send emails
2. **Environment Configuration**: Update your `.env` file with SMTP credentials

## Setup Instructions

### 1. Configure SMTP Settings

Add the following environment variables to your `.env` file:

```bash
# SMTP Server Configuration
SMTP_HOST="your-smtp-server.com"
SMTP_PORT="587"
SMTP_SECURE="false"

# SMTP Authentication
SMTP_USER="your-email@example.com"
SMTP_PASS="your-email-password"

# Email From Configuration
SMTP_FROM_NAME="English Learning Platform"
SMTP_FROM_EMAIL="your-email@example.com"
```

### 2. Popular SMTP Providers

#### Gmail
```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"  # Use App Password if 2FA enabled
```

**Gmail Setup:**
1. Go to your Google Account settings
2. Enable "Less secure app access" OR
3. Generate an "App Password" if you have 2FA enabled
4. Use the app password as `SMTP_PASS`

#### Yahoo Mail
```bash
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@yahoo.com"
SMTP_PASS="your-yahoo-password"
```

#### Outlook/Hotmail
```bash
SMTP_HOST="smtp.office365.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-outlook-password"
```

#### SendGrid (Recommended for Production)
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

### 3. Database Migration

The email verification system requires database schema updates. Run:

```bash
npm run db:push
```

This will create the necessary tables:
- `email_verifications` - Stores verification tokens
- Updates `users` table with `emailVerified` field

## How It Works

### 1. User Registration
1. User signs up via the registration form
2. System creates user account with `emailVerified: false`
3. Generates verification token (24-hour expiry)
4. Sends verification email with secure link
5. User redirected to sign-in with verification prompt

### 2. Email Verification
1. User clicks verification link in email
2. System validates token and marks email as verified
3. User can now sign in with their credentials

### 3. Sign-in Process
1. User attempts to sign in
2. System checks if email is verified
3. If not verified, shows resend verification option
4. If verified, allows sign-in and redirects to dashboard

### 4. Resend Verification
1. User can request new verification email
2. System generates new token and sends email
3. Rate limiting prevents abuse (5-minute cooldown)

## Features

### Security Features
- **Secure Tokens**: Cryptographically generated tokens
- **24-hour Expiry**: Tokens expire for security
- **Rate Limiting**: Prevents email spam
- **Token Cleanup**: Automatic cleanup of expired tokens

### User Experience
- **Professional Emails**: Beautiful, responsive email templates
- **Clear Instructions**: Step-by-step verification process
- **Resend Option**: Users can request new verification emails
- **Status Indicators**: Clear feedback on verification status

### Admin Features
- **Verification Status API**: Check user verification status
- **Resend Capability**: Manually resend verification emails
- **Token Management**: View and manage verification tokens

## API Endpoints

### Email Verification
- `GET /api/verify-email?token=TOKEN` - Verify email token
- `POST /api/verify-email` - Verify email token (JSON)

### Verification Status
- `GET /api/verification-status` - Check verification status

### Resend Verification
- `POST /api/resend-verification` - Resend verification email

## Testing

### 1. Test Email Configuration
```bash
# Start the development server
npm run dev

# Register a new user and check if verification email is sent
```

### 2. Test Verification Flow
1. Register a new user account
2. Check your email for verification link
3. Click the verification link
4. Try to sign in before and after verification

### 3. Test Resend Functionality
1. Sign in with unverified email
2. Click "Resend Verification Email"
3. Check for new verification email

## Troubleshooting

### Common Issues

#### Emails Not Sending
**Problem**: Users don't receive verification emails
**Solution**:
1. Check SMTP credentials in `.env`
2. Verify SMTP server is accessible
3. Check spam/junk folders
4. Ensure `SMTP_FROM_EMAIL` matches `SMTP_USER`

#### Token Expired
**Problem**: Verification link shows "token expired"
**Solution**:
1. Tokens expire after 24 hours for security
2. Use resend functionality to get new token
3. Check system time is correct

#### Authentication Issues
**Problem**: Users can't sign in after verification
**Solution**:
1. Check `emailVerified` field in database
2. Verify NextAuth configuration
3. Check browser console for errors

#### SMTP Connection Issues
**Problem**: SMTP connection fails
**Solution**:
1. Verify SMTP server and port
2. Check firewall settings
3. Use correct SSL/TLS settings
4. Test SMTP credentials with other email clients

### Debug Mode

Enable debug logging by checking the server console:

```bash
# Check server logs for email service status
npm run dev
```

Look for these messages:
- `Email service is ready to send messages` - SMTP configured correctly
- `Email sent successfully` - Emails are being sent
- `Email service not configured` - Check SMTP settings

## Production Considerations

### Security
1. **Use Environment Variables**: Never commit SMTP credentials
2. **Use App Passwords**: For Gmail, use app passwords instead of main password
3. **Monitor Logs**: Watch for failed email attempts
4. **Rate Limiting**: Configure SMTP provider rate limits

### Reliability
1. **Backup SMTP**: Consider using a transactional email service
2. **Queue System**: Implement email queue for high volume
3. **Monitoring**: Set up alerts for email delivery failures
4. **Fallback**: Have a backup email service configured

### Compliance
1. **GDPR**: Include unsubscribe links in marketing emails
2. **CAN-SPAM**: Follow email marketing regulations
3. **Data Privacy**: Store only necessary user data
4. **Consent**: Get explicit consent for email communications

## Support

For issues with the email verification system:

1. Check this documentation
2. Review server logs for error messages
3. Verify SMTP configuration
4. Test with different email providers
5. Contact development team for assistance

## Email Templates

The system includes professional email templates for:
- **Verification Email**: Sent to new users
- **Welcome Email**: Sent after successful verification
- **Resend Verification**: Sent when users request new tokens

Templates are responsive and include:
- Professional branding
- Clear call-to-action buttons
- Security information
- Contact information
- Unsubscribe options (for marketing emails)