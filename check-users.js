require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  console.log('=== Checking Users in Database ===')
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
        role: true,
        createdAt: true
      }
    })
    
    console.log(`Found ${users.length} users in the database:`)
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`)
      console.log(`  ID: ${user.id}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Name: ${user.name || 'N/A'}`)
      console.log(`  Has Password: ${user.password ? 'YES' : 'NO'}`)
      console.log(`  Email Verified: ${user.emailVerified}`)
      console.log(`  Role: ${user.role}`)
      console.log(`  Created: ${user.createdAt}`)
    })
    
    if (users.length === 0) {
      console.log('\n❌ No users found in the database')
      console.log('You need to create a user account first.')
    } else {
      const usersWithPasswords = users.filter(u => u.password)
      console.log(`\n📊 Summary:`)
      console.log(`  Total users: ${users.length}`)
      console.log(`  Users with passwords: ${usersWithPasswords.length}`)
      console.log(`  Users without passwords (OAuth): ${users.length - usersWithPasswords.length}`)
      
      if (usersWithPasswords.length === 0) {
        console.log('\n❌ No users with passwords found')
        console.log('Password reset only works for users with passwords (not OAuth users)')
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()