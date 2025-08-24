import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { BookingStatus } from "@prisma/client"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { date, timeSlot } = await request.json()
    const teacherId = params.id

    if (!date || !timeSlot) {
      return NextResponse.json({ error: "Date and time slot are required" }, { status: 400 })
    }

    // Parse the time slot to get start and end times
    const [startTime, endTime] = timeSlot.split(" - ")
    
    // Create booking start and end Date objects
    const bookingDate = new Date(date)
    const [startHours, startMinutes] = startTime.split(":")
    const [endHours, endMinutes] = endTime.split(":")

    const bookingStart = new Date(bookingDate)
    bookingStart.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

    const bookingEnd = new Date(bookingDate)
    bookingEnd.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)

    // Check if the teacher exists and get their availability and bookings
    const teacher = await db.teacher.findUnique({
      where: { id: teacherId },
      include: {
        availability: true,
        bookings: {
          where: {
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
            }
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const dayOfWeek = bookingStart.getDay()

    // Check if the teacher is available at this time
    const availabilitySlots = teacher.availability.filter(
      avail => avail.dayOfWeek === dayOfWeek
    )

    if (availabilitySlots.length === 0) {
      return NextResponse.json({ 
        error: "Teacher not available on this day",
        available: false 
      }, { status: 400 })
    }

    // Check if the booking time falls within any of the teacher's availability slots for this day
    const isWithinAvailability = availabilitySlots.some(avail => {
      const [availStart, availEnd] = [avail.startTime, avail.endTime].map(time => {
        const [hours, minutes] = time.split(':')
        const date = new Date(bookingStart)
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        return date.getTime()
      })

      return bookingStart.getTime() >= availStart && bookingEnd.getTime() <= availEnd
    })

    if (!isWithinAvailability) {
      return NextResponse.json({ 
        error: "Time slot outside teacher's availability",
        available: false 
      }, { status: 400 })
    }

    // Check for overlapping bookings
    const overlappingBooking = teacher.bookings.find(booking => {
      const existingStart = new Date(booking.startTime)
      const existingEnd = new Date(booking.endTime)
      return (bookingStart < existingEnd && bookingEnd > existingStart)
    })

    if (overlappingBooking) {
      return NextResponse.json({ 
        error: "Time slot already booked",
        available: false 
      }, { status: 400 })
    }

    // If we get here, the time slot is available
    return NextResponse.json({ 
      message: "Time slot is available",
      available: true 
    })

  } catch (error) {
    console.error("Error checking availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
