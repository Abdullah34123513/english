const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding admin user...')

  try {
    // Clean up existing admin user if exists
    console.log('🧹 Cleaning up existing admin user...')
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'admin@englishplatform.com' },
          { email: 'demo.admin@example.com' }
        ]
      }
    })

    // Hash password for admin
    const adminPassword = 'admin123'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    console.log('👤 Creating admin user...')

    // Create super admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@englishplatform.com',
        name: 'Super Admin',
        role: 'ADMIN',
        password: hashedPassword,
        emailVerified: true, // Admin doesn't need email verification
        bio: 'Super Administrator with full access to platform management',
        location: 'Remote',
        timezone: 'UTC',
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('')
    console.log('📧 Admin Account Details:')
    console.log('   ┌─────────────────────────────────────────────────────────────────────────────────┐')
    console.log('   │ EMAIL: admin@englishplatform.com                                            │')
    console.log('   │ NAME: Super Admin                                                           │')
    console.log('   │ ROLE: ADMIN                                                                │')
    console.log('   │ EMAIL VERIFIED: ✅ Yes                                                    │')
    console.log('   │ PASSWORD: admin123                                                          │')
    console.log('   └─────────────────────────────────────────────────────────────────────────────────┘')
    console.log('')
    console.log('🔐 You can now login with these credentials!')
    console.log('📝 The admin user has email verified = true, so no email verification is required.')
    console.log('🌐 Access the admin dashboard at: /dashboard/admin')

  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })