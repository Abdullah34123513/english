import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { GoogleMeetService } from "@/lib/google-meet"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get teacher profile
    const teacherProfile = await db.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        teacher: {
          include: {
            user: true
          }
        },
        student: {
          include: {
            user: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.teacherId !== teacherProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get teacher's Google access token
    const account = await db.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'google'
      }
    })

    let meetLink: string

    if (account?.access_token) {
      // Use Google Meet API to create a proper meeting
      const meetService = new GoogleMeetService()
      meetLink = await meetService.createMeetSpace(account.access_token)
      
      // Optionally create a calendar event
      try {
        await meetService.createCalendarEvent(account.access_token, {
          summary: `English Class with ${booking.student.user.name}`,
          description: `English language class between ${booking.teacher.user.name} and ${booking.student.user.name}`,
          startTime: booking.startTime,
          endTime: booking.endTime,
          attendees: [booking.teacher.user.email, booking.student.user.email]
        })
      } catch (calendarError) {
        console.error('Failed to create calendar event:', calendarError)
        // Continue even if calendar event creation fails
      }
    } else {
      // Fallback to generating a random Meet link
      meetLink = `https://meet.google.com/${generateRandomCode()}`
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: { meetLink }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error generating Meet link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateRandomCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}