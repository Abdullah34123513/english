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

    const { notes } = await request.json()

    // Update payment status
    const payment = await db.payment.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        approvedBy: session.user.id,
        approvedAt: new Date()
      }
    })

    // Update booking status
    await db.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: "CONFIRMED",
        paymentStatus: "PAID"
      }
    })

    return NextResponse.json({ 
      message: "Payment approved successfully",
      paymentId: payment.id
    })
  } catch (error) {
    console.error("Error approving payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}