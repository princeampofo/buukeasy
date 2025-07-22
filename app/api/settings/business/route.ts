import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-middleware'

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user with entrepreneur profile
    const userData = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        entrepreneurProfile: true
      }
    })

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Format response
    const businessSettings = {
      businessName: userData.entrepreneurProfile?.businessName || '',
      slug: userData.entrepreneurProfile?.slug || '',
      description: userData.entrepreneurProfile?.description || '',
      address: userData.entrepreneurProfile?.address || '',
      city: userData.entrepreneurProfile?.city || '',
      state: userData.entrepreneurProfile?.state || '',
      zipCode: userData.entrepreneurProfile?.zipCode || '',
      timezone: userData.entrepreneurProfile?.timezone || 'Eastern Time',
      currency: userData.entrepreneurProfile?.currency || 'USD'
    }

    return NextResponse.json(businessSettings)
  } catch (error) {
    console.error('Business Settings API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Update or create entrepreneur profile
    const updatedProfile = await prisma.entrepreneurProfile.upsert({
      where: {
        userId: user.userId
      },
      update: {
        businessName: data.businessName,
        slug: data.slug,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        timezone: data.timezone,
        currency: data.currency
      },
      create: {
        userId: user.userId,
        businessName: data.businessName,
        slug: data.slug,
        description: data.description || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zipCode: data.zipCode || '',
        timezone: data.timezone || 'Eastern Time',
        currency: data.currency || 'USD'
      }
    })

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Update Business Settings API Error:', error)
    return NextResponse.json(
      { error: 'Failed to update business settings' },
      { status: 500 }
    )
  }
}