import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause for search
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          {
            user: {
              name: {
                contains: search,
                mode: 'insensitive' as const
              }
            }
          },
          {
            bio: {
              contains: search,
                mode: 'insensitive' as const
            }
          },
          {
            specializations: {
              contains: search,
                mode: 'insensitive' as const
            }
          }
        ]
      })
    }

    // Build orderBy clause
    const orderBy = {
      [sortBy]: sortOrder
    }

    // Get teachers with pagination
    const [teachers, total] = await Promise.all([
      db.teacher.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              location: true,
            }
          },
          availability: {
            where: {
              isAvailable: true
            },
            orderBy: {
              dayOfWeek: "asc"
            }
          },
          reviews: {
            select: {
              rating: true,
              comment: true,
              createdAt: true,
              student: {
                include: {
                  user: {
                    select: {
                      name: true,
                    }
                  }
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.teacher.count({ where })
    ])

    // Calculate average rating for each teacher
    const teachersWithStats = teachers.map(teacher => {
      const totalReviews = teacher.reviews.length
      const averageRating = totalReviews > 0 
        ? teacher.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0

      // Parse JSON fields
      const languages = teacher.languages ? JSON.parse(teacher.languages) : []
      const specializations = teacher.specializations ? JSON.parse(teacher.specializations) : []
      const certifications = teacher.certifications ? JSON.parse(teacher.certifications) : []

      return {
        ...teacher,
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        languages,
        specializations,
        certifications
      }
    })

    return NextResponse.json({
      teachers: teachersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}