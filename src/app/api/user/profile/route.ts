import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createLogger } from '@/lib/logger'

const logger = createLogger('UserProfileAPI')

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phone: true,
        bio: true,
        location: true,
        timezone: true,
        language: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    logger.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, bio, location, timezone, language, image } = body

    // Validate input
    if (name && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
    }

    if (phone && typeof phone !== 'string') {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    if (bio && typeof bio !== 'string') {
      return NextResponse.json({ error: 'Invalid bio' }, { status: 400 })
    }

    if (location && typeof location !== 'string') {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
    }

    if (timezone && typeof timezone !== 'string') {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 })
    }

    if (language && typeof language !== 'string') {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
    }

    if (image && typeof image !== 'string') {
      return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
        ...(timezone !== undefined && { timezone }),
        ...(language !== undefined && { language }),
        ...(image !== undefined && { image }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phone: true,
        bio: true,
        location: true,
        timezone: true,
        language: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    logger.logUserInfo('User profile updated', { userId: updatedUser.id, email: updatedUser.email })

    return NextResponse.json(updatedUser)
  } catch (error) {
    logger.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}