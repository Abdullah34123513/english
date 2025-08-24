require('dotenv').config()

async function testPasswordResetModel() {
  console.log('=== Testing Password Reset Model Access ===')
  
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    console.log('1. Testing Prisma client initialization...')
    
    // Test if we can access the passwordReset model
    console.log('2. Testing passwordReset model access...')
    const resetCount = await prisma.passwordReset.count()
    console.log(`Password reset records found: ${resetCount}`)
    
    // Test if we can find a reset record
    console.log('3. Testing findUnique query...')
    const resetRecord = await prisma.passwordReset.findFirst()
    if (resetRecord) {
      console.log('Sample reset record found:')
      console.log(`  ID: ${resetRecord.id}`)
      console.log(`  Token: ${resetRecord.token.substring(0, 10)}...`)
      console.log(`  User ID: ${resetRecord.userId}`)
      console.log(`  Expires: ${resetRecord.expires}`)
      console.log(`  Used: ${resetRecord.used}`)
    } else {
      console.log('No reset records found')
    }
    
    // Test the exact query from the reset-password route
    console.log('4. Testing exact reset-password route query...')
    const testToken = 'test-token-123'
    try {
      const testRecord = await prisma.passwordReset.findUnique({
        where: { token: testToken },
        include: { user: true }
      })
      console.log('Test query executed successfully (no record found, which is expected)')
    } catch (error) {
      console.error('❌ Error executing test query:', error.message)
    }
    
    // Check if the model exists in the schema
    console.log('5. Checking Prisma client models...')
    const models = Object.keys(prisma)
    const hasPasswordReset = models.includes('passwordReset')
    console.log('Available models:', models.filter(m => !m.startsWith('_')))
    console.log(`Has passwordReset model: ${hasPasswordReset}`)
    
    await prisma.$disconnect()
    
  } catch (error) {
    console.error('❌ Error testing password reset model:', error)
  }
}

testPasswordResetModel()