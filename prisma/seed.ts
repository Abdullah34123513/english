import { PrismaClient, UserRole, BookingStatus, PaymentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (optional - comment out if you want to preserve existing data)
  console.log('🗑️  Clearing existing data...')
  await prisma.message.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.review.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.emailVerification.deleteMany()
  await prisma.student.deleteMany()
  await prisma.teacher.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // Create Admin user
  console.log('👤 Creating admin user...')
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@englishplatform.com',
      name: 'System Administrator',
      password: adminPassword,
      role: UserRole.ADMIN,
      emailVerified: true,
      bio: 'System administrator for the English Learning Platform',
    },
  })

  // Create Teachers
  console.log('👨‍🏫 Creating teachers...')
  const teachers = []
  
  // Teacher 1 - Sarah Johnson
  const teacher1Password = await bcrypt.hash('teacher123', 12)
  const teacher1User = await prisma.user.create({
    data: {
      email: 'sarah.johnson@englishplatform.com',
      name: 'Sarah Johnson',
      password: teacher1Password,
      role: UserRole.TEACHER,
      emailVerified: true,
      bio: 'Experienced English teacher with 10+ years of teaching experience',
      location: 'United States',
      timezone: 'EST',
      language: 'English',
    },
  })

  const teacher1 = await prisma.teacher.create({
    data: {
      userId: teacher1User.id,
      bio: 'I am a certified English teacher with over 10 years of experience teaching students from all around the world. I specialize in business English, conversation practice, and exam preparation (IELTS, TOEFL). My teaching style is interactive and student-centered, focusing on practical communication skills.',
      hourlyRate: 35.0,
      experience: '10+ years',
      education: 'MA in TESOL, University of Cambridge',
      languages: JSON.stringify(['English', 'Spanish', 'French']),
      specializations: JSON.stringify(['Business English', 'IELTS Preparation', 'Conversation Practice', 'Accent Reduction']),
      teachingStyle: 'Interactive and conversational approach with real-world applications',
      preferredAgeGroups: JSON.stringify(['Adults', 'Teenagers']),
      certifications: JSON.stringify(['CELTA', 'TESOL Certificate', 'IELTS Examiner Certification']),
      trialLesson: true,
      isActive: true,
    },
  })

  // Teacher 1 Availability
  await prisma.availability.createMany({
    data: [
      { teacherId: teacher1.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
      { teacherId: teacher1.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
      { teacherId: teacher1.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
      { teacherId: teacher1.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
      { teacherId: teacher1.id, dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }, // Friday
    ],
  })

  teachers.push(teacher1)

  // Teacher 2 - Michael Chen
  const teacher2Password = await bcrypt.hash('teacher123', 12)
  const teacher2User = await prisma.user.create({
    data: {
      email: 'michael.chen@englishplatform.com',
      name: 'Michael Chen',
      password: teacher2Password,
      role: UserRole.TEACHER,
      emailVerified: true,
      bio: 'Native English speaker with expertise in academic writing and grammar',
      location: 'Canada',
      timezone: 'PST',
      language: 'English',
    },
  })

  const teacher2 = await prisma.teacher.create({
    data: {
      userId: teacher2User.id,
      bio: 'I am a native English speaker from Canada with a passion for teaching grammar and academic writing. I have helped hundreds of students improve their writing skills and achieve their academic goals. I believe in making grammar lessons engaging and practical.',
      hourlyRate: 28.0,
      experience: '8 years',
      education: 'BA in English Literature, University of Toronto',
      languages: JSON.stringify(['English', 'Mandarin']),
      specializations: JSON.stringify(['Academic Writing', 'Grammar', 'Essay Writing', 'Creative Writing']),
      teachingStyle: 'Structured and systematic approach with clear explanations',
      preferredAgeGroups: JSON.stringify(['Adults', 'Teenagers', 'Children']),
      certifications: JSON.stringify(['TEFL Certificate', 'Academic Writing Tutor Certification']),
      trialLesson: true,
      isActive: true,
    },
  })

  // Teacher 2 Availability
  await prisma.availability.createMany({
    data: [
      { teacherId: teacher2.id, dayOfWeek: 1, startTime: '12:00', endTime: '20:00' }, // Monday
      { teacherId: teacher2.id, dayOfWeek: 2, startTime: '12:00', endTime: '20:00' }, // Tuesday
      { teacherId: teacher2.id, dayOfWeek: 3, startTime: '12:00', endTime: '20:00' }, // Wednesday
      { teacherId: teacher2.id, dayOfWeek: 4, startTime: '12:00', endTime: '20:00' }, // Thursday
      { teacherId: teacher2.id, dayOfWeek: 5, startTime: '12:00', endTime: '18:00' }, // Friday
      { teacherId: teacher2.id, dayOfWeek: 6, startTime: '10:00', endTime: '16:00' }, // Saturday
    ],
  })

  teachers.push(teacher2)

  // Teacher 3 - Emma Williams
  const teacher3Password = await bcrypt.hash('teacher123', 12)
  const teacher3User = await prisma.user.create({
    data: {
      email: 'emma.williams@englishplatform.com',
      name: 'Emma Williams',
      password: teacher3Password,
      role: UserRole.TEACHER,
      emailVerified: true,
      bio: 'British English teacher specializing in pronunciation and accent training',
      location: 'United Kingdom',
      timezone: 'GMT',
      language: 'English',
    },
  })

  const teacher3 = await prisma.teacher.create({
    data: {
      userId: teacher3User.id,
      bio: 'I am a British English teacher specializing in pronunciation, accent reduction, and fluency training. As a former BBC presenter, I can help you achieve a clear, natural British accent. My lessons are fun, interactive, and tailored to your specific needs.',
      hourlyRate: 42.0,
      experience: '15+ years',
      education: 'MA in Linguistics, University of Oxford',
      languages: JSON.stringify(['English', 'German', 'Italian']),
      specializations: JSON.stringify(['Pronunciation', 'Accent Reduction', 'British English', 'Public Speaking']),
      teachingStyle: 'Communicative approach with emphasis on pronunciation and fluency',
      preferredAgeGroups: JSON.stringify(['Adults', 'Teenagers']),
      certifications: JSON.stringify(['CELTA', 'Diploma in TESOL', 'Pronunciation Teaching Certificate']),
      trialLesson: true,
      isActive: true,
    },
  })

  // Teacher 3 Availability
  await prisma.availability.createMany({
    data: [
      { teacherId: teacher3.id, dayOfWeek: 1, startTime: '08:00', endTime: '16:00' }, // Monday
      { teacherId: teacher3.id, dayOfWeek: 2, startTime: '08:00', endTime: '16:00' }, // Tuesday
      { teacherId: teacher3.id, dayOfWeek: 3, startTime: '08:00', endTime: '16:00' }, // Wednesday
      { teacherId: teacher3.id, dayOfWeek: 4, startTime: '08:00', endTime: '16:00' }, // Thursday
      { teacherId: teacher3.id, dayOfWeek: 5, startTime: '08:00', endTime: '12:00' }, // Friday
    ],
  })

  teachers.push(teacher3)

  // Create Students
  console.log('👨‍🎓 Creating students...')
  const students = []

  // Student 1 - Juan Rodriguez
  const student1Password = await bcrypt.hash('student123', 12)
  const student1User = await prisma.user.create({
    data: {
      email: 'juan.rodriguez@email.com',
      name: 'Juan Rodriguez',
      password: student1Password,
      role: UserRole.STUDENT,
      emailVerified: true,
      location: 'Spain',
      timezone: 'CET',
      language: 'Spanish',
    },
  })

  const student1 = await prisma.student.create({
    data: {
      userId: student1User.id,
      age: '25-34',
      country: 'Spain',
      nativeLanguage: 'Spanish',
      timezone: 'CET',
      currentLevel: 'Intermediate',
      learningGoals: JSON.stringify(['Improve conversation skills', 'Business English', 'Prepare for job interviews']),
      targetScore: 'IELTS 7.0',
      preferredLearningStyle: JSON.stringify(['Interactive', 'Practical exercises']),
      studyFrequency: '3 times per week',
      sessionDuration: '60 minutes',
      teacherPreferences: JSON.stringify(['Native speaker', 'Business experience']),
      interests: JSON.stringify(['Technology', 'Business', 'Travel']),
      hobbies: JSON.stringify(['Reading', 'Swimming', 'Photography']),
      preferredDays: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
      preferredTimes: JSON.stringify(['18:00', '19:00', '20:00']),
      previousExperience: 'Studied English in school for 8 years, but need more practice speaking',
      specificNeeds: 'Need to improve business English for work',
      motivation: 'Career advancement and international travel',
    },
  })

  students.push(student1)

  // Student 2 - Marie Dubois
  const student2Password = await bcrypt.hash('student123', 12)
  const student2User = await prisma.user.create({
    data: {
      email: 'marie.dubois@email.com',
      name: 'Marie Dubois',
      password: student2Password,
      role: UserRole.STUDENT,
      emailVerified: true,
      location: 'France',
      timezone: 'CET',
      language: 'French',
    },
  })

  const student2 = await prisma.student.create({
    data: {
      userId: student2User.id,
      age: '18-24',
      country: 'France',
      nativeLanguage: 'French',
      timezone: 'CET',
      currentLevel: 'Advanced',
      learningGoals: JSON.stringify(['Perfect accent', 'Academic writing', 'IELTS preparation']),
      targetScore: 'IELTS 8.0',
      preferredLearningStyle: JSON.stringify(['Structured', 'Grammar-focused']),
      studyFrequency: 'Daily',
      sessionDuration: '90 minutes',
      teacherPreferences: JSON.stringify(['British accent', 'Academic background']),
      interests: JSON.stringify(['Literature', 'Academics', 'Art']),
      hobbies: JSON.stringify(['Reading', 'Writing', 'Painting']),
      preferredDays: JSON.stringify(['Tuesday', 'Thursday', 'Saturday']),
      preferredTimes: JSON.stringify(['10:00', '14:00', '16:00']),
      previousExperience: 'Advanced level, studied in English-speaking country for 1 year',
      specificNeeds: 'Want to achieve native-like fluency',
      motivation: 'Planning to study abroad in English-speaking country',
    },
  })

  students.push(student2)

  // Student 3 - Ahmed Hassan
  const student3Password = await bcrypt.hash('student123', 12)
  const student3User = await prisma.user.create({
    data: {
      email: 'ahmed.hassan@email.com',
      name: 'Ahmed Hassan',
      password: student3Password,
      role: UserRole.STUDENT,
      emailVerified: true,
      location: 'Egypt',
      timezone: 'EET',
      language: 'Arabic',
    },
  })

  const student3 = await prisma.student.create({
    data: {
      userId: student3User.id,
      age: '35-44',
      country: 'Egypt',
      nativeLanguage: 'Arabic',
      timezone: 'EET',
      currentLevel: 'Beginner',
      learningGoals: JSON.stringify(['Basic conversation', 'Travel English', 'Family communication']),
      targetScore: 'Basic communication',
      preferredLearningStyle: JSON.stringify(['Visual', 'Repetitive practice']),
      studyFrequency: '2 times per week',
      sessionDuration: '45 minutes',
      teacherPreferences: JSON.stringify(['Patient', 'Experience with beginners']),
      interests: JSON.stringify(['Travel', 'Family', 'Business']),
      hobbies: JSON.stringify(['Football', 'Cooking', 'Travel']),
      preferredDays: JSON.stringify(['Saturday', 'Sunday', 'Monday']),
      preferredTimes: JSON.stringify(['19:00', '20:00', '21:00']),
      previousExperience: 'Very little formal English training',
      specificNeeds: 'Need to learn basic English for family travel',
      motivation: 'Want to communicate with international family members',
    },
  })

  students.push(student3)

  // Create Bookings
  console.log('📅 Creating bookings...')
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  // Booking 1 - Juan with Sarah (Completed)
  const booking1 = await prisma.booking.create({
    data: {
      studentId: student1.id,
      teacherId: teacher1.id,
      startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 1 hour duration
      status: BookingStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
      meetLink: 'https://meet.google.com/abc-defg-hij',
      notes: 'Business English lesson - focused on presentation skills',
    },
  })

  // Payment for booking 1
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      studentId: student1.id,
      transactionId: 'TRX001',
      amount: 35.0,
      paymentDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      bankName: 'Bank of Spain',
      accountNumber: 'ES12345678901234567890',
      receiptImage: '/receipts/trx001.jpg',
      notes: 'Payment for business English lesson',
      status: 'APPROVED',
      approvedBy: admin.id,
      approvedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    },
  })

  // Review for booking 1
  await prisma.review.create({
    data: {
      studentId: student1.id,
      teacherId: teacher1.id,
      bookingId: booking1.id,
      rating: 5,
      comment: 'Excellent teacher! Sarah helped me improve my presentation skills significantly. Very professional and knowledgeable.',
    },
  })

  // Booking 2 - Marie with Michael (Confirmed)
  const booking2 = await prisma.booking.create({
    data: {
      studentId: student2.id,
      teacherId: teacher2.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 90 * 60 * 1000), // 90 minutes duration
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      meetLink: 'https://meet.google.com/klm-nopq-rst',
      notes: 'Academic writing session - essay structure and thesis statement',
    },
  })

  // Payment for booking 2
  await prisma.payment.create({
    data: {
      bookingId: booking2.id,
      studentId: student2.id,
      transactionId: 'TRX002',
      amount: 42.0, // 90 minutes at $28/hour
      paymentDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      bankName: 'BNP Paribas',
      accountNumber: 'FR1234567890123456789012345',
      receiptImage: '/receipts/trx002.jpg',
      notes: 'Payment for academic writing session',
      status: 'APPROVED',
      approvedBy: admin.id,
      approvedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    },
  })

  // Booking 3 - Ahmed with Emma (Pending)
  const booking3 = await prisma.booking.create({
    data: {
      studentId: student3.id,
      teacherId: teacher3.id,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 45 * 60 * 1000), // 45 minutes duration
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      notes: 'Beginner conversation practice - basic greetings and introductions',
    },
  })

  // Payment for booking 3 (pending approval)
  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      studentId: student3.id,
      transactionId: 'TRX003',
      amount: 31.5, // 45 minutes at $42/hour
      paymentDate: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      bankName: 'National Bank of Egypt',
      accountNumber: 'EG123456789012345678901234567890',
      receiptImage: '/receipts/trx003.jpg',
      notes: 'Payment for beginner conversation lesson',
      status: 'PENDING',
    },
  })

  // Create Messages
  console.log('💬 Creating messages...')
  const messages = [
    {
      senderId: student1User.id,
      receiverId: teacher1User.id,
      content: 'Hi Sarah! I really enjoyed our lesson yesterday. When can we schedule our next session?',
    },
    {
      senderId: teacher1User.id,
      receiverId: student1User.id,
      content: 'Hi Juan! I\'m glad you enjoyed the lesson. I\'m available on Wednesday and Friday at the same time. Would either of those work for you?',
    },
    {
      senderId: student2User.id,
      receiverId: teacher2User.id,
      content: 'Hello Michael, I have a question about the essay structure we discussed. Could you recommend some additional resources?',
    },
    {
      senderId: teacher2User.id,
      receiverId: student2User.id,
      content: 'Hi Marie! I\'d be happy to recommend some resources. I\'ll send you an email with a list of helpful materials and websites.',
    },
    {
      senderId: student3User.id,
      receiverId: teacher3User.id,
      content: 'Hello Emma, I\'m looking forward to our lesson next week. I\'m a bit nervous as I\'m just starting to learn English.',
    },
    {
      senderId: teacher3User.id,
      receiverId: student3User.id,
      content: 'Hello Ahmed! There\'s no need to be nervous. I specialize in working with beginners and we\'ll take everything step by step. See you next week!',
    },
  ]

  for (const msg of messages) {
    await prisma.message.create({
      data: {
        ...msg,
        isRead: Math.random() > 0.5, // Random read status
      },
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log('📊 Summary:')
  console.log(`   - Admin: 1 (${admin.email})`)
  console.log(`   - Teachers: ${teachers.length}`)
  console.log(`   - Students: ${students.length}`)
  console.log(`   - Bookings: 3`)
  console.log(`   - Payments: 3`)
  console.log(`   - Reviews: 1`)
  console.log(`   - Messages: ${messages.length}`)
  console.log('')
  console.log('🔑 Test Credentials:')
  console.log('   Admin: admin@englishplatform.com / admin123')
  console.log('   Teachers: sarah.johnson@englishplatform.com / teacher123')
  console.log('             michael.chen@englishplatform.com / teacher123')
  console.log('             emma.williams@englishplatform.com / teacher123')
  console.log('   Students: juan.rodriguez@email.com / student123')
  console.log('             marie.dubois@email.com / student123')
  console.log('             ahmed.hassan@email.com / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })