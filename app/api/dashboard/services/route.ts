import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { ServiceCategory } from '@prisma/client'
import { withAuth } from '@/lib/auth-middleware'
import type { UserData } from '@/types/auth'


export const GET = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    // Get user id from user data
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    const services = await prisma.service.findMany({
      where: { entrepreneurId: entrepreneurProfile.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: services
    })
  } catch (error) {
    console.error('Services API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    // Get user id from user data
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()

    const service = await prisma.service.create({
      data: {
        entrepreneurId: entrepreneurProfile.id,
        name: formData.get('name') as string,
        category: formData.get('category') as ServiceCategory,
        description: formData.get('description') as string,
        duration: parseInt(formData.get('duration') as string),
        price: parseFloat(formData.get('price') as string),
        bufferTime: parseInt(formData.get('bufferTime') as string || '0'),
        requireDeposit: formData.get('requireDeposit') === 'true',
        minAdvanceHours: parseInt(formData.get('minAdvanceHours') as string || '1'),
        maxAdvanceDays: parseInt(formData.get('maxAdvanceDays') as string || '30'),
        specialInstructions: formData.get('specialInstructions') as string,
        imageUrl: formData.get('imageUrl') as string,
      }
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error('Create Service API Error:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
})

