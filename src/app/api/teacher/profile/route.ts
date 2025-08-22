import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teacher = await db.teacher.findUnique({
      where: { userId: session.user.id },
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
        bookings: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  }
                }
              }
            }
          },
          orderBy: {
            startTime: "desc"
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
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error fetching teacher profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { bio, hourlyRate, experience, education, languages, specialties, country, timezone } = await request.json()

    const teacher = await db.teacher.update({
      where: { userId: session.user.id },
      data: {
        bio,
        hourlyRate,
        experience,
        education,
        languages,
        specializations: specialties,
      }
    })

    // Also update user profile if country or timezone is provided
    if (country || timezone) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          ...(country && { location: country }),
          ...(timezone && { timezone }),
        }
      })
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error("Error updating teacher profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}