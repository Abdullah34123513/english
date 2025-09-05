import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const configurations = await db.paymentConfiguration.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Transform the data to match the expected format for the booking popup
    const transformedConfigurations = configurations.map(config => ({
      name: config.bankName,
      accountNumber: config.accountNumber,
      iban: config.iban || "",
      accountHolder: config.accountHolder,
      branch: config.branch || "",
      logo: config.logo || "🏦",
      rating: config.rating || 4.5,
      features: config.features ? JSON.parse(config.features) : [],
      processingTime: config.processingTime || "5-10 minutes"
    }))

    return NextResponse.json(transformedConfigurations)
  } catch (error) {
    console.error('Error fetching active payment configurations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}