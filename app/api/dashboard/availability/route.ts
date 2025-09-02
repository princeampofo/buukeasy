// app/api/dashboard/availability/route.ts
import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { UserData } from '@/types/auth'
import { withAuth } from '@/lib/auth-middleware'

type DayName = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

type DayData = {
  enabled: boolean
  slots: { start: string; end: string }[]
}

// Single source of truth for day mappings
const dayMap: Record<DayName, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
}

const numberToDay: Record<number, DayName> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
}

type Schedule = {
  [key in DayName]: { enabled: boolean; slots: { start: string; end: string }[] }
}

export const GET = withAuth(async (_request: NextRequest, user: UserData) => {
  try {
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where: { entrepreneurId: entrepreneurProfile.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Initialize empty schedule
    const schedule: Schedule = {
      monday: { enabled: false, slots: [] },
      tuesday: { enabled: false, slots: [] },
      wednesday: { enabled: false, slots: [] },
      thursday: { enabled: false, slots: [] },
      friday: { enabled: false, slots: [] },
      saturday: { enabled: false, slots: [] },
      sunday: { enabled: false, slots: [] }
    }

    // Group slots by day
    timeSlots.forEach(slot => {
      const dayName = numberToDay[slot.dayOfWeek]
      if (dayName) {
        schedule[dayName].enabled = true
        schedule[dayName].slots.push({
          start: slot.startTime,
          end: slot.endTime
        })
      }
    })

    return NextResponse.json({ success: true, data: schedule })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
})

export const POST = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { availabilityData } = body

    // Delete existing slots
    await prisma.timeSlot.deleteMany({
      where: { entrepreneurId: entrepreneurProfile.id }
    })

    // Create new slots
    const slotsToCreate = []
    for (const [dayName, dayData] of Object.entries(availabilityData) as [string, DayData][]) {
      const dayNumber = dayMap[dayName as DayName]
      if (dayNumber !== undefined && dayData.enabled && Array.isArray(dayData.slots)) {
        for (const slot of dayData.slots) {
          slotsToCreate.push({
            entrepreneurId: entrepreneurProfile.id,
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
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
})