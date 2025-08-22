import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if teacher profile exists
    const teacherProfile = await db.teacher.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json({ error: "Teacher profile not found" }, { status: 404 })
    }

    const availability = await db.availability.findUnique({
      where: { id: params.id }
    })

    if (!availability) {
      return NextResponse.json({ error: "Availability not found" }, { status: 404 })
    }

    if (availability.teacherId !== teacherProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.availability.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Availability deleted successfully" })
  } catch (error) {
    console.error("Error deleting availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}