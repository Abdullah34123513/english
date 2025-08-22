import crypto from 'crypto'
import { db } from './db'

export interface EmailVerificationResult {
  success: boolean
  message: string
  userId?: string
}

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generate token expiration date (24 hours from now)
 */
export function generateTokenExpiration(): Date {
  const expiration = new Date()
  expiration.setHours(expiration.getHours() + 24)
  return expiration
}

/**
 * Create and store email verification token
 */
export async function createEmailVerification(userId: string): Promise<string | null> {
  try {
    const token = generateVerificationToken()
    const expires = generateTokenExpiration()

    // Delete any existing verification tokens for this user
    await db.emailVerification.deleteMany({
      where: { userId }
    })

    // Create new verification token
    await db.emailVerification.create({
      data: {
        userId,
        token,
        expires,
        verified: false
      }
    })

    return token
  } catch (error) {
    console.error('Error creating email verification:', error)
    return null
  }
}

/**
 * Verify email token
 */
export async function verifyEmailToken(token: string): Promise<EmailVerificationResult> {
  try {
    // Find the verification record
    const verification = await db.emailVerification.findUnique({
      where: { token },
      include: {
        user: true
      }
    })

    if (!verification) {
      return {
        success: false,
        message: 'Invalid verification token'
      }
    }

    // Check if token is expired
    if (verification.expires < new Date()) {
      return {
        success: false,
        message: 'Verification token has expired'
      }
    }

    // Check if already verified
    if (verification.verified) {
      return {
        success: false,
        message: 'Email already verified'
      }
    }

    // Mark as verified and update user
    await db.$transaction([
      db.emailVerification.update({
        where: { id: verification.id },
        data: { verified: true }
      }),
      db.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true }
      })
    ])

    return {
      success: true,
      message: 'Email verified successfully',
      userId: verification.userId
    }
  } catch (error) {
    console.error('Error verifying email token:', error)
    return {
      success: false,
      message: 'An error occurred during verification'
    }
  }
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    })

    return user?.emailVerified || false
  } catch (error) {
    console.error('Error checking email verification status:', error)
    return false
  }
}

/**
 * Get pending verification token for user
 */
export async function getPendingVerification(userId: string): Promise<string | null> {
  try {
    const verification = await db.emailVerification.findFirst({
      where: {
        userId,
        verified: false,
        expires: {
          gte: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return verification?.token || null
  } catch (error) {
    console.error('Error getting pending verification:', error)
    return null
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(userId: string): Promise<boolean> {
  try {
    // Get user details
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      console.error('User not found for resending verification')
      return false
    }

    // Check if already verified
    if (user.emailVerified) {
      console.log('User email already verified')
      return false
    }

    // Create new verification token
    const token = await createEmailVerification(userId)
    if (!token) {
      console.error('Failed to create verification token')
      return false
    }

    // Import email service dynamically to avoid circular dependencies
    const { emailService } = await import('./email-service')
    
    // Send verification email
    const emailSent = await emailService.sendVerificationEmail(
      user.email,
      token,
      user.name || undefined
    )

    return emailSent
  } catch (error) {
    console.error('Error resending verification email:', error)
    return false
  }
}

/**
 * Clean up expired verification tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const result = await db.emailVerification.deleteMany({
      where: {
        expires: {
          lt: new Date()
        },
        verified: false
      }
    })

    if (result.count > 0) {
      console.log(`Cleaned up ${result.count} expired verification tokens`)
    }
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
  }
}

/**
 * Get verification status for user
 */
export async function getVerificationStatus(userId: string): Promise<{
  isVerified: boolean
  hasPendingToken: boolean
  isExpired: boolean
}> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true }
    })

    if (!user) {
      return {
        isVerified: false,
        hasPendingToken: false,
        isExpired: false
      }
    }

    if (user.emailVerified) {
      return {
        isVerified: true,
        hasPendingToken: false,
        isExpired: false
      }
    }

    // Check for pending tokens
    const pendingToken = await db.emailVerification.findFirst({
      where: {
        userId,
        verified: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!pendingToken) {
      return {
        isVerified: false,
        hasPendingToken: false,
        isExpired: false
      }
    }

    const isExpired = pendingToken.expires < new Date()

    return {
      isVerified: false,
      hasPendingToken: true,
      isExpired
    }
  } catch (error) {
    console.error('Error getting verification status:', error)
    return {
      isVerified: false,
      hasPendingToken: false,
      isExpired: false
    }
  }
}