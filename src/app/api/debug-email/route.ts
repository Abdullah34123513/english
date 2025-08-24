import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, testType } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      email: email,
      checks: {}
    }

    // Check 1: Database connectivity
    try {
      await db.user.findFirst({ take: 1 })
      debugInfo.checks.database = {
        status: 'connected',
        message: 'Database connection successful'
      }
    } catch (dbError) {
      debugInfo.checks.database = {
        status: 'error',
        message: 'Database connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      }
    }

    // Check 2: Find user in database
    let user = null
    try {
      user = await db.user.findUnique({
        where: { email }
      })
      debugInfo.checks.userFound = {
        status: user ? 'found' : 'not_found',
        message: user ? 'User exists in database' : 'User not found in database',
        userDetails: user ? {
          id: user.id,
          name: user.name,
          emailVerified: user.emailVerified,
          hasPassword: !!user.password
        } : null
      }
    } catch (findUserError) {
      debugInfo.checks.userFound = {
        status: 'error',
        message: 'Error finding user',
        error: findUserError instanceof Error ? findUserError.message : 'Unknown error'
      }
    }

    // Check 3: Email service configuration
    const emailConfig = {
      host: process.env.SMTP_HOST || 'not_set',
      port: process.env.SMTP_PORT || 'not_set',
      secure: process.env.SMTP_SECURE || 'not_set',
      user: process.env.SMTP_USER ? 'set' : 'not_set',
      pass: process.env.SMTP_PASS ? 'set' : 'not_set',
      fromName: process.env.SMTP_FROM_NAME || 'not_set',
      fromEmail: process.env.SMTP_FROM_EMAIL || 'not_set',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not_set'
    }

    debugInfo.checks.emailConfig = {
      status: Object.values(emailConfig).every(val => val !== 'not_set') ? 'configured' : 'missing_config',
      message: Object.values(emailConfig).every(val => val !== 'not_set') 
        ? 'All email configuration variables are set' 
        : 'Some email configuration variables are missing',
      config: emailConfig
    }

    // Check 4: Email service initialization
    try {
      const isConfigured = emailService.isConfigured()
      debugInfo.checks.emailService = {
        status: isConfigured ? 'ready' : 'not_configured',
        message: isConfigured 
          ? 'Email service is properly configured and ready' 
          : 'Email service is not configured'
      }
    } catch (emailServiceError) {
      debugInfo.checks.emailService = {
        status: 'error',
        message: 'Error checking email service',
        error: emailServiceError instanceof Error ? emailServiceError.message : 'Unknown error'
      }
    }

    // Check 5: Test email sending (if requested)
    if (testType === 'send_test') {
      try {
        console.log('Attempting to send test email to:', email)
        const testResult = await emailService.sendEmail({
          to: email,
          subject: 'Test Email from English Learning Platform',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Test Email</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 5px; }
                .content { padding: 20px; background: #ffffff; border: 1px solid #dee2e6; border-radius: 5px; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>📧 Test Email</h1>
              </div>
              <div class="content">
                <h2>Hello!</h2>
                <p>This is a test email from the English Learning Platform to verify that the email service is working correctly.</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                <p><strong>Recipient:</strong> ${email}</p>
                <p>If you received this email, it means the email service is properly configured and functioning.</p>
                <p>Best regards,<br>The English Learning Platform Team</p>
              </div>
            </body>
            </html>
          `,
          text: `Hello!\n\nThis is a test email from the English Learning Platform to verify that the email service is working correctly.\n\nTimestamp: ${new Date().toISOString()}\nRecipient: ${email}\n\nIf you received this email, it means the email service is properly configured and functioning.\n\nBest regards,\nThe English Learning Platform Team`
        })

        debugInfo.checks.testEmail = {
          status: testResult ? 'sent' : 'failed',
          message: testResult 
            ? 'Test email sent successfully' 
            : 'Failed to send test email'
        }
      } catch (testEmailError) {
        debugInfo.checks.testEmail = {
          status: 'error',
          message: 'Error sending test email',
          error: testEmailError instanceof Error ? testEmailError.message : 'Unknown error'
        }
      }
    }

    // Check 6: Test password reset email (if requested and user exists)
    if (testType === 'password_reset' && user && user.password) {
      try {
        console.log('Attempting to send password reset email to:', email)
        const crypto = await import('crypto')
        const resetToken = crypto.randomBytes(32).toString('hex')
        
        const resetResult = await emailService.sendPasswordResetEmail(
          email,
          resetToken,
          user.name || undefined
        )

        debugInfo.checks.passwordResetEmail = {
          status: resetResult ? 'sent' : 'failed',
          message: resetResult 
            ? 'Password reset email sent successfully' 
            : 'Failed to send password reset email',
          tokenGenerated: resetToken ? 'yes' : 'no',
          tokenLength: resetToken ? resetToken.length : 0
        }
      } catch (passwordResetError) {
        debugInfo.checks.passwordResetEmail = {
          status: 'error',
          message: 'Error sending password reset email',
          error: passwordResetError instanceof Error ? passwordResetError.message : 'Unknown error'
        }
      }
    } else if (testType === 'password_reset' && !user) {
      debugInfo.checks.passwordResetEmail = {
        status: 'skipped',
        message: 'Cannot test password reset email - user not found'
      }
    } else if (testType === 'password_reset' && user && !user.password) {
      debugInfo.checks.passwordResetEmail = {
        status: 'skipped',
        message: 'Cannot test password reset email - user uses OAuth provider'
      }
    }

    return NextResponse.json({
      message: 'Email debugging completed',
      debugInfo
    })

  } catch (error) {
    console.error('Debug email error:', error)
    return NextResponse.json(
      { error: 'An error occurred while debugging email service' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email Debug API',
    usage: 'POST with { email, testType } where testType can be "config_check", "send_test", or "password_reset"',
    timestamp: new Date().toISOString()
  })
}