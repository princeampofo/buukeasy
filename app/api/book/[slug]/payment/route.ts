import { NextRequest, NextResponse } from 'next/server'
import { DateTime } from 'luxon'
import prisma from '@/lib/db'
import { z } from 'zod'
import crypto from 'crypto'

// Enhanced error response helper
function createErrorResponse(message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  }, { status })
}

// Validation schema for payment request
const paymentRequestSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  
  // Validate that appointmentDate is in YYYY-MM-DD format
  appointmentDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Appointment date must be in YYYY-MM-DD format'),
    
  appointmentTime: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Valid 24-hour time format required (HH:MM)'),
  depositAmount: z.number().min(0, 'Deposit amount must be non-negative').optional().default(0),
  platformFee: z.number().min(0, 'Platform fee cannot be negative'),
  serviceAmount: z.number().positive('Service amount must be positive'),
  serviceLocation: z.enum(['home', 'in-store'], { 
    required_error: 'Service location is required' 
  }),
  customerFirstName: z.string().min(1, 'First name is required'),
  customerLastName: z.string().min(1, 'Last name is required'),
  customerEmail: z.string().email('Valid email is required'),
  customerPhone: z.string().optional(),
  serviceAddress: z.string().optional(),
  addressNotes: z.string().optional(),
  specialRequests: z.string().optional(),
  entrepreneurId: z.string().min(1, 'Entrepreneur ID is required'),
  paymentMethod: z.literal('ziina'),
})

// Ziina API configuration
const ZIINA_API_URL = process.env.ZIINA_API_URL || 'https://api-v2.ziina.com/api'
const ZIINA_API_KEY = process.env.ZIINA_API_KEY

interface ZiinaPaymentIntentRequest {
  amount: number
  currency_code: string
  message: string
  success_url: string
  cancel_url: string
  expiry: string
  allow_tips: boolean
  failure_url: string
  test: boolean
}

interface ZiinaPaymentIntentResponse {
  id: string
  account_id: string
  redirect_url: string
  status: string
  amount: number
  tip_amount: number
  currency_code: string
  message: string
  success_url: string
  cancel_url: string
  fee_amount: number
  latest_error?: {
    message: string
    code: string
  }
  created_at: string
  allow_tips: boolean
}

interface ZiinaErrorResponse {
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}

/**
 * Generate a unique booking slug based on current date/time and random data
 * Format: BK-YYMMDD-HHMMSS-XXXXX
 * Where:
 * - YY = Year (last 2 digits)
 * - MM = Month (01-12)
 * - DD = Day (01-31)
 * - HH = Hour (00-23)
 * - MM = Minute (00-59)
 * - SS = Second (00-59)
 * - XXXXX = 5 random alphanumeric characters
 */
async function generateUniqueBookingSlug(): Promise<string> {
  const now = new Date()
  
  // Format date/time components
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  
  // Generate 5 random alphanumeric characters
  const randomChars = crypto.randomBytes(3)
    .toString('hex')
    .toUpperCase()
    .slice(0, 5)
  
  // Combine into slug format
  const slug = `BK-${year}${month}${day}-${hour}${minute}${second}-${randomChars}`
  
  // Ensure uniqueness by checking database
  const existingBooking = await prisma.booking.findFirst({
    where: { bookingSlug: slug }
  })
  
  // If slug exists (very unlikely), generate a new one recursively
  if (existingBooking) {
    // Add a small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 1000))
    return generateUniqueBookingSlug()
  }
  
  return slug
}

