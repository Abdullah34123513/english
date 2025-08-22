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

    // Create a map of existing availabilities for quick lookup
    const availabilityMap = new Map()
    availabilities.forEach(avail => {
      const key = `${dayNumberToName(avail.dayOfWeek)}-${avail.startTime}`
      availabilityMap.set(key, avail)
    })

    // Generate all possible time slots
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]
    
    const allSlots = []
    for (const day of daysOfWeek) {
      for (const time of timeSlots) {
        const key = `${day}-${time}`
        const existingAvail = availabilityMap.get(key)
        
        if (existingAvail) {
          // Use existing availability from database
          allSlots.push({
            id: key,
            dayOfWeek: day,
            startTime: time,
            endTime: existingAvail.endTime,
            isAvailable: existingAvail.isAvailable
          })
        } else {
          // Create default unavailable slot
          allSlots.push({
            id: key,
            dayOfWeek: day,
            startTime: time,
            endTime: `${parseInt(time) + 1}:00`,
            isAvailable: false
          })
        }
      }
    }

    return NextResponse.json(allSlots)
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

    // Only create records for available slots to optimize storage
    const availableSlots = availabilities.filter((avail: any) => avail.isAvailable)
    
    if (availableSlots.length > 0) {
      await db.availability.createMany({
        data: availableSlots.map((avail: any) => ({
          teacherId: teacherProfile.id,
          dayOfWeek: dayNameToNumber(avail.dayOfWeek),
          startTime: avail.startTime,
          endTime: avail.endTime,
          isAvailable: true,
        }))
      })
    }

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

    // Only create records for available slots to optimize storage
    const availableSlots = availability.filter((avail: any) => avail.isAvailable)
    
    if (availableSlots.length > 0) {
      await db.availability.createMany({
        data: availableSlots.map((avail: any) => ({
          teacherId: teacherProfile.id,
          dayOfWeek: dayNameToNumber(avail.dayOfWeek),
          startTime: avail.startTime,
          endTime: avail.endTime,
          isAvailable: true,
        }))
      })
    }

    return NextResponse.json({ message: "Availability updated successfully" })
  } catch (error) {
    console.error("Error updating availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}