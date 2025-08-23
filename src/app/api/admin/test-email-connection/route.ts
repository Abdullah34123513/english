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

    // Create transporter and test connection
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpSecure === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })

    // Test the connection
    try {
      await new Promise<void>((resolve, reject) => {
        transporter.verify((error, success) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        })
      })

      return NextResponse.json({
        success: true,
        message: 'SMTP connection established successfully',
        details: {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure === 'true',
          user: smtpUser
        }
      })

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `SMTP connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure === 'true',
          user: smtpUser
        }
      })
    }

  } catch (error) {
    console.error('Email connection test error:', error)
    return NextResponse.json(
      { error: 'An error occurred while testing email connection' },
      { status: 500 }
    )
  }
}