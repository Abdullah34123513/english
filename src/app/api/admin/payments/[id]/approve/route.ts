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

    const { notes } = await request.json()

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

    // Send notifications to student, teacher, and admins
    await notificationSystem.notifyPaymentApproved(payment.bookingId, payment.studentId, payment.amount)

    return NextResponse.json({ 
      message: "Payment approved successfully",
      paymentId: updatedPayment.id
    })
  } catch (error) {
    console.error("Error approving payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}