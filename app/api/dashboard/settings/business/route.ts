import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth-middleware'
import type { UserData } from '@/types/auth'

export const GET = withAuth(async (_request: NextRequest, user: UserData) => {
  try {
    // Get user id from user data
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the user and include the entrepreneur profile
    const userDataFromDB = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        entrepreneurProfile: true
      }
    })

    if (!userDataFromDB) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const entrepreneurProfile = userDataFromDB.entrepreneurProfile

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    // Format response
    const businessSettings = {
      businessName: entrepreneurProfile?.businessName || '',
      ownerFirstName: userDataFromDB.firstName || '',
      ownerLastName: userDataFromDB.lastName || '',
      email: userDataFromDB.email,
      phone: userDataFromDB.phone || '',
      slug: entrepreneurProfile?.slug || '',
      businessDescription: entrepreneurProfile?.description || '',
      address: entrepreneurProfile?.address || '',
      city: entrepreneurProfile?.city || '',
      state: entrepreneurProfile?.state || '',
      zipCode: entrepreneurProfile?.zipCode || '',
      timezone: entrepreneurProfile?.timezone || 'Eastern Time',
      currency: entrepreneurProfile?.currency || 'USD'
    }

    return NextResponse.json(businessSettings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    // Get user id from user data
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }


    const data = await request.json()

  //  update both entrepreneur profile and user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.ownerFirstName,
        lastName: data.ownerLastName,
        email: data.email,
        phone: data.phone
      }
    })
    const updatedProfile = await prisma.entrepreneurProfile.update({
      where: { userId: userId },
      data: {
        businessName: data.businessName,
        slug: data.slug,
        description: data.businessDescription,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        timezone: data.timezone,
        currency: data.currency
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Business settings updated successfully',
      user: updatedUser,
      profile: updatedProfile
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update business settings' },
      { status: 500 }
    )
  }
})