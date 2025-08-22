import { NextRequest, NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/email-verification'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(
        new URL('/auth/signin?error=missing_token', request.url)
      )
    }

    const result = await verifyEmailToken(token)

    if (result.success) {
      return NextResponse.redirect(
        new URL('/auth/signin?message=email_verified&success=true', request.url)
      )
    } else {
      return NextResponse.redirect(
        new URL(`/auth/signin?error=${encodeURIComponent(result.message)}`, request.url)
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.redirect(
      new URL('/auth/signin?error=verification_failed', request.url)
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    const result = await verifyEmailToken(token)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        userId: result.userId
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    )
  }
}