// app/api/book/[slug]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DateTime } from 'luxon'
import prisma from '@/lib/db'

interface TimeSlot {
  time: string
  available: boolean
  datetime: string
}

interface BookingWindow {
  minAdvanceHours: number
  maxAdvanceDays: number
  minBookingDate: string
  maxBookingDate: string
}

// Generate time slots based on working hours and filter out booked ones
async function generateAvailableTimeSlots(
  date: string, 
  entrepreneurId: string, 
  serviceId: string,
  serviceLocation: string,
  timezone: string
): Promise<TimeSlot[]> {
  // Parse the date in the entrepreneur's timezone
  const targetDate = DateTime.fromISO(date, { zone: timezone })
  
  if (!targetDate.isValid) {
    console.log(`Invalid date: ${date}`)
    return []
  }
  
  const dayOfWeek = targetDate.weekday % 7 // Luxon uses 1-7 (Mon-Sun), convert to 0-6 (Sun-Sat)

  // Get ALL working hours for this day
  const workingHours = await prisma.timeSlot.findMany({
    where: {
      entrepreneurId,
      dayOfWeek,
      isActive: true
    },
    orderBy: {
      startTime: 'asc'
    }
  })

  if (!workingHours || workingHours.length === 0) {
    console.log(`No working hours configured for day ${dayOfWeek}`)
    return []
  }


  // Get service details with location-specific buffer time
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { 
      duration: true, 
      inStoreServiceBufferTime: true,
      homeServiceBufferTime: true,
      minAdvanceHours: true,
      maxAdvanceDays: true
    }
  })

  if (!service) {
    console.log('Service not found')
    return []
  }

  // Determine buffer time based on service location
  const bufferTime = serviceLocation === 'home' 
    ? (service.homeServiceBufferTime || 0)
    : (service.inStoreServiceBufferTime || 0)

  const minAdvanceHours = service.minAdvanceHours || 48
  const maxAdvanceDays = service.maxAdvanceDays || 90

  // Calculate booking window in entrepreneur's timezone
  const now = DateTime.now().setZone(timezone)
  const minBookingTime = now.plus({ hours: minAdvanceHours })
  const maxBookingTime = now.plus({ days: maxAdvanceDays })

  // Get existing bookings for this date
  const startOfDay = targetDate.startOf('day')
  // const endOfDay = targetDate.endOf('day')

  const existingBookings = await prisma.booking.findMany({
    where: {
      entrepreneurId,
      appointmentDate: startOfDay.toISODate(),
      status: {
        in: ['CONFIRMED', 'PENDING']
      }
    },
    select: {
      appointmentDate: true,
      appointmentTime: true,
      duration: true,
      serviceLocation: true,
      service: {
        select: {
          inStoreServiceBufferTime: true,
          homeServiceBufferTime: true
        }
      }
    }
  })

  const allSlots: TimeSlot[] = []
  
  // Determine optimal interval based on service duration
  const interval = 15

  // Generate slots for each working hours block
  workingHours.forEach((workingBlock, blockIndex) => {

    // Parse working hours (HH:mm format)
    const [startHour, startMinute] = workingBlock.startTime.split(':').map(Number)
    const [endHour, endMinute] = workingBlock.endTime.split(':').map(Number)
    
    const workingStart = targetDate.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 })
    const workingEnd = targetDate.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 })
    
    // Calculate effective end time: workingEnd - duration - bufferTime
    const effectiveEndTime = workingEnd.minus({ minutes: service.duration + bufferTime })
    
    
    // Generate time slots at optimized intervals
    let currentSlot = workingStart
    
    while (currentSlot <= effectiveEndTime) {
      // Skip if not within booking window
      if (currentSlot <= minBookingTime) {
        currentSlot = currentSlot.plus({ minutes: interval })
        continue
      }
      
      if (currentSlot >= maxBookingTime) {
        break
      }
      
      const timeString = currentSlot.toFormat('HH:mm')

      // Check for conflicts with existing bookings
      let isAvailable = true
      
      for (const booking of existingBookings) {
        const existingDateTime = DateTime.fromISO(`${booking.appointmentDate}T${booking.appointmentTime}:00`)
        const currentSlotDatetime = DateTime.fromISO(`${date}T${timeString}:00`)

        // Determine existing booking's buffer time
        const existingBookingBufferTime = booking.serviceLocation === 'home'
          ? (booking.service.homeServiceBufferTime || 0)
          : (booking.service.inStoreServiceBufferTime || 0)

        const existingEnd = existingDateTime.plus({ minutes: booking.duration + existingBookingBufferTime })

        const bookingEnd = currentSlotDatetime.plus({ minutes: service.duration + bufferTime })
        
        // Check for overlap
        if (currentSlotDatetime < existingEnd && bookingEnd > existingDateTime) {
          isAvailable = false
          break
        }
      }
      
      // Check for duplicates from other blocks
      const existingSlot = allSlots.find(slot => slot.time === timeString)
      if (!existingSlot && isAvailable) {
        allSlots.push({
          time: timeString,
          available: true,
          datetime: currentSlot.toISO()
        })
      }
      
      currentSlot = currentSlot.plus({ minutes: interval })
    }
  })

  // Sort slots by time
  allSlots.sort((a, b) => a.time.localeCompare(b.time))
  
  return allSlots
}

