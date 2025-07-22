import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Map of day numbers to day names (0 = Sunday, 1 = Monday, etc.)
const dayNumberToName = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('entrepreneurId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get the entrepreneur profile ID
    const profile = await prisma.entrepreneurProfile.findUnique({
      where: { userId }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: { entrepreneurId: profile.id },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    })

    // Initialize empty schedule with all days
    const schedule = {
      monday: { enabled: false, slots: [] },
      tuesday: { enabled: false, slots: [] },
      wednesday: { enabled: false, slots: [] },
      thursday: { enabled: false, slots: [] },
      friday: { enabled: false, slots: [] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] }
    }

    // Group slots by day and format them
    timeSlots.forEach(slot => {
      const dayName = dayNumberToName[slot.dayOfWeek]
      if (!schedule[dayName].enabled) {
        schedule[dayName].enabled = true
      }
      schedule[dayName].slots.push({
        start: slot.startTime,
        end: slot.endTime
      })
    })

    return NextResponse.json({ success: true, data: schedule })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entrepreneurId: userId, availabilityData } = body

    // Get the entrepreneur profile ID
    const profile = await prisma.entrepreneurProfile.findUnique({
      where: { userId }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    // Delete existing slots for this entrepreneur
    await prisma.timeSlot.deleteMany({
      where: { entrepreneurId: profile.id }
    })

    // Create new slots
    const slotsToCreate = []
    for (const [dayOfWeek, dayData] of Object.entries(availabilityData)) {
      const dayNumber = getDayNumber(dayOfWeek) // Convert day name to number
      if (dayData.enabled && Array.isArray(dayData.slots)) {
        for (const slot of dayData.slots) {
          slotsToCreate.push({
            entrepreneurId: profile.id,
            dayOfWeek: dayNumber,
            startTime: slot.start,
            endTime: slot.end,
            isActive: true
          })
        }
      }
    }

    if (slotsToCreate.length > 0) {
      await prisma.timeSlot.createMany({
        data: slotsToCreate
      })
    }

    return NextResponse.json({ success: true, message: 'Availability updated' })
  } catch (error) {
    console.error('Availability update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}

// Helper function to convert day name to number (0-6, where 0 is Sunday)
function getDayNumber(dayName: string): number {
  const days = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  }
  return days[dayName.toLowerCase()] || 0
}
