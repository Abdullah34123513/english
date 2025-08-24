require('dotenv').config()

async function testResetPasswordAPI() {
  console.log('=== Testing Reset Password API ===')
  
  // First, let's get a valid reset token from the database
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    // Get the most recent unused reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { used: false },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!resetRecord) {
      console.log('❌ No unused reset tokens found in database')
      console.log('Please request a password reset first')
      return
    }
    
    console.log('Found reset token:')
    console.log(`  User: ${resetRecord.user.email}`)
    console.log(`  Token: ${resetRecord.token.substring(0, 20)}...`)
    console.log(`  Expires: ${resetRecord.expires}`)
    console.log(`  Used: ${resetRecord.used}`)
    
    // Test the reset password API
    console.log('\n=== Testing Reset Password API Call ===')
    
    const testPassword = 'newpassword123'
    
    const response = await fetch('http://localhost:3000/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: resetRecord.token,
        password: testPassword
      }),
    })
    
    const data = await response.json()
    
    console.log('Response status:', response.status)
    console.log('Response data:', data)
    
    if (response.ok) {
      console.log('✅ Reset password API call successful!')
      console.log('Message:', data.message)
      
      // Verify the password was actually changed
      console.log('\n=== Verifying Password Change ===')
      const bcrypt = require('bcryptjs')
      const user = await prisma.user.findUnique({
        where: { id: resetRecord.userId }
      })
      
      if (user) {
        const isMatch = await bcrypt.compare(testPassword, user.password)
        console.log(`Password successfully changed: ${isMatch}`)
        
        // Check if reset token was marked as used
        const updatedResetRecord = await prisma.passwordReset.findUnique({
          where: { id: resetRecord.id }
        })
        console.log(`Reset token marked as used: ${updatedResetRecord?.used}`)
      }
    } else {
      console.log('❌ Reset password API call failed')
      console.log('Error:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error testing reset password API:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testResetPasswordAPI()