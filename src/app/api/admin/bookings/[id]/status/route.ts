import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status, meetLink } = await request.json()

    // Update booking status
    const booking = await db.booking.update({
      where: { id: params.id },
      data: {
        status,
        ...(meetLink && { meetLink })
      }
    })

    return NextResponse.json({ 
      message: "Booking status updated successfully",
      bookingId: booking.id
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}