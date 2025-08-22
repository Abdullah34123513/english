import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await db.user.findMany({
      include: {
        teacherProfile: {
          select: {
            isActive: true,
            hourlyRate: true
          }
        },
        studentProfile: {
          select: {
            id: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Transform users to include isActive status based on profiles
    const transformedUsers = users.map(user => ({
      ...user,
      isActive: user.teacherProfile?.isActive ?? true,
      teacherProfile: user.teacherProfile,
      studentProfile: user.studentProfile
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
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
      await db.student.create({
        data: {
          userId: user.id,
        }
      })
    } else if (role === "TEACHER") {
      await db.teacher.create({
        data: {
          userId: user.id,
          hourlyRate: 25.0, // Default hourly rate
        }
      })
    }

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}