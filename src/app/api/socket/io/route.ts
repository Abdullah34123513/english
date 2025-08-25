import { NextRequest, NextResponse } from "next/server"
import { getSocketServer } from "@/lib/socket-server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const io = getSocketServer()
    
    if (!io) {
      return NextResponse.json({ error: "Socket server not initialized" }, { status: 500 })
    }

    return NextResponse.json({ 
      status: "Socket server is running",
      path: "/api/socket/io"
    })
  } catch (error) {
    console.error("Error checking socket server:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}