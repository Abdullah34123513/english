import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total bookings
    const totalBookings = await db.booking.count()

    // Get pending payments
    const pendingPayments = await db.payment.count({
      where: { status: "PENDING" }
    })

    // Get completed bookings
    const completedBookings = await db.booking.count({
      where: { status: "COMPLETED" }
    })

    // Get total revenue from approved payments
    const paymentsResult = await db.payment.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true }
    })
    const totalRevenue = paymentsResult._sum.amount || 0

    // Get active teachers
    const activeTeachers = await db.teacher.count({
      where: { isActive: true }
    })

    // Get active students (students with at least one booking)
    const activeStudents = await db.student.count({
      where: {
        bookings: {
          some: {}
        }
      }
    })

    return NextResponse.json({
      totalBookings,
      pendingPayments,
      completedBookings,
      totalRevenue,
      activeTeachers,
      activeStudents
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}