async function createZiinaPaymentIntent(paymentData: ZiinaPaymentIntentRequest): Promise<ZiinaPaymentIntentResponse> {
  try {
    const response = await fetch(`${ZIINA_API_URL}/payment_intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ZIINA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    })

    const responseData = await response.json()

    if (!response.ok) {
      const ziinaError = responseData as ZiinaErrorResponse

      const userMessage = ziinaError.error?.message ||
                         'Payment processing failed. Please try again.'

      throw new Error(userMessage)
    }

    return responseData
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to payment processor. Please check your internet connection and try again.')
    }
    throw error
  }
}

async function checkTimeSlotAvailability(
  entrepreneurId: string, 
  serviceId: string,
  appointmentDate: string,  // ISO date string (YYYY-MM-DD)
  appointmentTime: string, 
  duration: number,
  serviceLocation: string,
  excludeBookingId?: string
): Promise<{ available: boolean; conflictingBooking?: any }> {
  
  // Get entrepreneur's timezone
  const entrepreneur = await prisma.entrepreneurProfile.findUnique({
    where: { id: entrepreneurId },
    select: { timezone: true }
  })
  
  const timezone = entrepreneur?.timezone || 'Asia/Dubai'

  // Parse appointment date and time in entrepreneur's timezone
  const appointmentDateTime = DateTime.fromISO(`${appointmentDate}T${appointmentTime}:00`, { zone: timezone })
  
  
  if (!appointmentDateTime.isValid) {
    throw new Error('Invalid appointment date/time format')
  }

  // Get the service to determine buffer time
  const service = await prisma.service.findFirst({
    where: { 
      id: serviceId
    },
    select: {
      duration: true,
      inStoreServiceBufferTime: true,
      homeServiceBufferTime: true
    }
  })

  // Determine buffer time based on service location
  const bufferTime = serviceLocation === 'home' 
    ? (service?.homeServiceBufferTime || 15)
    : (service?.inStoreServiceBufferTime || 15)
  
  const appointmentEnd = appointmentDateTime.plus({ minutes: duration + bufferTime })

  // Get day boundaries for database query
  const dayStart = appointmentDateTime.startOf('day')

  // Check for overlapping bookings (confirmed or pending)
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      entrepreneurId,
      appointmentDate: dayStart.toISODate(),
      status: {
        in: ['CONFIRMED', 'PENDING']
      },
      ...(excludeBookingId && { id: { not: excludeBookingId } })
    },
    include: {
      service: {
        select: {
          name: true,
          inStoreServiceBufferTime: true,
          homeServiceBufferTime: true
        }
      }
    }
  })

  for (const booking of conflictingBookings) {
    // Parse existing booking time in the same timezone
    const existingDateTime = DateTime.fromISO(`${booking.appointmentDate}T${booking.appointmentTime}:00`, { zone: timezone })

    // Determine existing booking's buffer time
    const existingBufferTime = booking.serviceLocation === 'home'
      ? (booking.service?.homeServiceBufferTime || 15)
      : (booking.service?.inStoreServiceBufferTime || 15)
    
    const existingEnd = existingDateTime.plus({ minutes: booking.duration + existingBufferTime })


    // Check for overlap: new appointment conflicts with existing if:
    // - New start < existing end AND new end > existing start
    if (appointmentDateTime < existingEnd && appointmentEnd > existingDateTime) {
      return {
        available: false,
        conflictingBooking: {
          time: booking.appointmentTime,
          status: booking.status,
          service: booking.service?.name,
          location: booking.serviceLocation
        }
      }
    }
  }

  return { available: true }
}

export async function POST(request: NextRequest) {
  try {
    // CLEANUP: Remove expired pending bookings on each request
    const fifteenMinutesAgo = new Date(Date.now() - (15 * 60 * 1000))
    try {
      const cleanupResult = await prisma.booking.deleteMany({
        where: {
          status: 'PENDING',
          createdAt: { lt: fifteenMinutesAgo }
        }
      })
    } catch (cleanupError) {
      console.warn('Failed to cleanup expired bookings:', cleanupError)
    }

    // Check for required environment variables
    if (!ZIINA_API_KEY) {
      return createErrorResponse(
        'Payment processing is temporarily unavailable. Please try again later.',
        null,
        503
      )
    }

    const body = await request.json()
    const slug = request.url.split('/').at(-2)
    
    // Validate input
    let validatedData
    try {
      validatedData = paymentRequestSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
        console.log('Validation errors:', fieldErrors)
        return createErrorResponse(
          'Please check your booking information and try again.',
          { fieldErrors },
          400
        )
      }
      throw error
    }

    // Find entrepreneur by slug
    const entrepreneur = await prisma.entrepreneurProfile.findFirst({
      where: { slug: slug },
      include: { 
        user: {
          select: {
            id: true,
            phone: true,
          }
        },
      }
    })

    if (!entrepreneur) {
      return createErrorResponse(
        'The business you are trying to book with could not be found.',
        null,
        404
      )
    }

    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId },
      select: {
        id: true,
        name: true,
        duration: true,
        inStoreServiceBufferTime: true,
        homeServiceBufferTime: true,
        minAdvanceHours: true,
        maxAdvanceDays: true,
        isActive: true
      }
    })

    if (!service) {
      return createErrorResponse(
        'The selected service is no longer available. Please choose a different service.',
        null,
        404
      )
    }

    // Validate service is active
    if (!service.isActive) {
      return createErrorResponse(
        'The selected service is currently unavailable. Please choose a different service or try again later.',
        null,
        400
      )
    }

    // Validate deposit amount
    if (validatedData.depositAmount > validatedData.serviceAmount) {
      return createErrorResponse(
        'The deposit amount cannot exceed the total service amount.',
        null,
        400
      )
    }

    // Get entrepreneur's timezone for date calculations
    const entrepreneurTimezone = entrepreneur.timezone || 'Asia/Dubai'

    // Validate appointment date is in the future with service-specific advance time
    const appointmentDateTime = DateTime.fromISO(validatedData.appointmentDate, { zone: entrepreneurTimezone })

    if (!appointmentDateTime.isValid) {
      return createErrorResponse(
        'Invalid appointment date format.',
        null,
        400
      )
    }

    const now = DateTime.now().setZone(entrepreneurTimezone)
    const minAdvanceHours = service.minAdvanceHours || 48
    const minBookingTime = now.plus({ hours: minAdvanceHours })

    // STEP 1: Check time slot availability with location-specific buffer
    const availabilityCheck = await checkTimeSlotAvailability(
      entrepreneur.id,
      validatedData.serviceId,
      appointmentDateTime.toISODate(), // Pass ISO date string (YYYY-MM-DD)
      validatedData.appointmentTime,
      service.duration,
      validatedData.serviceLocation
    )

    if (!availabilityCheck.available) {
      const conflictMessage = availabilityCheck.conflictingBooking?.status === 'PENDING'
        ? 'This time slot is currently being booked by another customer. Please choose a different time.'
        : `This time slot is already booked (${availabilityCheck.conflictingBooking?.service} at ${availabilityCheck.conflictingBooking?.time} - ${availabilityCheck.conflictingBooking?.location}). Please choose a different time.`
      
      return createErrorResponse(conflictMessage, null, 400)
    }

    // STEP 2: Generate unique booking slug
    const bookingSlug = await generateUniqueBookingSlug()

    // STEP 3: Create booking with PENDING status and booking slug
    const booking = await prisma.booking.create({
      data: {
        customerFirstName: validatedData.customerFirstName,
        customerLastName: validatedData.customerLastName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone || '',
        entrepreneurId: entrepreneur.id,
        serviceId: validatedData.serviceId,
        appointmentDate: validatedData.appointmentDate,
        appointmentTime: validatedData.appointmentTime,
        duration: service.duration,
        serviceLocation: validatedData.serviceLocation,
        serviceAddress: validatedData.serviceAddress,
        addressNotes: validatedData.addressNotes,
        specialRequests: validatedData.specialRequests,
        status: 'PENDING', // This reserves the slot
        bookingSlug: bookingSlug, // Set the slug immediately
        timezone: entrepreneur.timezone || 'Asia/Dubai',
      }
    })

    // Calculate expiry timestamp (15 minutes from booking creation)
    const expiryTimestamp = booking.createdAt.getTime() + (15 * 60 * 1000)

    // STEP 4: Create payment intent with Ziina
    const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL
    const msg = `Please complete your payment within 15 minutes`

    const ziinaPaymentData: ZiinaPaymentIntentRequest = {
      amount: validatedData.platformFee * 100, // Convert to fils
      currency_code: 'AED',
      message: msg,
      // Redirect to confirmation page with booking slug for immediate lookup
      success_url: `${baseUrl}/book/${slug}/status?booking=${bookingSlug}`,
      cancel_url: `${baseUrl}/book/${slug}/payment?booking=${bookingSlug}&status=cancelled`,
      failure_url: `${baseUrl}/book/${slug}/payment?booking=${bookingSlug}&status=failed`,
      test: false,
      expiry: expiryTimestamp.toString(), // 15 minutes from creation
      allow_tips: true,
    }

    // Create payment intent with enhanced error handling
    let ziinaResponse
    try {
      ziinaResponse = await createZiinaPaymentIntent(ziinaPaymentData)
    } catch (error) {
      // Clean up the booking if Ziina fails
      await prisma.booking.delete({ where: { id: booking.id } })

      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.'
      return createErrorResponse(errorMessage, null, 500)
    }

    // Store the payment intent ID in the booking for tracking
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentIntentId: ziinaResponse.id
      }
    })

    // Calculate expiry time for response
    const expiresAt = new Date(expiryTimestamp)

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingSlug: bookingSlug, // Include the slug in the response
      paymentIntentId: ziinaResponse.id,
      expiresAt: expiresAt.toISOString(),
      paymentUrl: ziinaResponse.redirect_url,
      message: `Booking created! Complete payment within ${Math.ceil((expiryTimestamp - Date.now()) / 60000)} minutes to confirm your appointment.`
    })

  } catch (error) {
    
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return createErrorResponse(
        'Please check your booking information and try again.',
        { fieldErrors },
        400
      )
    }

    // Database connection errors
    if (error instanceof Error && error.message.includes('connect')) {
      return createErrorResponse(
        'Unable to process your request due to a temporary service issue. Please try again in a few moments.',
        null,
        503
      )
    }

    // Network errors
    if (error instanceof Error && error.message.includes('network')) {
      return createErrorResponse(
        'Network error occurred. Please check your internet connection and try again.',
        null,
        502
      )
    }

    // Generic fallback
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return createErrorResponse(
      `Unable to process your payment: ${errorMessage}. Please try again or contact support if the problem persists.`,
      null,
      500
    )
  }
}

// GET endpoint for payment status - only supports bookingID lookup
export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(request.url)
    const booking_slug = searchParams.get('booking')

    if (!booking_slug) {
      return NextResponse.json(
        { error: 'Booking reference (Booking ID) is required' },
        { status: 400 }
      )
    }

    // Find booking by bookingID only
    const booking = await prisma.booking.findFirst({
      where: { bookingSlug: booking_slug },
      include: {
        payment: true,
        service: true,
        entrepreneur: {
          include: {
            user: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found with this reference' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        bookingSlug: booking.bookingSlug,
        status: booking.status,
        service: booking.service.name,
        timezone: booking.timezone,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        customerName: `${booking.customerFirstName} ${booking.customerLastName}`,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        serviceLocation: booking.serviceLocation,
        serviceAddress: booking.serviceLocation === 'home' ? booking.serviceAddress : booking.entrepreneur.address,
        specialRequests: booking.specialRequests,
        businessName: booking.entrepreneur.businessName,
        businessAddress: booking.entrepreneur.address,
        businessPhone: booking.entrepreneur.user.phone,
        cancelReason: booking.cancelReason,
        confirmedAt: booking.confirmedAt,
        // Payment info only available after payment succeeds
        payment: booking.payment ? {
          status: booking.payment.status,
          method: booking.payment.paymentMethod,
          type: booking.payment.paymentType,
          transactionId: booking.payment.transactionId,
          serviceAmount: booking.payment.serviceAmount,
          depositAmount: booking.payment.depositAmount,
          platformFee: booking.payment.platformFee,
          remainingAmount: booking.payment.serviceAmount - booking.payment.depositAmount,
        } : null
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    )
  }
}