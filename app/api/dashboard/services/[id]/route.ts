// app/api/dashboard/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { ServiceCategory } from '@prisma/client'
import { withAuth } from '@/lib/auth-middleware'
import type { UserData } from '@/types/auth'

export const GET = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    const { pathname } = new URL(request.url)
    const serviceId = pathname.split('/').pop()
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

    // Get the service and verify ownership
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        entrepreneurId: entrepreneurProfile.id
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    const { pathname } = new URL(request.url)
    const serviceId = pathname.split('/').pop()
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

    // Verify service ownership
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        entrepreneurId: entrepreneurProfile.id
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()

    // Parse form data
    const name = formData.get('name') as string
    const category = formData.get('category') as ServiceCategory
    const description = formData.get('description') as string
    const duration = parseInt(formData.get('duration') as string)
    const specialInstructions = formData.get('specialInstructions') as string || null
    
    // Service location options
    const offersHomeService = formData.get('offersHomeService') === 'true'
    const offersInStoreService = formData.get('offersInStoreService') === 'true'
    
    // Home service pricing and buffer time
    const homeServicePrice = offersHomeService ? parseFloat(formData.get('homeServicePrice') as string) : null
    const homeServiceDeposit = offersHomeService ? parseFloat(formData.get('homeServiceDeposit') as string || '0') : null
    const homeServiceBufferTime = offersHomeService ? parseInt(formData.get('homeServiceBufferTime') as string || '0') : 0
    
    // In-store service pricing and buffer time
    const inStoreServicePrice = offersInStoreService ? parseFloat(formData.get('inStoreServicePrice') as string) : null
    const inStoreServiceDeposit = offersInStoreService ? parseFloat(formData.get('inStoreServiceDeposit') as string || '0') : null
    const inStoreServiceBufferTime = offersInStoreService ? parseInt(formData.get('inStoreServiceBufferTime') as string || '0') : 0
    
    // Booking advance settings with defaults
    const minAdvanceHours = parseInt(formData.get('minAdvanceHours') as string || '48')
    const maxAdvanceDays = parseInt(formData.get('maxAdvanceDays') as string || '30')

    // Validation
    if (!name || !category || !description || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (minAdvanceHours <= 0) {
      return NextResponse.json(
        { error: 'Minimum advance hours must be greater than 0' },
        { status: 400 }
      )
    }

    if (maxAdvanceDays <= 0) {
      return NextResponse.json(
        { error: 'Maximum advance days must be greater than 0' },
        { status: 400 }
      )
    }

    if (!offersHomeService && !offersInStoreService) {
      return NextResponse.json(
        { error: 'At least one service location must be selected' },
        { status: 400 }
      )
    }

    if (offersHomeService && (!homeServicePrice || homeServicePrice <= 0)) {
      return NextResponse.json(
        { error: 'Home service price is required and must be greater than 0' },
        { status: 400 }
      )
    }

    if (offersInStoreService && (!inStoreServicePrice || inStoreServicePrice <= 0)) {
      return NextResponse.json(
        { error: 'In-store service price is required and must be greater than 0' },
        { status: 400 }
      )
    }

    // Update the service (removed image handling for now)
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name,
        category,
        description,
        duration,
        specialInstructions,
        // imageUrl handling removed for now
        offersHomeService,
        offersInStoreService,
        homeServicePrice,
        homeServiceDeposit,
        homeServiceBufferTime,
        inStoreServicePrice,
        inStoreServiceDeposit,
        inStoreServiceBufferTime,
        minAdvanceHours,
        maxAdvanceDays,
      }
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
})

export const DELETE = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    const { pathname } = new URL(request.url)
    const serviceId = pathname.split('/').pop()
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

    // Verify service ownership
    const existingService = await prisma.service.findFirst({
      where: {
        id: serviceId,
        entrepreneurId: entrepreneurProfile.id
      }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    await prisma.service.delete({
      where: { id: serviceId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
})