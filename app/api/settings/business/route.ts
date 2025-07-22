import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        entrepreneurProfile: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const businessInfo = {
      businessName: user.entrepreneurProfile?.businessName || '',
      ownerName: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.entrepreneurProfile?.address || '',
      city: user.entrepreneurProfile?.city || '',
      state: user.entrepreneurProfile?.state || '',
      zipCode: user.entrepreneurProfile?.zipCode || '',
      website: user.entrepreneurProfile?.website || '',
      businessDescription: user.entrepreneurProfile?.description || '',
      timezone: user.entrepreneurProfile?.timezone || 'Eastern Time',
      currency: user.entrepreneurProfile?.currency || 'USD'
    }

    return NextResponse.json({ success: true, data: businessInfo })
  } catch (error) {
    console.error('Business info fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business information' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      businessName,
      ownerName,
      phone,
      address,
      city,
      state,
      zipCode,
      website,
      businessDescription,
      timezone,
      currency
    } = body

    // Update user information
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: ownerName,
        phone: phone
      }
    })

    // Update or create entrepreneur profile
    await prisma.entrepreneurProfile.upsert({
      where: { userId },
      update: {
        businessName,
        address,
        city,
        state,
        zipCode,
        website: website || null,
        description: businessDescription,
        timezone,
        currency
      },
      create: {
        userId,
        businessName,
        address,
        city,
        state,
        zipCode,
        website: website || null,
        description: businessDescription,
        timezone,
        currency
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Business information updated successfully' 
    })
  } catch (error) {
    console.error('Business info update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update business information' },
      { status: 500 }
    )
  }
}