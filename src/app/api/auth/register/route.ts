import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      role,
      teacherData,
      studentData
    } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        role: role as UserRole,
      }
    })

    // Create role-specific profile
    if (role === "STUDENT") {
      if (!studentData) {
        return NextResponse.json(
          { error: "Student data is required" },
          { status: 400 }
        )
      }

      await db.student.create({
        data: {
          userId: user.id,
          age: studentData.age || null,
          country: studentData.country || null,
          nativeLanguage: studentData.nativeLanguage || null,
          timezone: studentData.timezone || null,
          currentLevel: studentData.currentLevel || null,
          learningGoals: studentData.learningGoals ? JSON.stringify(studentData.learningGoals) : null,
          targetScore: studentData.targetScore || null,
          preferredLearningStyle: studentData.preferredLearningStyle ? JSON.stringify(studentData.preferredLearningStyle) : null,
          studyFrequency: studentData.studyFrequency || null,
          sessionDuration: studentData.sessionDuration || null,
          teacherPreferences: studentData.teacherPreferences ? JSON.stringify(studentData.teacherPreferences) : null,
          interests: studentData.interests ? JSON.stringify(studentData.interests) : null,
          hobbies: studentData.hobbies ? JSON.stringify(studentData.hobbies) : null,
          preferredDays: studentData.preferredDays ? JSON.stringify(studentData.preferredDays) : null,
          preferredTimes: studentData.preferredTimes ? JSON.stringify(studentData.preferredTimes) : null,
          previousExperience: studentData.previousExperience || null,
          specificNeeds: studentData.specificNeeds || null,
          motivation: studentData.motivation || null,
        }
      })
    } else if (role === "TEACHER") {
      if (!teacherData) {
        return NextResponse.json(
          { error: "Teacher data is required" },
          { status: 400 }
        )
      }

      const teacher = await db.teacher.create({
        data: {
          userId: user.id,
          bio: teacherData.bio || null,
          experience: teacherData.experience || null,
          education: teacherData.education || null,
          hourlyRate: teacherData.hourlyRate || 25.0,
          languages: teacherData.languages ? JSON.stringify(teacherData.languages) : null,
          specializations: teacherData.specializations ? JSON.stringify(teacherData.specializations) : null,
          teachingStyle: teacherData.teachingStyle || null,
          preferredAgeGroups: teacherData.preferredAgeGroups ? JSON.stringify(teacherData.preferredAgeGroups) : null,
          certifications: teacherData.certifications ? JSON.stringify(teacherData.certifications) : null,
          introductionVideo: teacherData.introductionVideo || null,
          trialLesson: teacherData.trialLesson ?? true,
        }
      })

      // Create availability slots if provided
      if (teacherData.availability && Array.isArray(teacherData.availability)) {
        for (const slot of teacherData.availability) {
          await db.availability.create({
            data: {
              teacherId: teacher.id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: true,
            }
          })
        }
      }
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}