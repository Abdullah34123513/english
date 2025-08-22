import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { BookingStatus } from "@prisma/client"

export async function PATCH(
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

    const { status } = await request.json()

    const booking = await db.booking.findUnique({
      where: { id: params.id }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.studentId !== studentProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Students can only cancel pending or confirmed bookings
    if (status === "CANCELLED" && !["PENDING", "CONFIRMED"].includes(booking.status)) {
      return NextResponse.json({ error: "Cannot cancel this booking" }, { status: 400 })
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: { status: status as BookingStatus }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}