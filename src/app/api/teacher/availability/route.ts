import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if teacher profile exists
    const teacherProfile = await db.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    const { availabilities } = await request.json()

    // First, delete all existing availability for this teacher
    await db.availability.deleteMany({
      where: { teacherId: teacherProfile.id }
    })

    // Then create new availability records
    const newAvailabilities = await db.availability.createMany({
      data: availabilities.map((avail: any) => ({
        teacherId: teacherProfile.id,
        dayOfWeek: avail.dayOfWeek,
        startTime: avail.startTime,
        endTime: avail.endTime,
        isAvailable: avail.isAvailable,
      }))
    })

    return NextResponse.json({ message: "Availability updated successfully" })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}