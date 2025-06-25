import { NextResponse } from 'next/server'

interface TimeSlot {
  start: string
  end: string
}

interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

interface WeeklySchedule {
  [key: string]: DaySchedule
}

// Default schedule structure
const defaultSchedule: WeeklySchedule = {
  monday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  tuesday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  wednesday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  thursday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  friday: {
    enabled: true,
    slots: [
      { start: '09:00', end: '12:00' },
      { start: '13:00', end: '17:00' }
    ]
  },
  saturday: {
    enabled: true,
    slots: [
      { start: '10:00', end: '16:00' }
    ]
  },
  sunday: {
    enabled: false,
    slots: []
  }
}

export async function GET() {
  try {
    // TODO: Replace with actual database fetch
    // const availability = await fetchAvailabilityFromDB()
    
    // For now, return default schedule
    // In production, you would fetch this from your database
    const availability = defaultSchedule

    return NextResponse.json({
      success: true,
      data: availability
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch availability' 
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const availabilityData = await request.json()
    
    // Validate the data structure
    if (!availabilityData || typeof availabilityData !== 'object') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid availability data' 
        },
        { status: 400 }
      )
    }

    // Validate each day's schedule
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    for (const day of daysOfWeek) {
      if (!availabilityData[day] || typeof availabilityData[day] !== 'object') {
        return NextResponse.json(
          { 
            success: false,
            error: `Invalid schedule data for ${day}` 
          },
          { status: 400 }
        )
      }

      const daySchedule = availabilityData[day] as DaySchedule
      if (typeof daySchedule.enabled !== 'boolean' || !Array.isArray(daySchedule.slots)) {
        return NextResponse.json(
          { 
            success: false,
            error: `Invalid schedule structure for ${day}` 
          },
          { status: 400 }
        )
      }

      // Validate time slots
      for (const slot of daySchedule.slots) {
        if (!slot.start || !slot.end || typeof slot.start !== 'string' || typeof slot.end !== 'string') {
          return NextResponse.json(
            { 
              success: false,
              error: `Invalid time slot format for ${day}` 
            },
            { status: 400 }
          )
        }
      }
    }
    
    // TODO: Save to database
    // await updateAvailabilityInDB(availabilityData)
    
    // For now, just log the data (in production, save to database)
    console.log('Availability data to save:', availabilityData)

    return NextResponse.json({ 
      success: true,
      message: 'Availability updated successfully',
      data: availabilityData 
    })
  } catch (error) {
    console.error('Error updating availability:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update availability' 
      },
      { status: 500 }
    )
  }
}