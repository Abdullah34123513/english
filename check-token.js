require('dotenv').config()

async function checkTokenInDatabase() {
  console.log('=== Checking Token in Database ===')
  
  const token = '61d44a6c4fa3bdeae427d4407e36f2c8f7b22470a8f11b8349495ceadb0b293c'
  
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()
  
  try {
    console.log('Looking for token:', token.substring(0, 20) + '...')
    
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    })
    
    const now = new Date()
    
    if (resetRecord) {
      console.log('\n✅ Token found in database:')
      console.log('ID:', resetRecord.id)
      console.log('User:', resetRecord.user.email)
      console.log('User Name:', resetRecord.user.name)
      console.log('Expires:', resetRecord.expires)
      console.log('Used:', resetRecord.used)
      console.log('Created:', resetRecord.createdAt)
      
      console.log('\nCurrent time:', now)
      console.log('Is expired:', resetRecord.expires < now)
      
      // Check if user has password
      console.log('User has password:', !!resetRecord.user.password)
      
    } else {
      console.log('\n❌ Token not found in database')
      
      // Let's check all recent reset tokens
      console.log('\n=== All Recent Reset Tokens ===')
      const allTokens = await prisma.passwordReset.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
      
      console.log(`Found ${allTokens.length} recent reset tokens:`)
      allTokens.forEach((record, index) => {
        console.log(`\n${index + 1}. Token: ${record.token.substring(0, 20)}...`)
        console.log(`   User: ${record.user.email}`)
        console.log(`   Used: ${record.used}`)
        console.log(`   Expires: ${record.expires}`)
        console.log(`   Expired: ${record.expires < now}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking token:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTokenInDatabase()