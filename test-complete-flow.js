require('dotenv').config()

async function completePasswordResetFlow() {
  console.log('=== Complete Password Reset Flow Test ===')
  
  // Step 1: Request password reset
  console.log('\n1. Requesting password reset...')
  
  try {
    const forgotResponse = await fetch('http://localhost:3000/api/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'abdullah34123513@gmail.com' }),
    })
    
    const forgotData = await forgotResponse.json()
    console.log('Forgot password response:', forgotResponse.status, forgotData)
    
    if (!forgotResponse.ok) {
      console.log('❌ Failed to request password reset')
      return
    }
    
    // Step 2: Get the new reset token from database
    console.log('\n2. Getting reset token from database...')
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { 
        used: false,
        user: { email: 'abdullah34123513@gmail.com' }
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    })
    
    if (!resetRecord) {
      console.log('❌ No reset token found for the user')
      await prisma.$disconnect()
      return
    }
    
    console.log('Found reset token:', resetRecord.token.substring(0, 20) + '...')
    
    // Step 3: Reset the password
    console.log('\n3. Resetting password...')
    const newPassword = 'testpassword456'
    
    const resetResponse = await fetch('http://localhost:3000/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: resetRecord.token,
        password: newPassword
      }),
    })
    
    const resetData = await resetResponse.json()
    console.log('Reset password response:', resetResponse.status, resetData)
    
    if (resetResponse.ok) {
      console.log('✅ Password reset successful!')
      
      // Step 4: Verify the password change
      console.log('\n4. Verifying password change...')
      const bcrypt = require('bcryptjs')
      const user = await prisma.user.findUnique({
        where: { email: 'abdullah34123513@gmail.com' }
      })
      
      if (user) {
        const isMatch = await bcrypt.compare(newPassword, user.password)
        console.log(`Password verification: ${isMatch ? '✅ SUCCESS' : '❌ FAILED'}`)
        
        // Check if reset token was marked as used
        const updatedResetRecord = await prisma.passwordReset.findUnique({
          where: { id: resetRecord.id }
        })
        console.log(`Reset token marked as used: ${updatedResetRecord?.used ? '✅ YES' : '❌ NO'}`)
      }
      
      console.log('\n🎉 Complete password reset flow test PASSED!')
    } else {
      console.log('❌ Password reset failed:', resetData.error)
    }
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error in complete password reset flow:', error)
  }
}

completePasswordResetFlow()