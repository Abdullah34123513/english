import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const otherUserId = searchParams.get('otherUserId')

    console.log('GET /api/messages - Request params:', { userId, otherUserId, sessionUserId: session.user.id })

    if (!userId || !otherUserId) {
      return NextResponse.json({ 
        error: "Missing required parameters", 
        details: {
          userId: userId ? 'provided' : 'missing',
          otherUserId: otherUserId ? 'provided' : 'missing'
        }
      }, { status: 400 })
    }

    // Handle case where otherUserId is "undefined" string
    if (otherUserId === 'undefined' || otherUserId === 'null') {
      return NextResponse.json({ 
        error: "Invalid otherUserId parameter", 
        details: { otherUserId }
      }, { status: 400 })
    }

    // Verify that the current user is one of the participants
    if (session.user.id !== userId && session.user.id !== otherUserId) {
      return NextResponse.json({ 
        error: "Unauthorized - User not part of conversation",
        details: {
          sessionUserId: session.user.id,
          requestedUserId: userId,
          requestedOtherUserId: otherUserId
        }
      }, { status: 401 })
    }

    const messages = await db.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: userId
          }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    console.log('GET /api/messages - Found messages:', { count: messages.length })
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    const { receiverId, content } = await request.json()

    console.log('POST /api/messages - Request body:', { receiverId, content, senderId: session.user.id })

    if (!receiverId || !content) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        details: {
          receiverId: receiverId ? 'provided' : 'missing',
          content: content ? 'provided' : 'missing'
        }
      }, { status: 400 })
    }

    if (session.user.id === receiverId) {
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 })
    }

    // Verify that receiver exists
    console.log('Looking for receiver with ID:', receiverId);
    const receiver = await db.user.findUnique({
      where: { id: receiverId }
    })

    if (!receiver) {
      console.log('Receiver not found in database. Checking if it might be a teacher ID...');
      
      // Check if this is a teacher ID and get the associated user ID
      const teacher = await db.teacher.findUnique({
        where: { id: receiverId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      if (teacher) {
        console.log('Found teacher profile, using associated user ID:', teacher.user.id);
        // Use the teacher's user ID instead
        const message = await db.message.create({
          data: {
            senderId: session.user.id,
            receiverId: teacher.user.id, // Use the actual user ID
            content
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        });

        console.log('POST /api/messages - Message created successfully via teacher lookup:', { messageId: message.id, receiverId: teacher.user.id });
        return NextResponse.json(message);
      } else {
        console.log('No teacher profile found either for ID:', receiverId);
        return NextResponse.json({ 
          error: "Receiver not found", 
          receiverId,
          note: "The provided ID does not correspond to a user or teacher profile"
        }, { status: 404 });
      }
    }

    const message = await db.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    console.log('POST /api/messages - Message created successfully:', { messageId: message.id })
    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}