// app/api/book/[slug]/appointment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { z } from 'zod'

// Validation schema for booking creation
const createBookingSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().optional(),
  serviceId: z.string().min(1, 'Service ID is required'),
  appointmentDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), {
    message: 'Valid appointment date is required'
  }),
  appointmentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid time format required (HH:MM)'),
  specialRequests: z.string().optional()
})

interface TimeSlot {
  time: string
  available: boolean
  datetime: string
}

// Helper function to check if a time slot is available
async function isTimeSlotAvailable(
  entrepreneurId: string,
  date: Date,
  time: string,
  serviceId: string
): Promise<boolean> {
  // Get the service to check duration
  const service = await prisma.service.findUnique({
    where: { id: serviceId }
  })
  
  if (!service) return false

  // Get the day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay()
  
  // Check if there's an available time slot for this day
  const timeSlot = await prisma.timeSlot.findFirst({
    where: {
      entrepreneurId,
      dayOfWeek,
      isActive: true,
      startTime: {
        lte: time // time should be after start time
      },
      endTime: {
        gte: time // time should be before end time
      }
    }
  })

  if (!timeSlot) return false

  // Check for existing bookings in this time slot
  const existingBooking = await prisma.booking.findFirst({
    where: {
      providerId: entrepreneurId,
      appointmentDate: date,
      appointmentTime: time,
      status: {
        notIn: ['CANCELLED', 'NO_SHOW']
      }
    }
  })

  return !existingBooking
}

// Generate available time slots for a given date
async function generateTimeSlots(date: string, entrepreneurId: string, serviceId: string): Promise<TimeSlot[]> {
  const slots: TimeSlot[] = []
  const targetDate = new Date(date)
  const dayOfWeek = targetDate.getDay()

  // Get entrepreneur's time slots for this day
  const timeSlot = await prisma.timeSlot.findFirst({
    where: {
      entrepreneurId,
      dayOfWeek,
      isActive: true
    }
  })

  if (!timeSlot) return slots

  // Parse start and end times
  const [startHour, startMinute] = timeSlot.startTime.split(':').map(Number)
  const [endHour, endMinute] = timeSlot.endTime.split(':').map(Number)
  
  const interval = 30 // minutes

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      // Skip times before start time or after end time
      if (
        (hour === startHour && minute < startMinute) ||
        (hour === endHour && minute > endMinute)
      ) {
        continue
      }

      const time = new Date(targetDate)
      time.setHours(hour, minute, 0, 0)
      
      const timeString = time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })

      const timeKey = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      
      // Check if this time slot is available
      const isAvailable = await isTimeSlotAvailable(entrepreneurId, targetDate, timeKey, serviceId)
      
      slots.push({
        time: timeString,
        available: isAvailable,
        datetime: time.toISOString()
      })
    }
  }
  
  return slots
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const serviceId = searchParams.get('serviceId')
    
    if (!date || !serviceId) {
      return NextResponse.json(
        { error: 'Date and service ID parameters are required' },
        { status: 400 }
      )
    }

    // Find entrepreneur by slug
    const entrepreneur = await prisma.entrepreneurProfile.findFirst({
      where: { id: params.slug }
    })

    if (!entrepreneur) {
      return NextResponse.json(
        { error: 'Entrepreneur not found' },
        { status: 404 }
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

    const timeSlots = await generateTimeSlots(date, entrepreneur.id, serviceId)
    
    return NextResponse.json({ timeSlots })
  } catch (error) {
    console.error('Error generating time slots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = createBookingSchema.parse(body)
    
    // Find entrepreneur by slug
    const entrepreneur = await prisma.entrepreneurProfile.findFirst({
      where: { id: params.slug },
      include: { user: true }
    })

    if (!entrepreneur) {
      return NextResponse.json(
        { error: 'Entrepreneur not found' },
        { status: 404 }
      )
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Check if time slot is available
    const appointmentDate = new Date(validatedData.appointmentDate)
    const isAvailable = await isTimeSlotAvailable(
      entrepreneur.id,
      appointmentDate,
      validatedData.appointmentTime,
      validatedData.serviceId
    )

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 400 }
      )
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        providerId: entrepreneur.user.id,
        serviceId: validatedData.serviceId,
        appointmentDate,
        appointmentTime: validatedData.appointmentTime,
        duration: service.duration,
        totalAmount: service.price,
        specialRequests: validatedData.specialRequests,
        status: 'PENDING'
      }
    })

    return NextResponse.json(
      { 
        success: true, 
        data: booking 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}