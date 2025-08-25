// Script to check if a specific teacher exists
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTeacher(teacherId) {
  try {
    console.log(`=== CHECKING TEACHER: ${teacherId} ===\n`);

    // Check if teacher exists in users table
    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true
      }
    });

    if (user) {
      console.log('✅ User found in users table:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
    } else {
      console.log('❌ User NOT found in users table');
    }

    console.log('');

    // Check if teacher exists in teachers table
    const teacher = await prisma.teacher.findUnique({
      where: { userId: teacherId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (teacher) {
      console.log('✅ Teacher found in teachers table:');
      console.log(`   Teacher ID: ${teacher.id}`);
      console.log(`   User ID: ${teacher.user.id}`);
      console.log(`   Email: ${teacher.user.email}`);
      console.log(`   Name: ${teacher.user.name || 'N/A'}`);
      console.log(`   Hourly Rate: ${teacher.hourlyRate}`);
      console.log(`   Active: ${teacher.isActive}`);
    } else {
      console.log('❌ Teacher NOT found in teachers table');
    }

    console.log('');

    // Check if teacher exists by teacher ID (not user ID)
    const teacherById = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    if (teacherById) {
      console.log('✅ Teacher found by teacher ID:');
      console.log(`   Teacher ID: ${teacherById.id}`);
      console.log(`   User ID: ${teacherById.user.id}`);
      console.log(`   Email: ${teacherById.user.email}`);
      console.log(`   Name: ${teacherById.user.name || 'N/A'}`);
    } else {
      console.log('❌ Teacher NOT found by teacher ID');
    }

  } catch (error) {
    console.error('Error checking teacher:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get teacher ID from command line argument
const teacherId = process.argv[2];

if (!teacherId) {
  console.log('Please provide a teacher ID as an argument');
  console.log('Usage: node check-teacher.js <teacher-id>');
  process.exit(1);
}

checkTeacher(teacherId);