import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { BookingStatus } from "@prisma/client"

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

    const bookings = await db.booking.findMany({
      where: { studentId: studentProfile.id },
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
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching student bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
        message: "Please complete your student profile first before booking",
        requiresProfile: true 
      }, { status: 404 })
    }

    const { teacherId, startTime, endTime } = await request.json()

    console.log("Booking request:", { teacherId, startTime, endTime, studentId: studentProfile.id })

    // Check if the time slot is available
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

    const bookingStart = new Date(startTime)
    const bookingEnd = new Date(endTime)
    const dayOfWeek = bookingStart.getDay()

    console.log("Booking details:", { 
      bookingStart: bookingStart.toISOString(), 
      bookingEnd: bookingEnd.toISOString(),
      dayOfWeek 
    })

    // Check if the teacher is available at this time
    const availabilitySlots = teacher.availability.filter(
      avail => avail.dayOfWeek === dayOfWeek
    )

    if (availabilitySlots.length === 0) {
      return NextResponse.json({ error: "Teacher not available on this day" }, { status: 400 })
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
      return NextResponse.json({ error: "Time slot outside teacher's availability" }, { status: 400 })
    }

    // Check for overlapping bookings
    const overlappingBooking = teacher.bookings.find(booking => {
      const existingStart = new Date(booking.startTime)
      const existingEnd = new Date(booking.endTime)
      return (bookingStart < existingEnd && bookingEnd > existingStart)
    })

    if (overlappingBooking) {
      return NextResponse.json({ error: "Time slot already booked" }, { status: 400 })
    }

    // Create the booking
    const booking = await db.booking.create({
      data: {
        studentId: studentProfile.id,
        teacherId,
        startTime: bookingStart.toISOString(),
        endTime: bookingEnd.toISOString(),
        status: BookingStatus.PENDING,
      },
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
        }
      }
    })

    console.log("Booking created successfully:", booking)

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}