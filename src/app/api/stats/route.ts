import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Get platform statistics
    const [
      totalUsers,
      totalTeachers,
      totalStudents,
      totalBookings,
      totalReviews,
      totalPayments,
      activeBookings,
      completedBookings,
      averageRating
    ] = await Promise.all([
      db.user.count(),
      db.teacher.count(),
      db.student.count(),
      db.booking.count(),
      db.review.count(),
      db.payment.count(),
      db.booking.count({ where: { status: 'CONFIRMED' } }),
      db.booking.count({ where: { status: 'COMPLETED' } }),
      // Calculate average rating
      db.review.aggregate({
        _avg: {
          rating: true
        }
      })
    ])

    // Get teacher stats
    const teacherStats = await db.teacher.findMany({
      select: {
        id: true,
        user: {
          select: {
            name: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        },
        bookings: {
          select: {
            status: true
          }
        }
      }
    })

    // Calculate teacher statistics
    const teachersWithStats = teacherStats.map(teacher => {
      const totalReviews = teacher.reviews.length
      const avgRating = totalReviews > 0 
        ? teacher.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0
      const totalBookings = teacher.bookings.length
      const completedBookings = teacher.bookings.filter(b => b.status === 'COMPLETED').length

      return {
        id: teacher.id,
        name: teacher.user.name,
        averageRating: Number(avgRating.toFixed(1)),
        totalReviews,
        totalBookings,
        completedBookings,
        completionRate: totalBookings > 0 ? Number(((completedBookings / totalBookings) * 100).toFixed(1)) : 0
      }
    })

    // Get recent activity
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const recentReviews = await db.review.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      platform: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalBookings,
        totalReviews,
        totalPayments,
        activeBookings,
        completedBookings,
        averageRating: Number(averageRating._avg.rating?.toFixed(1)) || 0,
        completionRate: totalBookings > 0 ? Number(((completedBookings / totalBookings) * 100).toFixed(1)) : 0
      },
      teachers: teachersWithStats,
      recentActivity: {
        bookings: recentBookings,
        reviews: recentReviews
      }
    })
  } catch (error) {
    console.error("Error fetching platform stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}