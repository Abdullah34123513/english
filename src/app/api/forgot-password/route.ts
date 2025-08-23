import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailService } from '@/lib/email-service'
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

    // Find user by email
    const user = await db.user.findUnique({
      where: { email }
    })

    // Always return a success message to prevent email enumeration
    // But only send email if user exists and has a password (credentials provider)
    if (user && user.password) {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex')
      
      // Calculate expiration time (1 hour from now)
      const expires = new Date()
      expires.setHours(expires.getHours() + 1)

      // Delete any existing unused reset tokens for this user
      await db.passwordReset.deleteMany({
        where: {
          userId: user.id,
          used: false
        }
      })

      // Create new password reset record
      await db.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expires
        }
      })

      // Send password reset email
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.name || undefined
      )

      if (!emailSent) {
        console.error('Failed to send password reset email to:', user.email)
      }
    }

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