import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Helper function to convert day name to number
const dayNameToNumber = (dayName: string): number => {
  const days: { [key: string]: number } = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  }
  return days[dayName] || 0
}

// Helper function to convert day number to name
const dayNumberToName = (dayNumber: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber] || 'Sunday'
}

export async function GET(request: NextRequest) {
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

    const availabilities = await db.availability.findMany({
      where: { teacherId: teacherProfile.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Transform to match frontend interface
    const transformedAvailabilities = availabilities.map(avail => ({
      id: `${dayNumberToName(avail.dayOfWeek)}-${avail.startTime}`,
      dayOfWeek: dayNumberToName(avail.dayOfWeek),
      startTime: avail.startTime,
      endTime: avail.endTime,
      isAvailable: avail.isAvailable
    }))

    return NextResponse.json(transformedAvailabilities)
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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
        dayOfWeek: dayNameToNumber(avail.dayOfWeek),
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

export async function PUT(request: NextRequest) {
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

    const { availability } = await request.json()

    // First, delete all existing availability for this teacher
    await db.availability.deleteMany({
      where: { teacherId: teacherProfile.id }
    })

    // Then create new availability records
    const newAvailabilities = await db.availability.createMany({
      data: availability.map((avail: any) => ({
        teacherId: teacherProfile.id,
        dayOfWeek: dayNameToNumber(avail.dayOfWeek),
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