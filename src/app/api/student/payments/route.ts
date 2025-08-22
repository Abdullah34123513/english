import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentData = await request.json()
    const { transactionId, amount, paymentDate, bankName, accountNumber, receiptImage, notes, bookingData } = paymentData

    // Validate required fields
    if (!transactionId || !amount || !paymentDate || !bankName) {
      return NextResponse.json({ error: "Missing required payment fields" }, { status: 400 })
    }

    // Get student profile
    const student = await db.student.findFirst({
      where: { userId: session.user.id }
    })

    if (!student) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 })
    }

    // Find the most recent booking for this teacher and student
    const booking = await db.booking.findFirst({
      where: {
        studentId: student.id,
        teacherId: bookingData.teacherId,
        status: "PENDING"
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "No pending booking found" }, { status: 404 })
    }

    // Create payment record
    const payment = await db.payment.create({
      data: {
        bookingId: booking.id,
        studentId: student.id,
        transactionId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        bankName,
        accountNumber,
        receiptImage,
        notes,
        status: "PENDING"
      }
    })

    // Update booking status to await payment approval
    await db.booking.update({
      where: { id: booking.id },
      data: { 
        status: "PENDING",
        paymentStatus: "PENDING"
      }
    })

    return NextResponse.json({ 
      message: "Payment information submitted successfully",
      paymentId: payment.id,
      bookingId: booking.id
    })
  } catch (error) {
    console.error("Error submitting payment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}