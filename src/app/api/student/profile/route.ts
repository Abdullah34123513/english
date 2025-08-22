import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Helper function to calculate learning streak
function calculateLearningStreak(bookings: any[]): number {
  if (!bookings || bookings.length === 0) return 0
  
  // Get completed bookings sorted by date (newest first)
  const completedBookings = bookings
    .filter(booking => booking.status === 'COMPLETED')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
  
  if (completedBookings.length === 0) return 0
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  // Check each day going backwards
  for (let i = 0; i < completedBookings.length; i++) {
    const bookingDate = new Date(completedBookings[i].startTime)
    bookingDate.setHours(0, 0, 0, 0)
    
    const daysDiff = Math.floor((currentDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === streak) {
      // This booking is on the expected day of the streak
      streak++
    } else if (daysDiff === streak + 1) {
      // There's a gap, but we might have missed a day
      // Check if there's another booking on the missing day
      const missingDate = new Date(currentDate)
      missingDate.setDate(missingDate.getDate() - (streak + 1))
      
      const hasBookingOnMissingDay = completedBookings.some(booking => {
        const bDate = new Date(booking.startTime)
        bDate.setHours(0, 0, 0, 0)
        return bDate.getTime() === missingDate.getTime()
      })
      
      if (hasBookingOnMissingDay) {
        streak++
      } else {
        break
      }
    } else {
      break
    }
  }
  
  return streak
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if student profile exists
    const studentProfile = await db.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return NextResponse.json({ 
        error: "Student profile not found",
        message: "Please complete your student profile first",
        requiresProfile: true 
      }, { status: 404 })
    }

    const student = await db.student.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        bookings: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    image: true,
                  }
                }
              }
            },
            review: true
          },
          orderBy: {
            startTime: "desc"
          }
        },
        reviews: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    // Calculate statistics
    const now = new Date()
    const bookings = student.bookings || []
    
    // Total classes (completed bookings)
    const totalClasses = bookings.filter(booking => booking.status === 'COMPLETED').length
    
    // Upcoming classes (confirmed bookings that haven't started yet)
    const upcomingClasses = bookings.filter(booking => 
      booking.status === 'CONFIRMED' && new Date(booking.startTime) > now
    ).length
    
    // Money spent (sum of approved payments)
    const moneySpent = bookings.reduce((total, booking) => {
      const approvedPayment = booking.payments?.find(payment => payment.status === 'APPROVED')
      return total + (approvedPayment?.amount || 0)
    }, 0)
    
    // Learning streak (calculate consecutive days with classes)
    const learningStreak = calculateLearningStreak(bookings)

    // Ensure statistics object always exists with default values
    const statistics = {
      totalClasses: totalClasses || 0,
      upcomingClasses: upcomingClasses || 0,
      moneySpent: moneySpent || 0,
      learningStreak: learningStreak || 0
    }

    // Parse JSON fields
    const parsedStudent = {
      ...student,
      learningGoals: student.learningGoals ? JSON.parse(student.learningGoals) : [],
      preferredLearningStyle: student.preferredLearningStyle ? JSON.parse(student.preferredLearningStyle) : [],
      teacherPreferences: student.teacherPreferences ? JSON.parse(student.teacherPreferences) : [],
      interests: student.interests ? JSON.parse(student.interests) : [],
      hobbies: student.hobbies ? JSON.parse(student.hobbies) : [],
      preferredDays: student.preferredDays ? JSON.parse(student.preferredDays) : [],
      preferredTimes: student.preferredTimes ? JSON.parse(student.preferredTimes) : [],
      statistics
    }

    return NextResponse.json(parsedStudent)
  } catch (error) {
    console.error("Error fetching student profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Check if student profile exists
    const studentProfile = await db.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    // Helper function to safely handle array fields
    const safeStringifyArray = (value: any): string | null => {
      if (!value) return null
      if (Array.isArray(value)) {
        return value.length > 0 ? JSON.stringify(value) : null
      }
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          return Array.isArray(parsed) && parsed.length > 0 ? value : null
        } catch {
          return value ? JSON.stringify([value]) : null
        }
      }
      return null
    }

    // Update student profile
    const updatedStudent = await db.student.update({
      where: { userId: session.user.id },
      data: {
        age: data.age ? String(data.age) : null,
        country: data.country || null,
        nativeLanguage: data.nativeLanguage || null,
        timezone: data.timezone || null,
        currentLevel: data.currentLevel || null,
        learningGoals: safeStringifyArray(data.learningGoals),
        targetScore: data.targetScore || null,
        preferredLearningStyle: safeStringifyArray(data.preferredLearningStyle),
        studyFrequency: data.studyFrequency || null,
        sessionDuration: data.sessionDuration || null,
        teacherPreferences: safeStringifyArray(data.teacherPreferences),
        interests: safeStringifyArray(data.interests),
        hobbies: safeStringifyArray(data.hobbies),
        preferredDays: safeStringifyArray(data.preferredDays),
        preferredTimes: safeStringifyArray(data.preferredTimes),
        previousExperience: data.previousExperience || null,
        specificNeeds: data.specificNeeds || null,
        motivation: data.motivation || null,
      }
    })

    // Also update user profile if country or timezone is provided
    if (data.country || data.timezone) {
      const updateData: any = {}
      if (data.country) updateData.location = data.country
      if (data.timezone) updateData.timezone = data.timezone
      
      await db.user.update({
        where: { id: session.user.id },
        data: updateData
      })
    }

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}