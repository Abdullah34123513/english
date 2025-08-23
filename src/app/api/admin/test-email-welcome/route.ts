import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    const testName = 'Test User'

    // Send welcome email
    const result = await emailService.sendWelcomeEmail(email, testName)

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test welcome email sent successfully',
        details: {
          recipient: email,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json(
        { success: false,
        error: 'Failed to send test welcome email',
        details: {
          recipient: email,
          timestamp: new Date().toISOString()
        }
      })
    }

  } catch (error) {
    console.error('Email welcome test error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending test welcome email' },
      { status: 500 }
    )
  }
}