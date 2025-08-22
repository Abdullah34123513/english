import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

    return NextResponse.json(student)
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

    // Update student profile
    const updatedStudent = await db.student.update({
      where: { userId: session.user.id },
      data: {
        age: data.age || null,
        country: data.country || null,
        nativeLanguage: data.nativeLanguage || null,
        timezone: data.timezone || null,
        currentLevel: data.currentLevel || null,
        learningGoals: data.learningGoals && data.learningGoals.length > 0 ? JSON.stringify(data.learningGoals) : null,
        targetScore: data.targetScore || null,
        preferredLearningStyle: data.preferredLearningStyle && data.preferredLearningStyle.length > 0 ? JSON.stringify(data.preferredLearningStyle) : null,
        studyFrequency: data.studyFrequency || null,
        sessionDuration: data.sessionDuration || null,
        teacherPreferences: data.teacherPreferences && data.teacherPreferences.length > 0 ? JSON.stringify(data.teacherPreferences) : null,
        interests: data.interests && data.interests.length > 0 ? JSON.stringify(data.interests) : null,
        hobbies: data.hobbies && data.hobbies.length > 0 ? JSON.stringify(data.hobbies) : null,
        preferredDays: data.preferredDays && data.preferredDays.length > 0 ? JSON.stringify(data.preferredDays) : null,
        preferredTimes: data.preferredTimes && data.preferredTimes.length > 0 ? JSON.stringify(data.preferredTimes) : null,
        previousExperience: data.previousExperience || null,
        specificNeeds: data.specificNeeds || null,
        motivation: data.motivation || null,
      }
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error("Error updating student profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}