import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const teachers = await db.teacher.findMany({
      where: { isActive: true },
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
          select: {
            rating: true,
            comment: true,
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
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(teachers)
  } catch (error) {
    console.error("Error fetching teachers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}