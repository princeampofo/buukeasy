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

    // Get the entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: user.userId }
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

    return NextResponse.json(services)
  } catch (error) {
    console.error('Services API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: user.userId }
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
        category: formData.get('category') as string,
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
}