// Calculate booking window based on service settings
async function getBookingWindow(serviceId: string, timezone: string): Promise<BookingWindow> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { 
      minAdvanceHours: true,
      maxAdvanceDays: true
    }
  })

  if (!service) {
    throw new Error('Service not found')
  }

  const minAdvanceHours = service.minAdvanceHours || 48
  const maxAdvanceDays = service.maxAdvanceDays || 60

  // Calculate dates in entrepreneur's timezone
  const now = DateTime.now().setZone(timezone)
  const minBookingDate = now.plus({ hours: minAdvanceHours }).startOf('day')
  const maxBookingDate = now.plus({ days: maxAdvanceDays }).endOf('day')

  return {
    minAdvanceHours,
    maxAdvanceDays,
    minBookingDate: minBookingDate.toISO() || '',
    maxBookingDate: maxBookingDate.toISO() || ''
  }
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.url.split('/').at(-2)
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')
    const serviceLocation = searchParams.get('serviceLocation') || 'in-store' // Default to in-store
    
    if (!serviceId) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      )
    }

    // Find entrepreneur
    const entrepreneur = await prisma.entrepreneurProfile.findFirst({
      where: { slug },
      select: { id: true, timezone: true }
    })

    if (!entrepreneur) {
      return NextResponse.json(
        { error: 'Entrepreneur not found' },
        { status: 404 }
      )
    }

    const timezone = entrepreneur.timezone || 'Asia/Dubai'

    // If no date provided, return booking window only
    if (!date) {
      const bookingWindow = await getBookingWindow(serviceId, timezone)
      return NextResponse.json({ 
        bookingWindow,
        timeSlots: [],
        timezone,
        message: 'Select a date to see available times'
      })
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      )
    }

    // Parse and validate date in entrepreneur's timezone
    const targetDate = DateTime.fromISO(date, { zone: timezone })
    
    if (!targetDate.isValid) {
      return NextResponse.json(
        { error: 'Invalid date' },
        { status: 400 }
      )
    }

    // Get booking window for validation
    const bookingWindow = await getBookingWindow(serviceId, timezone)

    const minBookingDate = DateTime.fromISO(bookingWindow.minBookingDate, { zone: timezone })
    const maxBookingDate = DateTime.fromISO(bookingWindow.maxBookingDate, { zone: timezone })
    
    if (targetDate < minBookingDate) {
      return NextResponse.json({ 
        timeSlots: [],
        bookingWindow,
        timezone,
        message: `Bookings must be made at least ${bookingWindow.minAdvanceHours} hours in advance`
      })
    }

    if (targetDate > maxBookingDate) {
      return NextResponse.json({ 
        timeSlots: [],
        bookingWindow,
        timezone,
        message: `Bookings can only be made up to ${bookingWindow.maxAdvanceDays} days in advance`
      })
    }

    // Generate available time slots with service location
    const timeSlots = await generateAvailableTimeSlots(date, entrepreneur.id, serviceId, serviceLocation, timezone)
    
    return NextResponse.json({ 
      timeSlots,
      bookingWindow,
      timezone
    })
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}