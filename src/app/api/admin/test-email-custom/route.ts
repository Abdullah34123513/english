import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const { db } = await import('@/lib/db')
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { email, subject, message } = await request.json()

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: 'Email, subject, and message are required' },
        { status: 400 }
      )
    }

    // Get SMTP configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpSecure = process.env.SMTP_SECURE

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      return NextResponse.json({
        success: false,
        error: 'SMTP configuration is incomplete. Please check environment variables.'
      })
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })

    // Send custom email
    try {
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM_NAME || 'English Learning Platform',
          address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || ''
        },
        to: email,
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${subject}</title>
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
              <h2>${subject}</h2>
              <p>${message.replace(/\n/g, '<br>')}</p>
              <p><em>This is a test email sent from the admin panel.</em></p>
              <p>Best regards,<br>The English Learning Platform Team</p>
            </div>
            <div class="footer">
              <p>© 2024 English Learning Platform. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </body>
          </html>
        `,
        text: `${subject}\n\n${message}\n\nThis is a test email sent from the admin panel.\n\nBest regards,\nThe English Learning Platform Team`
      }

      const result = await transporter.sendMail(mailOptions)

      return NextResponse.json({
        success: true,
        message: 'Custom test email sent successfully',
        details: {
          recipient: email,
          subject: subject,
          messageId: result.messageId,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `Failed to send custom email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          recipient: email,
          subject: subject,
          timestamp: new Date().toISOString()
        }
      })
    }

  } catch (error) {
    console.error('Custom email test error:', error)
    return NextResponse.json(
      { error: 'An error occurred while sending custom test email' },
      { status: 500 }
    )
  }
}