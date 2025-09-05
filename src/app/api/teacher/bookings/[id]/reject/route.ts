import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { BookingStatus } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bookingId = params.id
    const { reason } = await request.json()

    // Check if teacher profile exists
    const teacherProfile = await db.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    // Find the booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
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
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if the booking belongs to this teacher
    if (booking.teacherId !== teacherProfile.id) {
      return NextResponse.json({ error: "Unauthorized to reject this booking" }, { status: 403 })
    }

    // Check if booking is in PENDING status
    if (booking.status !== BookingStatus.PENDING) {
      return NextResponse.json({ 
        error: "Booking cannot be rejected. Current status: " + booking.status 
      }, { status: 400 })
    }

    // Update booking status to CANCELLED with reason
    const updatedBooking = await db.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        notes: booking.notes + `\n\nRejected by teacher: ${reason || 'No reason provided'}`
      },
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
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        }
      }
    })

    // TODO: Send notification to student that teacher has rejected the booking
    // This could be implemented with email notifications or real-time notifications

    return NextResponse.json({
      message: "Booking rejected successfully",
      booking: updatedBooking
    })

  } catch (error) {
    console.error("Error rejecting booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}