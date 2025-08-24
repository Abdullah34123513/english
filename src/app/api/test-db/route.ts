import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test basic database connection
    const testUser = await db.user.findFirst({ take: 1 })
    
    // Test password reset table access
    const testReset = await db.passwordReset.findFirst({ take: 1 })
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount: await db.user.count(),
      resetCount: await db.passwordReset.count(),
      hasUsers: !!testUser,
      hasResets: !!testReset
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}