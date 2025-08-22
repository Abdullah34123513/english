import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role, isActive } = await request.json()

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: {
        teacherProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update user role
    if (role && role !== user.role) {
      if (!Object.values(UserRole).includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
      }

      await db.user.update({
        where: { id: params.id },
        data: { role: role as UserRole }
      })

      // Handle role changes - create or delete profiles as needed
      if (role === "TEACHER" && !user.teacherProfile) {
        await db.teacher.create({
          data: {
            userId: params.id,
            hourlyRate: 25.0,
            isActive: isActive ?? true
          }
        })
      } else if (role !== "TEACHER" && user.teacherProfile) {
        await db.teacher.delete({
          where: { userId: params.id }
        })
      }
    }

    // Update teacher active status if user is a teacher
    if (user.role === "TEACHER" && user.teacherProfile && isActive !== undefined) {
      await db.teacher.update({
        where: { userId: params.id },
        data: { isActive }
      })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Don't allow deleting the current admin user
    if (user.id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user and all related data (cascade delete should handle this)
    await db.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}