import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { notificationSystem } from "@/lib/notification-system"

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

    // Get payment details with booking information
    const payment = await db.payment.findUnique({
      where: { id: params.id },
      include: {
        booking: {
          include: {
            student: { include: { user: true } },
            teacher: { include: { user: true } }
          }
        }
      }
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Update payment status
    const updatedPayment = await db.payment.update({
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

    // Send notifications to student, teacher, and admins
    await notificationSystem.notifyPaymentRejected(payment.bookingId, payment.studentId, payment.amount, reason)

    return NextResponse.json({ 
      message: "Payment rejected successfully",
      paymentId: updatedPayment.id
    })
  } catch (error) {
    console.error("Error rejecting payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}