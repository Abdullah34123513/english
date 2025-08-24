require('dotenv').config()

const { emailService } = require('./src/lib/email-service.ts')

async function testPasswordResetEmail() {
  console.log('=== Testing Password Reset Email ===')
  
  // Test email configuration
  console.log('1. Checking email service configuration...')
  const isConfigured = emailService.isConfigured()
  console.log('Email service configured:', isConfigured)
  
  if (!isConfigured) {
    console.log('❌ Email service is not configured')
    console.log('Please check your environment variables:')
    console.log('- SMTP_HOST:', process.env.SMTP_HOST)
    console.log('- SMTP_PORT:', process.env.SMTP_PORT)
    console.log('- SMTP_SECURE:', process.env.SMTP_SECURE)
    console.log('- SMTP_USER:', process.env.SMTP_USER)
    console.log('- SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'NOT SET')
    return
  }
  
  console.log('✅ Email service is configured')
  
  // Test password reset email
  console.log('\n2. Testing password reset email...')
  const testEmail = 'noreply@herliva.com' // Use the same email as configured
  const testToken = 'test-token-123456789'
  const testName = 'Test User'
  
  try {
    const result = await emailService.sendPasswordResetEmail(testEmail, testToken, testName)
    console.log('Password reset email result:', result)
    
    if (result) {
      console.log('✅ Password reset email sent successfully')
    } else {
      console.log('❌ Failed to send password reset email')
    }
  } catch (error) {
    console.error('❌ Error sending password reset email:', error)
  }
}

testPasswordResetEmail().catch(console.error)