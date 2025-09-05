import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configurations = await db.paymentConfiguration.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(configurations)
  } catch (error) {
    console.error('Error fetching payment configurations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bankName,
      accountNumber,
      iban,
      accountHolder,
      branch,
      logo,
      rating,
      features,
      processingTime,
      isActive = true,
      displayOrder = 0
    } = body

    // Validate required fields
    if (!bankName || !accountNumber || !accountHolder) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const configuration = await db.paymentConfiguration.create({
      data: {
        bankName,
        accountNumber,
        iban,
        accountHolder,
        branch,
        logo,
        rating,
        features,
        processingTime,
        isActive,
        displayOrder
      }
    })

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Error creating payment configuration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}