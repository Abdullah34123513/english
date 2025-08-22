import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if teacher profile exists, create if not
    let teacherProfile = await db.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      teacherProfile = await db.teacher.create({
        data: {
          userId: session.user.id,
          hourlyRate: 0, // Default hourly rate
        }
      })
    }

    const bookings = await db.booking.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        startTime: "desc"
      }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching teacher bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}