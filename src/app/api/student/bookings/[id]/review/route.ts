import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if student profile exists, create if not
    let studentProfile = await db.student.findUnique({
      where: { userId: session.user.id }
    })

    if (!studentProfile) {
      studentProfile = await db.student.create({
        data: {
          userId: session.user.id,
        }
      })
    }

    const { rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: {
        teacher: true,
        student: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.studentId !== studentProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 })
    }

    if (booking.review) {
      return NextResponse.json({ error: "Review already exists for this booking" }, { status: 400 })
    }

    // Create the review
    const review = await db.review.create({
      data: {
        studentId: studentProfile.id,
        teacherId: booking.teacherId,
        bookingId: booking.id,
        rating,
        comment,
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}