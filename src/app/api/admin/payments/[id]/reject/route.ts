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
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reason } = await request.json()

    if (!reason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 })
    }

    // Update payment status
    const payment = await db.payment.update({
      where: { id: params.id },
      data: {
        status: "REJECTED",
        rejectionReason: reason
      }
    })

    // Update booking status
    await db.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED"
      }
    })

    return NextResponse.json({ 
      message: "Payment rejected successfully",
      paymentId: payment.id
    })
  } catch (error) {
    console.error("Error rejecting payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}