import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
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

    // Get all time slots for the entrepreneur
    const timeSlots = await prisma.timeSlot.findMany({
      where: { entrepreneurId: entrepreneurProfile.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Format the time slots by day
    const availabilityByDay = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      slots: timeSlots
        .filter(slot => slot.dayOfWeek === i)
        .map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: slot.isActive
        }))
    }))

    return NextResponse.json(availabilityByDay)
  } catch (error) {
    console.error('Availability API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { availabilityData } = body

    // Delete existing slots for this entrepreneur
    await prisma.timeSlot.deleteMany({
      where: { entrepreneurId: entrepreneurProfile.id }
    })

    // Create new time slots
    const timeSlots = await Promise.all(
      availabilityData.flatMap(async (day: any) => {
        return day.slots.map((slot: any) => ({
          entrepreneurId: entrepreneurProfile.id,
          dayOfWeek: day.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isActive: true
        }))
      })
    )

    // Bulk create all time slots
    await prisma.timeSlot.createMany({
      data: timeSlots.flat()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update Availability API Error:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}
