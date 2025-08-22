import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resendVerificationEmail, getVerificationStatus } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check current verification status
    const status = await getVerificationStatus(userId)

    if (status.isVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      )
    }

    // Check if there's a recent pending token (less than 5 minutes old)
    if (status.hasPendingToken && !status.isExpired) {
      return NextResponse.json(
        { error: 'A verification email was recently sent. Please check your inbox and try again in a few minutes.' },
        { status: 429 } // Too Many Requests
      )
    }

    // Resend verification email
    const emailSent = await resendVerificationEmail(userId)

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox.'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again later.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error resending verification email:', error)
    return NextResponse.json(
      { error: 'An error occurred while resending the verification email' },
      { status: 500 }
    )
  }
}