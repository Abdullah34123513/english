require('dotenv').config()

async function createTestUser() {
  console.log('=== Creating Test User with Real Email ===')
  
  const { PrismaClient } = require('@prisma/client')
  const bcrypt = require('bcryptjs')
  
  const prisma = new PrismaClient()
  
  try {
    // Test user details - replace with a real email address you can access
    const testUser = {
      email: 'abdullah34123513@gmail.com', // <-- CHANGE THIS TO YOUR REAL EMAIL
      name: 'Abdullah Test User',
      password: 'testpassword123',
      role: 'STUDENT'
    }
    
    console.log(`Creating test user with email: ${testUser.email}`)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email }
    })
    
    if (existingUser) {
      console.log('User already exists, updating password...')
      
      // Hash password
      const hashedPassword = await bcrypt.hash(testUser.password, 12)
      
      // Update user with password
      await prisma.user.update({
        where: { email: testUser.email },
        data: {
          password: hashedPassword,
          emailVerified: true
        }
      })
      
      console.log('✅ User updated successfully')
    } else {
      console.log('Creating new user...')
      
      // Hash password
      const hashedPassword = await bcrypt.hash(testUser.password, 12)
      
      // Create new user
      await prisma.user.create({
        data: {
          email: testUser.email,
          name: testUser.name,
          password: hashedPassword,
          role: testUser.role,
          emailVerified: true
        }
      })
      
      console.log('✅ User created successfully')
    }
    
    // Test password reset for this user
    console.log('\n=== Testing Password Reset for New User ===')
    
    const { emailService } = require('./src/lib/email-service.ts')
    
    // Generate a test reset token
    const crypto = require('crypto')
    const resetToken = crypto.randomBytes(32).toString('hex')
    
    console.log('Sending password reset email to:', testUser.email)
    
    const result = await emailService.sendPasswordResetEmail(
      testUser.email,
      resetToken,
      testUser.name
    )
    
    if (result) {
      console.log('✅ Password reset email sent successfully!')
      console.log(`📧 Check your inbox at: ${testUser.email}`)
      console.log('🔍 Also check your spam/junk folder')
      
      // Show the reset URL for manual testing
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      console.log(`🔗 Reset URL (for testing): ${resetUrl}`)
    } else {
      console.log('❌ Failed to send password reset email')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Instructions
console.log('🔧 Password Reset Email Test Tool')
console.log('=====================================')
console.log('This tool will create a test user with a real email address')
console.log('and test the password reset functionality.')
console.log('')
console.log('⚠️  IMPORTANT: Edit the script and replace "testuser@example.com"')
console.log('   with a real email address you can access!')
console.log('')
console.log('Press Ctrl+C to cancel or wait 3 seconds to continue...')
console.log('')

// Wait 3 seconds then run
setTimeout(createTestUser, 3000)