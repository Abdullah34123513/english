import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if teacher profile already exists
    const existingTeacher = await db.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (existingTeacher) {
      return NextResponse.json(existingTeacher)
    }

    // Create new teacher profile
    const teacher = await db.teacher.create({
      data: {
        userId: session.user.id,
        bio: "",
        hourlyRate: 0,
        experience: 0,
        education: "",
        languages: "[]",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        availability: true,
      }
    })

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error creating teacher profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}