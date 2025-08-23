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

    // Generate a test verification token
    const testToken = 'test-verification-token-' + Date.now()
    const testName = 'Test User'

    // Send verification email
    const result = await emailService.sendVerificationEmail(email, testToken, testName)

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test verification email sent successfully',
        details: {
          recipient: email,
          token: testToken,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test verification email',
        details: {
          recipient: email,
          timestamp: new Date().toISOString()
        }
      })
    }

  } catch (error) {
    console.error('Email verification test error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending test verification email' },
      { status: 500 }
    )
  }
}