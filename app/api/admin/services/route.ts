import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entrepreneurId = searchParams.get('entrepreneurId')
    
    if (!entrepreneurId) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur ID required' },
        { status: 400 }
      )
    }

    const services = await prisma.service.findMany({
      where: { entrepreneurId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: services })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract data from FormData
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string
    const duration = formData.get('duration') as string
    const price = formData.get('price') as string
    const bufferTime = formData.get('bufferTime') as string
    const requireDeposit = formData.get('requiresDeposit') === 'true'
    const minAdvanceHours = formData.get('minAdvanceBooking') as string
    const maxAdvanceDays = formData.get('maxAdvanceBooking') as string
    const specialInstructions = formData.get('instructions') as string
    const image = formData.get('image') as File | null

    // Validation
    if (!name || !category || !duration) {
      return NextResponse.json(
        { success: false, error: 'Name, category, and duration are required' },
        { status: 400 }
      )
    }

    // TODO: Handle image upload if needed
    let imageUrl = null
    if (image) {
      // Add image upload logic here
      // For now, we'll skip this
    }

    const service = await prisma.service.create({
      data: {
        entrepreneurId: formData.get('entrepreneurId') as string,
        name,
        category,
        description: description || null,
        duration: parseInt(duration),
        price: parseFloat(price) || 0,
        bufferTime: parseInt(bufferTime) || 0,
        requireDeposit,
        minAdvanceHours: parseInt(minAdvanceHours) || 1,
        maxAdvanceDays: parseInt(maxAdvanceDays) || 30,
        specialInstructions: specialInstructions || null,
        imageUrl
      }
    })

    return NextResponse.json({ success: true, data: service }, { status: 201 })
  } catch (error) {
    console.error('Service creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create service' },
      { status: 500 }
    )
  }
}

