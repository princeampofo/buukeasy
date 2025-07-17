// app/api/timeslots/route.ts
import { NextRequest, NextResponse } from 'next/server'

interface TimeSlot {
  time: string
  available: boolean
  datetime: string
}

// Mock database for existing bookings - in production, this would be a real database
const existingBookings = new Map<string, string[]>([
  // Format: "YYYY-MM-DD" -> ["HH:MM", "HH:MM", ...]
  ['2025-07-07', ['09:00', '10:30', '14:00', '15:30']],
  ['2025-07-08', ['09:30', '11:00', '13:30', '16:00']],
  ['2025-07-09', ['10:00', '11:30', '14:30', '15:00']],
  ['2025-07-10', ['09:00', '12:00', '13:00', '16:30']],
  ['2025-07-11', ['10:30', '14:00', '15:30', '17:00']],
])

// Mock business hours - in production, this would come from business settings
const businessHours = {
  monday: { start: 9, end: 18, closed: false },
  tuesday: { start: 9, end: 18, closed: false },
  wednesday: { start: 9, end: 18, closed: false },
  thursday: { start: 9, end: 18, closed: false },
  friday: { start: 9, end: 19, closed: false },
  saturday: { start: 10, end: 17, closed: false },
  sunday: { start: 11, end: 16, closed: false }
}

// Mock blocked dates - in production, this would come from business calendar
const blockedDates = [
  '2025-07-15', // Staff training day
  '2025-07-25', // Holiday
  '2025-08-01'  // Maintenance day
]

const generateTimeSlots = (date: string, serviceId: string): TimeSlot[] => {
  const slots: TimeSlot[] = []
  const targetDate = new Date(date)
  const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof businessHours
  
  // Check if business is closed on this day
  const hours = businessHours[dayOfWeek]
  if (hours.closed) {
    return slots
  }

  // Check if date is blocked
  if (blockedDates.includes(date)) {
    return slots
  }

  const startHour = hours.start
  const endHour = hours.end
  const interval = 30 // minutes
  const existingBookingsForDate = existingBookings.get(date) || []

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date(targetDate)
      time.setHours(hour, minute, 0, 0)
      
      const timeString = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })

      const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      // Check if this time slot is already booked
      const isBooked = existingBookingsForDate.includes(timeKey)
      
      // Add some randomness for demo purposes (in production, only check actual bookings)
      const isAvailable = !isBooked && Math.random() > 0.2
      
      slots.push({
        time: timeString,
        available: isAvailable,
        datetime: time.toISOString()
      })
    }
  }
  
  return slots
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')
    
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Validate date format
    const targetDate = new Date(date)
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Check if date is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (targetDate < today) {
      return NextResponse.json({ timeSlots: [] })
    }

    const timeSlots = generateTimeSlots(date, serviceId || '1')
    
    return NextResponse.json({ timeSlots })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}