import { NextResponse } from 'next/server'

interface BusinessSettings {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  website: string
  description: string
  timezone: string
  currency: string
}

// Temporary in-memory storage - replace with database
let businessSettings: BusinessSettings = {
  businessName: 'Demo Business',
  ownerName: 'Demo Owner',
  email: 'demo@gmail.com',
  phone: '+1 (555) 123-4567',
  address: '123 Demo St',
  city: 'Demo City',
  state: 'Demo State',
  zipCode: '12345',
  website: 'https://demo-business.com',
  description: 'This is a demo business description.',
  timezone: 'America/New_York',
  currency: 'USD'
}

export async function GET() {
  try {
    // TODO: Replace with actual database query
    // const settings = await db.businessSettings.findFirst({
    //   where: { userId: currentUser.id }
    // })

    return NextResponse.json(businessSettings)
  } catch (error) {
    console.error('Failed to fetch business settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data: BusinessSettings = await request.json()
    
    // Basic validation
    if (!data.businessName?.trim()) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      )
    }

    if (!data.email?.trim() || !data.email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // TODO: Replace with actual database update
    // const updatedSettings = await db.businessSettings.upsert({
    //   where: { userId: currentUser.id },
    //   update: data,
    //   create: { ...data, userId: currentUser.id }
    // })

    // Update in-memory storage for now
    businessSettings = { ...data }

    return NextResponse.json({ 
      message: 'Business settings updated successfully',
      data: businessSettings 
    })
  } catch (error) {
    console.error('Failed to update business settings:', error)
    return NextResponse.json(
      { error: 'Failed to update business settings' },
      { status: 500 }
    )
  }
}