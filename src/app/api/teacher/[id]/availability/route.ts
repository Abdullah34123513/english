import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const teacherId = params.id

    // Check if teacher exists
    const teacher = await db.teacher.findUnique({
      where: { id: teacherId }
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const availabilities = await db.availability.findMany({
      where: { 
        teacherId: teacherId,
        isAvailable: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json(availabilities)
  } catch (error) {
    console.error("Error fetching teacher availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}