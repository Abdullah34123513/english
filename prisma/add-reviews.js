const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('⭐ Adding reviews to existing data...')

  try {
    // Get existing data
    const student1 = await prisma.student.findFirst({
      where: {
        user: {
          email: 'demo.student@example.com'
        }
      }
    })

    const teacher1 = await prisma.teacher.findFirst({
      where: {
        user: {
          email: 'demo.teacher@example.com'
        }
      }
    })

    const booking1 = await prisma.booking.findFirst({
      where: {
        studentId: student1.id,
        teacherId: teacher1.id
      }
    })

    const student2 = await prisma.student.findFirst({
      where: {
        user: {
          email: 'demo.student2@example.com'
        }
      }
    })

    const teacher2 = await prisma.teacher.findFirst({
      where: {
        user: {
          email: 'demo.teacher2@example.com'
        }
      }
    })

    const booking2 = await prisma.booking.findFirst({
      where: {
        studentId: student2.id,
        teacherId: teacher2.id
      }
    })

    console.log('🔍 Found data:')
    console.log('Student1 ID:', student1?.id)
    console.log('Teacher1 ID:', teacher1?.id)
    console.log('Booking1 ID:', booking1?.id)
    console.log('Student2 ID:', student2?.id)
    console.log('Teacher2 ID:', teacher2?.id)
    console.log('Booking2 ID:', booking2?.id)

    if (booking1 && student1 && teacher1) {
      console.log('Creating review 1...')
      await prisma.review.create({
        data: {
          studentId: student1.id,
          teacherId: teacher1.id,
          bookingId: booking1.id,
          rating: 5,
          comment: 'Sarah is an excellent teacher! Her business English lessons are very practical and have helped me improve my presentation skills significantly. Highly recommended!',
        },
      })
      console.log('✅ Review 1 created successfully')
    }

    if (booking2 && student2 && teacher2) {
      console.log('Creating review 2...')
      await prisma.review.create({
        data: {
          studentId: student2.id,
          teacherId: teacher2.id,
          bookingId: booking2.id,
          rating: 4,
          comment: 'Emma is very knowledgeable about IELTS preparation. Her structured approach helped me understand the exam format better. Would appreciate more speaking practice though.',
        },
      })
      console.log('✅ Review 2 created successfully')
    }

    console.log('✅ Reviews added successfully!')

  } catch (error) {
    console.error('❌ Error adding reviews:', error.message)
    console.error('Full error:', error)
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