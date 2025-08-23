# Email Testing Guide

## Overview

The English Learning Platform now includes a comprehensive email testing system in the admin panel that allows administrators to:

- Test email configuration and SMTP connections
- Send test emails (verification, welcome, custom)
- Monitor email service status
- Troubleshoot email delivery issues

## Features

### 1. Email Configuration Testing
- **Configuration Status**: Shows current SMTP configuration from environment variables
- **Connection Testing**: Tests SMTP server connectivity and authentication
- **Real-time Validation**: Validates email settings and provides detailed error messages

### 2. Test Email Types
- **Verification Email**: Test the email verification system
- **Welcome Email**: Test the welcome email for new users
- **Custom Email**: Send custom test emails with custom subjects and messages

### 3. Test Results Tracking
- **Real-time Results**: View test results with timestamps and status
- **Detailed Logs**: See success/failure messages and error details
- **Export Results**: Export test results for documentation and troubleshooting

## Accessing Email Testing

1. **Navigate to Admin Dashboard**: `/dashboard/admin`
2. **Click on "Email Testing" tab**
3. **View Configuration Status**: Check if email is properly configured
4. **Run Tests**: Use the test buttons to verify email functionality

## Environment Variables Required

For email testing to work, ensure these environment variables are set in your `.env` file:

```bash
# SMTP Server Configuration
SMTP_HOST="smtp.hostinger.com"
SMTP_PORT="465"
SMTP_SECURE="false"
SMTP_USER="noreply@herliva.com"
SMTP_PASS="Abd@3412"

# Email From Configuration
SMTP_FROM_NAME="English Learning Platform"
SMTP_FROM_EMAIL="noreply@herliva.com"
```

## Troubleshooting Common Issues

### 1. "Email service not configured"
- **Cause**: Missing or incomplete SMTP environment variables
- **Solution**: Check that all required SMTP variables are set in `.env`

### 2. "SMTP connection failed"
- **Cause**: Incorrect SMTP settings or network issues
- **Solution**: 
  - Verify SMTP host, port, and credentials
  - Check firewall settings
  - Ensure SMTP server is accessible

### 3. "Failed to send email"
- **Cause**: Authentication issues or email server restrictions
- **Solution**:
  - Verify email credentials
  - Check if email provider requires app passwords
  - Ensure sender email is authorized

### 4. "nodemailer.createTransporter is not a function"
- **Cause**: Using incorrect nodemailer method name
- **Solution**: Use `nodemailer.createTransport()` instead of `nodemailer.createTransporter()`

## API Endpoints

The email testing system uses the following API endpoints:

- `POST /api/admin/test-email-connection` - Test SMTP connection
- `POST /api/admin/test-email-verification` - Send verification test email
- `POST /api/admin/test-email-welcome` - Send welcome test email
- `POST /api/admin/test-email-custom` - Send custom test email

## Testing Workflow

### Step 1: Check Configuration
1. Go to Admin Dashboard → Email Testing
2. Review the "Email Configuration Status" card
3. Ensure all required fields are populated

### Step 2: Test Connection
1. Click "Test SMTP Connection" button
2. Wait for connection test result
3. Review any error messages if connection fails

### Step 3: Send Test Emails
1. Enter a test email address
2. Choose email type (Verification, Welcome, or Custom)
3. Click the corresponding send button
4. Check test results for success/failure status

### Step 4: Monitor Results
1. Review test results in the "Test Results" section
2. Check email inbox for received test emails
3. Export results if needed for documentation

## Best Practices

### 1. Security
- Never commit actual email credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate email passwords and API keys

### 2. Testing
- Test with multiple email providers (Gmail, Outlook, etc.)
- Verify both HTML and text email versions
- Test email delivery speed and reliability

### 3. Monitoring
- Regularly check email service status
- Monitor bounce rates and delivery failures
- Keep test results for troubleshooting

## Integration with Email Service

The email testing system integrates with the main email service (`/src/lib/email-service.ts`) and uses the same configuration and transport logic. This ensures that test emails accurately reflect the behavior of production emails.

## Error Handling

The system provides comprehensive error handling with:

- **Configuration Errors**: Missing or invalid environment variables
- **Connection Errors**: SMTP server connectivity issues
- **Authentication Errors**: Invalid credentials or permissions
- **Delivery Errors**: Email server rejections or failures

Each error includes detailed messages to help diagnose and resolve issues quickly.

## Support

For additional support with email testing:

1. Check the test results for detailed error messages
2. Verify environment variable configuration
3. Consult email provider documentation
4. Review network and firewall settings
5. Contact platform administrators if issues persist

---

**Note**: The email testing system is designed for administrative use only and requires admin privileges to access and use.