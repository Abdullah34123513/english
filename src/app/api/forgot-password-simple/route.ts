import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('Simple forgot password request for:', email)

    // For now, just return success without actually doing anything
    // This will help us isolate if the issue is with the database operations
    return NextResponse.json({
      message: 'If an account with this email exists, you will receive a password reset link shortly. (SIMPLE VERSION)'
    })

  } catch (error) {
    console.error('Simple forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}