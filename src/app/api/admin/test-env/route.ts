import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'
import { db } from '@/lib/db'

interface EnvTestResult {
  name: string
  key: string
  value: string
  isSet: boolean
  isValid: boolean
  message: string
  category: 'database' | 'email' | 'auth' | 'general' | 'external'
  recommendations?: string[]
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  warnings: number
  critical: number
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
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

    const results: EnvTestResult[] = []
    let summary: TestSummary = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      critical: 0
    }

    // Test Database Connection
    try {
      await db.$queryRaw`SELECT 1`
      results.push({
        name: 'Database Connection',
        key: 'DATABASE_URL',
        value: process.env.DATABASE_URL || '',
        isSet: !!process.env.DATABASE_URL,
        isValid: true,
        message: 'Database connection successful',
        category: 'database'
      })
      summary.passed++
    } catch (error) {
      results.push({
        name: 'Database Connection',
        key: 'DATABASE_URL',
        value: process.env.DATABASE_URL || '',
        isSet: !!process.env.DATABASE_URL,
        isValid: false,
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        category: 'database',
        recommendations: [
          'Check if DATABASE_URL is correctly set',
          'Verify database server is running',
          'Check database credentials and permissions'
        ]
      })
      summary.failed++
      summary.critical++
    }

    // Test NextAuth Configuration
    const nextauthUrl = process.env.NEXTAUTH_URL
    const nextauthSecret = process.env.NEXTAUTH_SECRET
    results.push({
      name: 'NextAuth URL',
      key: 'NEXTAUTH_URL',
      value: nextauthUrl || '',
      isSet: !!nextauthUrl,
      isValid: !!nextauthUrl && nextauthUrl.startsWith('http'),
      message: nextauthUrl 
        ? (nextauthUrl.startsWith('http') ? 'NextAuth URL is configured' : 'NextAuth URL should start with http:// or https://')
        : 'NextAuth URL is not configured',
      category: 'auth',
      recommendations: !nextauthUrl ? ['Set NEXTAUTH_URL to your application URL'] : undefined
    })
    summary.total++
    if (!!nextauthUrl && nextauthUrl.startsWith('http')) {
      summary.passed++
    } else {
      summary.failed++
      summary.critical++
    }

    results.push({
      name: 'NextAuth Secret',
      key: 'NEXTAUTH_SECRET',
      value: nextauthSecret ? '***' : '',
      isSet: !!nextauthSecret,
      isValid: !!nextauthSecret && nextauthSecret.length >= 32,
      message: nextauthSecret 
        ? (nextauthSecret.length >= 32 ? 'NextAuth secret is properly configured' : 'NextAuth secret should be at least 32 characters long')
        : 'NextAuth secret is not configured',
      category: 'auth',
      recommendations: !nextauthSecret ? ['Generate a strong secret and set NEXTAUTH_SECRET'] : 
                     nextauthSecret.length < 32 ? ['Use a longer secret (at least 32 characters)'] : undefined
    })
    summary.total++
    if (!!nextauthSecret && nextauthSecret.length >= 32) {
      summary.passed++
    } else {
      summary.failed++
      summary.critical++
    }

    // Test Email Configuration
    const smtpHost = process.env.SMTP_HOST
    const smtpPort = process.env.SMTP_PORT
    const smtpUser = process.env.SMTP_USER
    const smtpPass = process.env.SMTP_PASS
    const smtpSecure = process.env.SMTP_SECURE

    const emailConfigured = !!(smtpHost && smtpPort && smtpUser && smtpPass)
    let emailValid = false
    let emailMessage = 'Email service is not configured'

    if (emailConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort),
          secure: smtpSecure === 'true',
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        })

        await new Promise((resolve, reject) => {
          transporter.verify((error, success) => {
            if (error) {
              reject(error)
            } else {
              resolve(success)
            }
          })
        })

        emailValid = true
        emailMessage = 'Email service is configured and working'
      } catch (error) {
        emailMessage = `Email service configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    results.push({
      name: 'Email Service',
      key: 'SMTP_*',
      value: emailConfigured ? 'Configured' : 'Not configured',
      isSet: emailConfigured,
      isValid: emailValid,
      message: emailMessage,
      category: 'email',
      recommendations: !emailConfigured ? [
        'Configure SMTP_HOST with your email server hostname',
        'Set SMTP_PORT (usually 587 for TLS, 465 for SSL)',
        'Provide SMTP_USER with your email address',
        'Set SMTP_PASS with your email password or app password',
        'Configure SMTP_SECURE (true for SSL, false for TLS)'
      ] : !emailValid ? [
        'Check SMTP server credentials',
        'Verify SMTP server is accessible',
        'Check firewall settings',
        'Verify email provider settings'
      ] : undefined
    })
    summary.total++
    if (emailConfigured && emailValid) {
      summary.passed++
    } else if (!emailConfigured) {
      summary.warnings++
    } else {
      summary.failed++
    }

    // Test Individual SMTP Variables
    const smtpVars = [
      { key: 'SMTP_HOST', name: 'SMTP Host', required: true },
      { key: 'SMTP_PORT', name: 'SMTP Port', required: true },
      { key: 'SMTP_USER', name: 'SMTP User', required: true },
      { key: 'SMTP_PASS', name: 'SMTP Password', required: true, sensitive: true },
      { key: 'SMTP_SECURE', name: 'SMTP Secure', required: false },
      { key: 'SMTP_FROM_NAME', name: 'SMTP From Name', required: false },
      { key: 'SMTP_FROM_EMAIL', name: 'SMTP From Email', required: false }
    ]

    smtpVars.forEach(({ key, name, required, sensitive }) => {
      const value = process.env[key]
      const isSet = !!value
      const isValid = !required || isSet
      
      results.push({
        name,
        key,
        value: sensitive && value ? '***' : (value || ''),
        isSet,
        isValid,
        message: isSet ? `${name} is configured` : `${name} is not configured`,
        category: 'email',
        recommendations: !isSet && required ? [`Set ${key} environment variable`] : undefined
      })
      summary.total++
      if (isValid) {
        summary.passed++
      } else {
        summary.failed++
        if (required) summary.critical++
      }
    })

    // Test External Services (Z-AI SDK)
    try {
      // Dynamic import to avoid require() issues
      const ZAI = await import('z-ai-web-dev-sdk')
      const zai = await ZAI.create()
      
      // Test a simple chat completion
      await zai.chat.completions.create({
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      })
      
      results.push({
        name: 'Z-AI SDK',
        key: 'Z_AI_*',
        value: 'Connected',
        isSet: true,
        isValid: true,
        message: 'Z-AI SDK is working correctly',
        category: 'external'
      })
      summary.passed++
    } catch (error) {
      results.push({
        name: 'Z-AI SDK',
        key: 'Z_AI_*',
        value: 'Not working',
        isSet: true,
        isValid: false,
        message: `Z-AI SDK test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        category: 'external',
        recommendations: [
          'Check if Z-AI SDK is properly installed',
          'Verify Z-AI API credentials',
          'Check internet connection',
          'Contact Z-AI support if issue persists'
        ]
      })
      summary.failed++
    }
    summary.total++

    // Test General Environment Variables
    const generalVars = [
      { key: 'NODE_ENV', name: 'Node Environment', required: false },
      { key: 'PORT', name: 'Application Port', required: false },
      { key: 'APP_NAME', name: 'Application Name', required: false },
      { key: 'APP_URL', name: 'Application URL', required: false }
    ]

    generalVars.forEach(({ key, name, required }) => {
      const value = process.env[key]
      const isSet = !!value
      const isValid = !required || isSet
      
      results.push({
        name,
        key,
        value: value || '',
        isSet,
        isValid,
        message: isSet ? `${name} is set to: ${value}` : `${name} is not configured`,
        category: 'general',
        recommendations: !isSet && required ? [`Set ${key} environment variable`] : undefined
      })
      summary.total++
      if (isValid) {
        summary.passed++
      } else {
        summary.warnings++
      }
    })

    summary.total = results.length
    summary.passed = results.filter(r => r.isValid).length
    summary.failed = results.filter(r => !r.isValid && r.isSet).length
    summary.warnings = results.filter(r => !r.isSet).length
    summary.critical = results.filter(r => !r.isValid && r.category === 'database').length +
                      results.filter(r => !r.isValid && r.category === 'auth').length

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      results,
      environment: process.env.NODE_ENV || 'development'
    })

  } catch (error) {
    console.error('Environment test error:', error)
    return NextResponse.json(
      { error: 'An error occurred while testing environment variables' },
      { status: 500 }
    )
  }
}

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

    const { action } = await request.json()

    if (action === 'cleanup_expired_tokens') {
      try {
        const { cleanupExpiredTokens } = await import('@/lib/email-verification')
        await cleanupExpiredTokens()
        
        return NextResponse.json({
          success: true,
          message: 'Expired verification tokens cleaned up successfully'
        })
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to cleanup expired tokens' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Environment test action error:', error)
    return NextResponse.json(
      { error: 'An error occurred while performing the action' },
      { status: 500 }
    )
  }
}