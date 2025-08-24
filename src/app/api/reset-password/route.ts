import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Get database client with verification
    let db
    try {
      const { getDbClient } = await import('@/lib/db')
      db = await getDbClient()
      
      // Verify database models are available
      if (!db.passwordReset || !db.user) {
        throw new Error('Database models not available')
      }
    } catch (dbError) {
      console.error('Database initialization error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      )
    }

    // Find the password reset record with additional error handling
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user's password with error handling
    try {
      await db.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword }
      })
    } catch (updateError) {
      console.error('Failed to update user password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      )
    }

    // Mark the reset token as used with error handling
    try {
      await db.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true }
      })
    } catch (updateError) {
      console.error('Failed to mark reset token as used:', updateError)
      // Don't fail the whole operation if this fails, but log it
    }

    return NextResponse.json({
      message: 'Password has been reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}