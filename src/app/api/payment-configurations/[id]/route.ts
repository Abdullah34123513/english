import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
      displayOrder
    } = body

    const configuration = await db.paymentConfiguration.update({
      where: { id: params.id },
      data: {
        ...(bankName && { bankName }),
        ...(accountNumber && { accountNumber }),
        ...(iban !== undefined && { iban }),
        ...(accountHolder && { accountHolder }),
        ...(branch !== undefined && { branch }),
        ...(logo !== undefined && { logo }),
        ...(rating !== undefined && { rating }),
        ...(features !== undefined && { features }),
        ...(processingTime !== undefined && { processingTime }),
        ...(isActive !== undefined && { isActive }),
        ...(displayOrder !== undefined && { displayOrder })
      }
    })

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Error updating payment configuration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.paymentConfiguration.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment configuration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}