const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  try {
    // Clean up existing data
    console.log('🧹 Cleaning up existing data...')
    await prisma.review.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.availability.deleteMany()
    await prisma.student.deleteMany()
    await prisma.teacher.deleteMany()
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'demo.teacher@example.com' },
          { email: 'demo.teacher2@example.com' },
          { email: 'demo.teacher3@example.com' },
          { email: 'demo.student@example.com' },
          { email: 'demo.student2@example.com' },
          { email: 'demo.student3@example.com' },
          { email: 'demo.admin@example.com' }
        ]
      }
    })

    // Hash password for demo users
    const demoPassword = 'demo123'
    const hashedPassword = await bcrypt.hash(demoPassword, 12)

    console.log('👥 Creating users...')

    // Create demo teacher 1 - Sarah Johnson
    const teacher1User = await prisma.user.create({
      data: {
        email: 'demo.teacher@example.com',
        name: 'Sarah Johnson',
        role: 'TEACHER',
        password: hashedPassword,
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
      },
    })

    const teacher1 = await prisma.teacher.create({
      data: {
        userId: teacher1User.id,
        bio: 'Certified English teacher with 8+ years of experience. Specializing in business English and conversation practice. I love helping students achieve their language learning goals through personalized lessons and engaging conversations.',
        hourlyRate: 30.0,
        experience: '8+ years',
        education: 'MA in TESOL, University of Cambridge',
        languages: JSON.stringify(['English', 'French', 'Spanish']),
        specializations: JSON.stringify(['Business English', 'Conversation Practice', 'IELTS Preparation', 'Accent Reduction']),
        teachingStyle: 'Interactive and conversational approach with focus on real-world applications',
        preferredAgeGroups: JSON.stringify(['Adults', 'Young Professionals']),
        certifications: JSON.stringify(['TESOL', 'CELTA', 'Business English Certificate']),
      },
    })

    // Create demo teacher 2 - Emma Wilson
    const teacher2User = await prisma.user.create({
      data: {
        email: 'demo.teacher2@example.com',
        name: 'Emma Wilson',
        role: 'TEACHER',
        password: hashedPassword,
        image: 'https://randomuser.me/api/portraits/women/2.jpg',
      },
    })

    const teacher2 = await prisma.teacher.create({
      data: {
        userId: teacher2User.id,
        bio: 'Native English speaker from London. Expert in IELTS preparation and academic English. Passionate about helping students succeed in their academic and professional journeys.',
        hourlyRate: 35.0,
        experience: '6 years',
        education: 'BA in English Literature, University of Oxford',
        languages: JSON.stringify(['English', 'German']),
        specializations: JSON.stringify(['IELTS Preparation', 'Academic English', 'Writing Skills', 'Grammar']),
        teachingStyle: 'Structured and methodical approach with clear learning objectives',
        preferredAgeGroups: JSON.stringify(['Teenagers', 'Adults', 'University Students']),
        certifications: JSON.stringify(['TEFL', 'IELTS Examiner Certification']),
      },
    })

    // Create demo teacher 3 - David Chen
    const teacher3User = await prisma.user.create({
      data: {
        email: 'demo.teacher3@example.com',
        name: 'David Chen',
        role: 'TEACHER',
        password: hashedPassword,
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    })

    const teacher3 = await prisma.teacher.create({
      data: {
        userId: teacher3User.id,
        bio: 'Experienced English teacher specializing in pronunciation and accent training. Native speaker with background in linguistics and speech therapy.',
        hourlyRate: 28.0,
        experience: '10+ years',
        education: 'MA in Linguistics, Stanford University',
        languages: JSON.stringify(['English', 'Mandarin', 'Cantonese']),
        specializations: JSON.stringify(['Pronunciation Training', 'Accent Reduction', 'Public Speaking', 'Business Communication']),
        teachingStyle: 'Patient and supportive with focus on pronunciation and speaking confidence',
        preferredAgeGroups: JSON.stringify(['Adults', 'Professionals']),
        certifications: JSON.stringify(['TESOL', 'Pronunciation Teaching Certificate']),
      },
    })

    // Create demo student 1 - Mike Chen
    const student1User = await prisma.user.create({
      data: {
        email: 'demo.student@example.com',
        name: 'Mike Chen',
        role: 'STUDENT',
        password: hashedPassword,
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    })

    const student1 = await prisma.student.create({
      data: {
        userId: student1User.id,
        age: '25-34',
        country: 'United States',
        nativeLanguage: 'Mandarin',
        timezone: 'EST',
        currentLevel: 'Intermediate',
        learningGoals: JSON.stringify(['Improve conversation skills', 'Business English', 'Accent reduction']),
        targetScore: '7.5',
        preferredLearningStyle: JSON.stringify(['Interactive', 'Visual', 'Conversational']),
        studyFrequency: '3 times per week',
        sessionDuration: '60 minutes',
        teacherPreferences: JSON.stringify(['Native speaker', 'Business experience', 'Patient']),
        interests: JSON.stringify(['Technology', 'Business', 'Travel', 'Music']),
        hobbies: JSON.stringify(['Reading', 'Hiking', 'Photography', 'Cooking']),
        preferredDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
        preferredTimes: JSON.stringify(['Evening', 'Afternoon']),
        previousExperience: 'Studied English in school for 10 years, but limited speaking practice',
        specificNeeds: 'Need to improve business English for work presentations',
        motivation: 'Career advancement and better communication with international colleagues',
      },
    })

    // Create demo student 2 - Lisa Wang
    const student2User = await prisma.user.create({
      data: {
        email: 'demo.student2@example.com',
        name: 'Lisa Wang',
        role: 'STUDENT',
        password: hashedPassword,
        image: 'https://randomuser.me/api/portraits/women/3.jpg',
      },
    })

    const student2 = await prisma.student.create({
      data: {
        userId: student2User.id,
        age: '18-24',
        country: 'China',
        nativeLanguage: 'Mandarin',
        timezone: 'CST',
        currentLevel: 'Advanced',
        learningGoals: JSON.stringify(['IELTS preparation', 'Academic writing', 'Vocabulary expansion']),
        targetScore: '8.0',
        preferredLearningStyle: JSON.stringify(['Structured', 'Academic', 'Detailed']),
        studyFrequency: 'Daily',
        sessionDuration: '90 minutes',
        teacherPreferences: JSON.stringify(['IELTS expert', 'Academic background', 'Strict']),
        interests: JSON.stringify(['Education', 'Literature', 'Science', 'Art']),
        hobbies: JSON.stringify(['Reading', 'Writing', 'Painting', 'Classical music']),
        preferredDays: JSON.stringify(['Tuesday', 'Thursday', 'Saturday']),
        preferredTimes: JSON.stringify(['Morning', 'Evening']),
        previousExperience: 'Advanced level, preparing for IELTS exam',
        specificNeeds: 'Need to achieve band 8.0 for university admission',
        motivation: 'Study abroad opportunities',
      },
    })

    // Create demo student 3 - Carlos Rodriguez
    const student3User = await prisma.user.create({
      data: {
        email: 'demo.student3@example.com',
        name: 'Carlos Rodriguez',
        role: 'STUDENT',
        password: hashedPassword,
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
    })

    const student3 = await prisma.student.create({
      data: {
        userId: student3User.id,
        age: '35-44',
        country: 'Spain',
        nativeLanguage: 'Spanish',
        timezone: 'CET',
        currentLevel: 'Beginner',
        learningGoals: JSON.stringify(['Basic conversation', 'Travel English', 'Pronunciation']),
        targetScore: '6.0',
        preferredLearningStyle: JSON.stringify(['Relaxed', 'Conversational', 'Fun']),
        studyFrequency: '2 times per week',
        sessionDuration: '45 minutes',
        teacherPreferences: JSON.stringify(['Patient', 'Friendly', 'Native speaker']),
        interests: JSON.stringify(['Sports', 'Travel', 'Food', 'Movies']),
        hobbies: JSON.stringify(['Football', 'Cooking', 'Traveling', 'Watching movies']),
        preferredDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
        preferredTimes: JSON.stringify(['Evening']),
        previousExperience: 'Very limited, took some basic courses years ago',
        specificNeeds: 'Need basic conversation skills for travel and work',
        motivation: 'Career change and international travel',
      },
    })

    // Create demo admin
    const adminUser = await prisma.user.create({
      data: {
        email: 'demo.admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
        password: hashedPassword,
      },
    })

    console.log('📅 Creating availability...')

    // Create availability for teacher 1
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    for (let day = 1; day <= 5; day++) {
      for (let i = 0; i < timeSlots.length - 1; i++) {
        await prisma.availability.create({
          data: {
            teacherId: teacher1.id,
            dayOfWeek: day,
            startTime: timeSlots[i],
            endTime: timeSlots[i + 1],
            isAvailable: true,
          }
        })
      }
    }

    // Create availability for teacher 2
    const afternoonSlots = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    for (let day = 1; day <= 5; day++) {
      for (let i = 0; i < afternoonSlots.length - 1; i++) {
        await prisma.availability.create({
          data: {
            teacherId: teacher2.id,
            dayOfWeek: day,
            startTime: afternoonSlots[i],
            endTime: afternoonSlots[i + 1],
            isAvailable: true,
          }
        })
      }
    }

    // Create availability for teacher 3
    for (let day = 1; day <= 5; day++) {
      await prisma.availability.create({
        data: {
          teacherId: teacher3.id,
          dayOfWeek: day,
          startTime: '18:00',
          endTime: '22:00',
          isAvailable: true,
        }
      })
    }

    // Weekend availability for teacher 3
    for (let day = 0; day <= 6; day += 6) {
      await prisma.availability.create({
        data: {
          teacherId: teacher3.id,
          dayOfWeek: day,
          startTime: '10:00',
          endTime: '18:00',
          isAvailable: true,
        }
      })
    }

    console.log('📋 Creating bookings...')

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const booking1 = await prisma.booking.create({
      data: {
        studentId: student1.id,
        teacherId: teacher1.id,
        startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0, 0),
        endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0, 0),
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        meetLink: 'https://meet.google.com/abc-defg-hij',
        notes: 'Business English lesson - presentation skills',
      },
    })

    const booking2 = await prisma.booking.create({
      data: {
        studentId: student2.id,
        teacherId: teacher2.id,
        startTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0, 0),
        endTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 30, 0),
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        meetLink: 'https://meet.google.com/klm-nopq-rst',
        notes: 'IELTS writing practice',
      },
    })

    const booking3 = await prisma.booking.create({
      data: {
        studentId: student3.id,
        teacherId: teacher3.id,
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 19, 0, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 19, 45, 0),
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        meetLink: 'https://meet.google.com/uvw-xyz-123',
        notes: 'Basic conversation practice',
      },
    })

    console.log('⭐ Creating reviews...')

    await prisma.review.create({
      data: {
        studentId: student1.id,
        teacherId: teacher1.id,
        bookingId: booking1.id,
        rating: 5,
        comment: 'Sarah is an excellent teacher! Her business English lessons are very practical and have helped me improve my presentation skills significantly. Highly recommended!',
      },
    })

    await prisma.review.create({
      data: {
        studentId: student2.id,
        teacherId: teacher2.id,
        bookingId: booking2.id,
        rating: 4,
        comment: 'Emma is very knowledgeable about IELTS preparation. Her structured approach helped me understand the exam format better. Would appreciate more speaking practice though.',
      },
    })

    console.log('✅ Database seeded successfully!')
    console.log('')
    console.log('📧 Demo Accounts:')
    console.log('   ┌─────────────────────────────────────────────────────────────────────────────────┐')
    console.log('   │ TEACHER 1: demo.teacher@example.com                                          │')
    console.log('   │   - Name: Sarah Johnson                                                       │')
    console.log('   │   - Rate: $30/hour                                                           │')
    console.log('   │   - Specialties: Business English, Conversation, IELTS, Accent Reduction     │')
    console.log('   │   - Availability: Mon-Fri, 9:00 AM - 6:00 PM                                  │')
    console.log('   ├─────────────────────────────────────────────────────────────────────────────────┤')
    console.log('   │ TEACHER 2: demo.teacher2@example.com                                         │')
    console.log('   │   - Name: Emma Wilson                                                        │')
    console.log('   │   - Rate: $35/hour                                                           │')
    console.log('   │   - Specialties: IELTS Preparation, Academic English, Writing, Grammar       │')
    console.log('   │   - Availability: Mon-Fri, 2:00 PM - 8:00 PM                                  │')
    console.log('   ├─────────────────────────────────────────────────────────────────────────────────┤')
    console.log('   │ TEACHER 3: demo.teacher3@example.com                                         │')
    console.log('   │   - Name: David Chen                                                         │')
    console.log('   │   - Rate: $28/hour                                                           │')
    console.log('   │   - Specialties: Pronunciation, Accent Reduction, Public Speaking           │')
    console.log('   │   - Availability: Mon-Fri, 6:00 PM - 10:00 PM, Weekends 10:00 AM - 6:00 PM   │')
    console.log('   ├─────────────────────────────────────────────────────────────────────────────────┤')
    console.log('   │ STUDENT 1: demo.student@example.com                                          │')
    console.log('   │   - Name: Mike Chen                                                          │')
    console.log('   │   - Level: Intermediate                                                     │')
    console.log('   │   - Goals: Business English, Conversation, Accent Reduction                 │')
    console.log('   ├─────────────────────────────────────────────────────────────────────────────────┤')
    console.log('   │ STUDENT 2: demo.student2@example.com                                         │')
    console.log('   │   - Name: Lisa Wang                                                          │')
    console.log('   │   - Level: Advanced                                                         │')
    console.log('   │   - Goals: IELTS Preparation, Academic Writing                               │')
    console.log('   ├─────────────────────────────────────────────────────────────────────────────────┤')
    console.log('   │ STUDENT 3: demo.student3@example.com                                         │')
    console.log('   │   - Name: Carlos Rodriguez                                                   │')
    console.log('   │   - Level: Beginner                                                          │')
    console.log('   │   - Goals: Basic Conversation, Travel English                                 │')
    console.log('   ├─────────────────────────────────────────────────────────────────────────────────┤')
    console.log('   │ ADMIN: demo.admin@example.com                                                │')
    console.log('   │   - Name: Admin User                                                         │')
    console.log('   └─────────────────────────────────────────────────────────────────────────────────┘')
    console.log('')
    console.log('🔐 Password for all demo accounts: demo123')
    console.log('   You can now use these credentials for password-based login!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
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