import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('id')

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 })
    }

    // Fetch reviews for the teacher
    const reviews = await db.booking.findMany({
      where: {
        teacherId: teacherId,
        review: {
          isNot: null
        }
      },
      include: {
        review: true,
        student: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedReviews = reviews.map(booking => ({
      id: booking.review!.id,
      rating: booking.review!.rating,
      comment: booking.review!.comment,
      createdAt: booking.review!.createdAt,
      student: {
        name: booking.student.name,
        image: booking.student.image
      }
    }))

    return NextResponse.json(formattedReviews)
  } catch (error) {
    console.error("Error fetching teacher reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}