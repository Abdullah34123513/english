import nodemailer from 'nodemailer'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter() {
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      }
    }

    // Validate email configuration
    if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('Email service not configured. Please set SMTP environment variables.')
      return
    }

    try {
      this.transporter = nodemailer.createTransport(emailConfig)
      
      // Verify the connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service configuration error:', error)
        } else {
          console.log('Email service is ready to send messages')
        }
      })
    } catch (error) {
      console.error('Failed to initialize email service:', error)
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email service not configured')
      return false
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'English Learning Platform',
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
        },
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html)
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  async sendVerificationEmail(email: string, verificationToken: string, userName?: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`
    
    const subject = 'Verify Your Email Address'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verify Your Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>English Learning Platform</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName || 'there'},</h2>
          <p>Thank you for registering with the English Learning Platform! To complete your registration and start your learning journey, please verify your email address.</p>
          
          <p><strong>Why verify your email?</strong></p>
          <ul>
            <li>✓ Secure your account</li>
            <li>✓ Access all platform features</li>
            <li>✓ Receive important notifications</li>
            <li>✓ Connect with teachers and students</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>
          
          <p><strong>Or copy and paste this link into your browser:</strong></p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
            ${verificationUrl}
          </p>
          
          <p><strong>Note:</strong> This verification link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with us, please ignore this email.</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    const text = `
Hello ${userName || 'there'},

Thank you for registering with the English Learning Platform! To complete your registration and start your learning journey, please verify your email address.

Why verify your email?
✓ Secure your account
✓ Access all platform features
✓ Receive important notifications
✓ Connect with teachers and students

Verify your email here: ${verificationUrl}

Or copy and paste this link into your browser:
${verificationUrl}

Note: This verification link will expire in 24 hours for security reasons.

If you didn't create an account with us, please ignore this email.

Best regards,
The English Learning Platform Team
    `

    return this.sendEmail({
      to: email,
      subject,
      html,
      text
    })
  }

  async sendWelcomeEmail(email: string, userName?: string): Promise<boolean> {
    const subject = 'Welcome to the English Learning Platform!'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Welcome to English Learning Platform</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome!</h1>
        </div>
        <div class="content">
          <h2>Welcome ${userName || 'to the English Learning Platform'}!</h2>
          <p>We're excited to have you join our community of English learners and teachers from around the world.</p>
          
          <h3>🚀 What's Next?</h3>
          <ul>
            <li><strong>Complete Your Profile:</strong> Add information about your learning goals and preferences</li>
            <li><strong>Browse Teachers:</strong> Find the perfect English teacher for your learning style</li>
            <li><strong>Book a Lesson:</strong> Schedule your first English lesson</li>
            <li><strong>Join the Community:</strong> Connect with other learners</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard" class="button">Get Started</a>
          </div>
          
          <h3>💡 Tips for Success</h3>
          <ul>
            <li>Set realistic learning goals</li>
            <li>Practice consistently, even if it's just 15 minutes a day</li>
            <li>Don't be afraid to make mistakes - they're part of learning!</li>
            <li>Take advantage of our community resources</li>
          </ul>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
          
          <p>Happy learning!<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    const text = `
Welcome ${userName || 'to the English Learning Platform'}!

We're excited to have you join our community of English learners and teachers from around the world.

🚀 What's Next?
• Complete Your Profile: Add information about your learning goals and preferences
• Browse Teachers: Find the perfect English teacher for your learning style
• Book a Lesson: Schedule your first English lesson
• Join the Community: Connect with other learners

Get started here: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard

💡 Tips for Success
• Set realistic learning goals
• Practice consistently, even if it's just 15 minutes a day
• Don't be afraid to make mistakes - they're part of learning!
• Take advantage of our community resources

If you have any questions or need help getting started, don't hesitate to reach out to our support team.

Happy learning!
The English Learning Platform Team
    `

    return this.sendEmail({
      to: email,
      subject,
      html,
      text
    })
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    
    const subject = 'Reset Your Password - English Learning Platform'
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
            border: 1px solid #e0e0e0;
            border-top: none;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hello ${userName || 'there'},</h2>
          <p>We received a request to reset your password for your English Learning Platform account. If you made this request, please click the button below to reset your password.</p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> This password reset link will expire in 1 hour for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.
          </div>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          
          <p><strong>Or copy and paste this link into your browser:</strong></p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
            ${resetUrl}
          </p>
          
          <h3>🔒 Security Tips:</h3>
          <ul>
            <li>Choose a strong password with at least 8 characters</li>
            <li>Use a mix of uppercase, lowercase, numbers, and symbols</li>
            <li>Don't reuse passwords from other websites</li>
            <li>Never share your password with anyone</li>
          </ul>
          
          <p><strong>Didn't request this password reset?</strong></p>
          <p>If you didn't request a password reset, please ignore this email. Your account is still secure, and no changes have been made.</p>
          
          <p>If you're concerned about your account security, please contact our support team immediately.</p>
          
          <p>Best regards,<br>The English Learning Platform Team</p>
        </div>
        <div class="footer">
          <p>© 2024 English Learning Platform. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `

    const text = `
Hello ${userName || 'there'},

We received a request to reset your password for your English Learning Platform account. If you made this request, please click the link below to reset your password.

⚠️ Security Notice: This password reset link will expire in 1 hour for security reasons. If you don't reset your password within this time, you'll need to request a new reset link.

Reset your password here: ${resetUrl}

Or copy and paste this link into your browser:
${resetUrl}

🔒 Security Tips:
• Choose a strong password with at least 8 characters
• Use a mix of uppercase, lowercase, numbers, and symbols
• Don't reuse passwords from other websites
• Never share your password with anyone

Didn't request this password reset?
If you didn't request a password reset, please ignore this email. Your account is still secure, and no changes have been made.

If you're concerned about your account security, please contact our support team immediately.

Best regards,
The English Learning Platform Team
    `

    return this.sendEmail({
      to: email,
      subject,
      html,
      text
    })
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n').trim()
  }

  isConfigured(): boolean {
    return this.transporter !== null
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService