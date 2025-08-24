import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Import database client
    let db
    try {
      const dbModule = await import('@/lib/db')
      db = dbModule.db
      
      // Test database connection
      if (!db) {
        throw new Error('Database client not available')
      }
      
      // Test basic database operation
      await db.user.findFirst({ take: 1 })
      
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      )
    }

    // Find the password reset record without consuming it
    let resetRecord
    try {
      resetRecord = await db.passwordReset.findUnique({
        where: { token },
        include: { user: true }
      })
    } catch (queryError) {
      console.error('Database query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to validate reset token. Please try again.' },
        { status: 500 }
      )
    }

    if (!resetRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetRecord.expires < new Date()) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Check if token has already been used
    if (resetRecord.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      )
    }

    // Check if user has a password (credentials provider)
    if (!resetRecord.user.password) {
      return NextResponse.json(
        { error: 'This account uses OAuth provider and cannot reset password' },
        { status: 400 }
      )
    }

    // Token is valid
    return NextResponse.json({
      valid: true,
      message: 'Token is valid'
    })

  } catch (error) {
    console.error('Validate reset token error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}