require('dotenv').config()

async function comprehensiveEmailTest() {
  console.log('=== Comprehensive Email Test ===')
  
  // Test 1: Check environment variables
  console.log('\n1. Environment Variables Check:')
  console.log('SMTP_HOST:', process.env.SMTP_HOST)
  console.log('SMTP_PORT:', process.env.SMTP_PORT)
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE)
  console.log('SMTP_USER:', process.env.SMTP_USER)
  console.log('SMTP_FROM_EMAIL:', process.env.SMTP_FROM_EMAIL)
  console.log('SMTP_PASS:', process.env.SMTP_PASS ? '***' : 'NOT SET')
  
  // Test 2: Test email service configuration
  console.log('\n2. Email Service Configuration:')
  try {
    const { emailService } = require('./src/lib/email-service.ts')
    const isConfigured = emailService.isConfigured()
    console.log('Email service configured:', isConfigured ? '✅ YES' : '❌ NO')
    
    if (!isConfigured) {
      console.log('❌ Email service is not configured properly')
      return
    }
  } catch (error) {
    console.log('❌ Error checking email service:', error.message)
    return
  }
  
  // Test 3: Test sending to different email addresses
  console.log('\n3. Test Sending to Different Email Addresses:')
  const testEmails = [
    'noreply@herliva.com',  // Same as sender
    'admin@englishplatform.com',  // Current admin user
    'test@example.com',  // Invalid email for testing
  ]
  
  const { emailService } = require('./src/lib/email-service.ts')
  
  for (const testEmail of testEmails) {
    console.log(`\n  Testing email to: ${testEmail}`)
    try {
      const result = await emailService.sendPasswordResetEmail(
        testEmail,
        'test-token-12345',
        'Test User'
      )
      console.log(`  Result: ${result ? '✅ SUCCESS' : '❌ FAILED'}`)
    } catch (error) {
      console.log(`  Error: ${error.message}`)
    }
  }
  
  // Test 4: Test the actual forgot password API
  console.log('\n4. Test Forgot Password API:')
  try {
    const response = await fetch('http://localhost:3000/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'admin@englishplatform.com' }),
    })
    
    const data = await response.json()
    console.log('API Response:', response.status, data)
    
    if (response.ok) {
      console.log('✅ API call successful')
    } else {
      console.log('❌ API call failed:', data.error)
    }
  } catch (error) {
    console.log('❌ API test failed:', error.message)
  }
  
  // Test 5: Check database for password reset records
  console.log('\n5. Check Database for Password Reset Records:')
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const resetRecords = await prisma.passwordReset.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })
    
    console.log(`Found ${resetRecords.length} recent password reset records:`)
    resetRecords.forEach((record, index) => {
      console.log(`\n  Record ${index + 1}:`)
      console.log(`    User: ${record.user.email} (${record.user.name || 'N/A'})`)
      console.log(`    Token: ${record.token.substring(0, 10)}...`)
      console.log(`    Expires: ${record.expires}`)
      console.log(`    Used: ${record.used}`)
      console.log(`    Created: ${record.createdAt}`)
    })
    
    await prisma.$disconnect()
  } catch (error) {
    console.log('❌ Database check failed:', error.message)
  }
  
  console.log('\n=== Test Complete ===')
  console.log('\nIf all tests show SUCCESS but you still don\'t receive emails, check:')
  console.log('1. Spam/Junk folder in your email client')
  console.log('2. Email server logs for delivery issues')
  console.log('3. Firewall or network blocking email ports')
  console.log('4. SMTP server restrictions or blacklisting')
}

comprehensiveEmailTest().catch(console.error)