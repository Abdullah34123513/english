// Script to check what users exist in the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('=== CHECKING DATABASE USERS ===\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    });

    console.log(`Found ${users.length} users in the database:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    // Check for teachers specifically
    const teachers = await prisma.teacher.findMany({
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

    console.log(`\nFound ${teachers.length} teachers:\n`);
    
    teachers.forEach((teacher, index) => {
      console.log(`${index + 1}. Teacher ID: ${teacher.id}`);
      console.log(`   User ID: ${teacher.user.id}`);
      console.log(`   Email: ${teacher.user.email}`);
      console.log(`   Name: ${teacher.user.name || 'N/A'}`);
      console.log(`   Hourly Rate: ${teacher.hourlyRate}`);
      console.log(`   Active: ${teacher.isActive}`);
      console.log('');
    });

    // Check for students specifically
    const students = await prisma.student.findMany({
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

    console.log(`\nFound ${students.length} students:\n`);
    
    students.forEach((student, index) => {
      console.log(`${index + 1}. Student ID: ${student.id}`);
      console.log(`   User ID: ${student.user.id}`);
      console.log(`   Email: ${student.user.email}`);
      console.log(`   Name: ${student.user.name || 'N/A'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();