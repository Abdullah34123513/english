require('dotenv').config()

async function testDatabaseConnection() {
  console.log('=== Testing Database Connection ===')
  
  try {
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    console.log('1. Testing basic connection...')
    
    // Test basic query
    const userCount = await prisma.user.count()
    console.log(`✅ Connected! Found ${userCount} users in database`)
    
    // Test password reset model
    const resetCount = await prisma.passwordReset.count()
    console.log(`✅ Found ${resetCount} password reset records`)
    
    // Test user model
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      },
      take: 3
    })
    
    console.log('\n2. Sample users:')
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name || 'N/A'})`)
    })
    
    // Test password reset records
    const resets = await prisma.passwordReset.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      take: 3
    })
    
    console.log('\n3. Sample password reset records:')
    resets.forEach((reset, index) => {
      console.log(`   ${index + 1}. ${reset.user.email} - Used: ${reset.used}`)
    })
    
    await prisma.$disconnect()
    console.log('\n✅ Database connection test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.error('\nError details:', error.message)
    
    if (error.message.includes('DATABASE_URL')) {
      console.error('\n💡 Possible fixes:')
      console.error('   1. Check DATABASE_URL in .env file')
      console.error('   2. Ensure database file exists')
      console.error('   3. Check file permissions')
    }
    
    if (error.message.includes('prisma.schema')) {
      console.error('\n💡 Possible fixes:')
      console.error('   1. Run: npx prisma db push')
      console.error('   2. Run: npx prisma generate')
      console.error('   3. Check schema.prisma file')
    }
  }
}

testDatabaseConnection()