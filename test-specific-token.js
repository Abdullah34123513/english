require('dotenv').config()

async function testWithSpecificToken() {
  console.log('=== Testing with Specific Reset Token ===')
  
  const token = '61d44a6c4fa3bdeae427d4407e36f2c8f7b22470a8f11b8349495ceadb0b293c'
  const newPassword = 'newpassword123'
  
  console.log('Token:', token.substring(0, 20) + '...')
  console.log('New password:', newPassword)
  
  try {
    const response = await fetch('http://localhost:3000/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        password: newPassword
      }),
    })
    
    const data = await response.json()
    
    console.log('\n=== Response ===')
    console.log('Status:', response.status)
    console.log('Data:', data)
    
    if (response.ok) {
      console.log('\n✅ Password reset successful!')
      
      // Verify the reset worked
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      // Find the reset record
      const resetRecord = await prisma.passwordReset.findUnique({
        where: { token },
        include: { user: true }
      })
      
      if (resetRecord) {
        console.log('\n=== Verification ===')
        console.log('Reset token marked as used:', resetRecord.used)
        console.log('User email:', resetRecord.user.email)
        
        // Test password change
        const bcrypt = require('bcryptjs')
        const isMatch = await bcrypt.compare(newPassword, resetRecord.user.password)
        console.log('Password successfully changed:', isMatch)
      }
      
      await prisma.$disconnect()
    } else {
      console.log('\n❌ Password reset failed')
      console.log('Error:', data.error)
    }
    
  } catch (error) {
    console.error('❌ Error testing password reset:', error)
  }
}

testWithSpecificToken()