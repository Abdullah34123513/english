import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getVerificationStatus } from '@/lib/email-verification'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const status = await getVerificationStatus(userId)

    return NextResponse.json({
      isVerified: status.isVerified,
      hasPendingToken: status.hasPendingToken,
      isExpired: status.isExpired
    })
  } catch (error) {
    console.error('Error getting verification status:', error)
    return NextResponse.json(
      { error: 'An error occurred while checking verification status' },
      { status: 500 }
    )
  }
}