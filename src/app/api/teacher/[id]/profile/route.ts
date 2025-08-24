import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 })
    }

    const teacher = await db.teacher.findUnique({
      where: { id: id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        availability: {
          orderBy: {
            dayOfWeek: "asc"
          }
        },
        reviews: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: "desc"
          }
        }
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    // Calculate average rating and total reviews
    const totalReviews = teacher.reviews.length
    const averageRating = totalReviews > 0 
      ? teacher.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0

    // Format the response to match the expected interface
    const formattedTeacher = {
      id: teacher.id,
      name: teacher.user.name,
      email: teacher.user.email,
      image: teacher.user.image,
      bio: teacher.bio,
      experience: teacher.experience,
      specializations: teacher.specializations,
      hourlyRate: teacher.hourlyRate,
      country: teacher.country,
      timezone: teacher.timezone,
      languages: teacher.languages ? teacher.languages.split(',').map(lang => lang.trim()) : [],
      rating: averageRating,
      totalReviews: totalReviews,
      availability: teacher.availability
    }

    return NextResponse.json(formattedTeacher)
  } catch (error) {
    console.error("Error fetching teacher profile by ID:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}