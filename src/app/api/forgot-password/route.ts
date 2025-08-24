import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Dynamically import dependencies to avoid potential import issues
    const { db } = await import('@/lib/db')
    const { emailService } = await import('@/lib/email-service')

    // Check if database is accessible
    try {
      await db.user.findFirst({ take: 1 })
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      )
    }

    // Find user by email
    let user
    try {
      user = await db.user.findUnique({
        where: { email }
      })
    } catch (findUserError) {
      console.error('Error finding user:', findUserError)
      return NextResponse.json(
        { error: 'Error finding user account. Please try again.' },
        { status: 500 }
      )
    }

    // Debug logging (remove in production)
    console.log('=== FORGOT PASSWORD DEBUG ===')
    console.log('Forgot password request for email:', email)
    console.log('User found:', !!user)
    if (user) {
      console.log('User has password:', !!user.password)
      console.log('User email verified:', user.emailVerified)
      console.log('User ID:', user.id)
      console.log('User name:', user.name)
    }

    // Always return a success message to prevent email enumeration
    // But only send email if user exists and has a password (credentials provider)
    if (user && user.password) {
      console.log('User has password - proceeding with password reset')
      try {
        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex')
        console.log('Generated reset token length:', resetToken.length)
        
        // Calculate expiration time (1 hour from now)
        const expires = new Date()
        expires.setHours(expires.getHours() + 1)
        console.log('Token expires at:', expires)

        // Delete any existing unused reset tokens for this user
        console.log('Deleting existing reset tokens for user:', user.id)
        try {
          await db.passwordReset.deleteMany({
            where: {
              userId: user.id,
              used: false
            }
          })
        } catch (deleteError) {
          console.error('Error deleting existing reset tokens:', deleteError)
        }

        // Create new password reset record
        console.log('Creating new password reset record')
        try {
          await db.passwordReset.create({
            data: {
              userId: user.id,
              token: resetToken,
              expires
            }
          })
        } catch (createError) {
          console.error('Error creating password reset record:', createError)
        }

        // Send password reset email
        console.log('Attempting to send password reset email to:', user.email)
        let emailSent = false
        try {
          emailSent = await emailService.sendPasswordResetEmail(
            user.email,
            resetToken,
            user.name || undefined
          )
        } catch (emailError) {
          console.error('Error calling email service:', emailError)
        }

        console.log('Email sent result:', emailSent)

        if (!emailSent) {
          console.error('Failed to send password reset email to:', user.email)
        } else {
          console.log('Password reset email sent successfully to:', user.email)
        }
      } catch (emailError) {
        console.error('Error during password reset email process:', emailError)
      }
    } else if (user && !user.password) {
      console.log('User exists but uses OAuth provider - cannot reset password')
    } else {
      console.log('No user found with this email address')
    }
    console.log('=== END FORGOT PASSWORD DEBUG ===')

    // Return success message regardless of whether user exists or not
    // This prevents email enumeration attacks
    return NextResponse.json({
      message: 'If an account with this email exists, you will receive a password reset link shortly.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    )
  }
}