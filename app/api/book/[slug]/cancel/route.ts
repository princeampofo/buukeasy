// app/api/book/[slug]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { DateTime } from 'luxon'
import { z } from 'zod'

// Validation schema for cancellation request
const cancellationRequestSchema = z.object({
  bookingSlug: z.string().min(1, 'Booking reference is required'),
})

function createErrorResponse(message: string, details?: any, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  }, { status })
}

async function initiateRefund(payment: any, booking: any): Promise<void> {
  // TODO: Implement actual refund logic with Ziina API
  // For now, we'll just log the refund request
  
  // In a real implementation, you would:
  // 1. Call Ziina's refund API
  // 2. Update payment status to 'REFUNDED' or 'REFUND_PENDING'
  // 3. Handle refund webhooks
  
  // Example refund API call structure:
  /*
  const ZIINA_API_URL = process.env.ZIINA_API_URL || 'https://api-v2.ziina.com/api'
  const ZIINA_API_KEY = process.env.ZIINA_API_KEY
  
  const refundResponse = await fetch(`${ZIINA_API_URL}/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZIINA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      payment_intent_id: payment.paymentIntentId,
      amount: payment.depositAmount * 100, // Convert to fils
      reason: 'Customer cancellation'
    })
  })
  
  if (!refundResponse.ok) {
    throw new Error('Failed to initiate refund with payment processor')
  }
  */
}

async function sendCancellationEmails(booking: any): Promise<void> {
  try {
    // Send cancellation confirmation to customer
    const customerEmailData = {
      to: booking.customerEmail,
      subject: `Booking Cancelled - ${booking.service.name}`,
      template: 'booking-cancellation-customer',
      data: {
        customerName: `${booking.customerFirstName} ${booking.customerLastName}`,
        serviceName: booking.service.name,
        businessName: booking.entrepreneur.businessName,
        appointmentDate: booking.appointmentDate.toLocaleDateString(),
        appointmentTime: booking.appointmentTime,
        bookingSlug: booking.bookingSlug,
        refundAmount: booking.payment?.depositAmount || 0,
        estimatedRefundDays: '3-5 business days'
      }
    }

    // Send cancellation notification to entrepreneur
    const entrepreneurEmailData = {
      to: booking.entrepreneur.user.email,
      subject: `Booking Cancelled - ${booking.service.name}`,
      template: 'booking-cancellation-entrepreneur',
      data: {
        businessName: booking.entrepreneur.businessName,
        customerName: `${booking.customerFirstName} ${booking.customerLastName}`,
        serviceName: booking.service.name,
        appointmentDate: booking.appointmentDate.toLocaleDateString(),
        appointmentTime: booking.appointmentTime,
        bookingSlug: booking.bookingSlug,
        refundAmount: booking.payment?.depositAmount || 0
      }
    }
    // TODO: Implement actual email sending service
    
  } catch (error) {
    console.error('Failed to prepare cancellation emails:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const slug = request.url.split('/').slice(-2)[0] // Get slug from URL path
    
    // Validate input
    let validatedData
    try {
      validatedData = cancellationRequestSchema.parse(body)
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
      throw error
    }

    // Find entrepreneur by slug
    const entrepreneur = await prisma.entrepreneurProfile.findFirst({
      where: { slug: slug }
    })

    if (!entrepreneur) {
      return createErrorResponse(
        'This business cannot be found.',
        null,
        404
      )
    }

    // Find booking by slug
    const booking = await prisma.booking.findFirst({
      where: { 
        bookingSlug: validatedData.bookingSlug,
        entrepreneurId: entrepreneur.id
      },
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
      return createErrorResponse(
        'Booking not found with this reference.',
        null,
        404
      )
    }

    // Check if booking is already cancelled
    if (booking.status === 'CANCELLED') {
      return createErrorResponse(
        'This booking has already been cancelled.',
        null,
        400
      )
    }
    // Check if the booking is only PENDING and just delete it
    if (booking.status === 'PENDING') {
      await prisma.booking.delete({
        where: { id: booking.id }
      })
      return NextResponse.json({ success: true })
    }

    // Check if booking is confirmed and has payment
    if (booking.status !== 'CONFIRMED' || !booking.payment) {
      return createErrorResponse(
        'Only confirmed bookings with completed payments can be cancelled.',
        null,
        400
      )
    }

    // Check if booking can be cancelled (48+ hours before appointment)
    const entrepreneurTimezone = booking.entrepreneur.timezone || 'Asia/Dubai'
    
    // Combine date and time in the entrepreneur's timezone
    const appointmentDateTime = DateTime.fromISO(
      `${booking.appointmentDate}T${booking.appointmentTime}:00`,
      { zone: entrepreneurTimezone }
    )
    
    if (!appointmentDateTime.isValid) {
      return createErrorResponse(
        'Invalid appointment date/time format.',
        null,
        500
      )
    }
    
    const now = DateTime.now().setZone(entrepreneurTimezone)
    const hoursUntilAppointment = appointmentDateTime.diff(now, 'hours').hours

    if (hoursUntilAppointment < 48) {
      const timeRemaining = appointmentDateTime.diff(now, ['days', 'hours'])
      let timeMessage = ''
      
      if (timeRemaining.days > 0) {
        timeMessage = `${Math.floor(timeRemaining.days)} days and ${Math.floor(timeRemaining.hours % 24)} hours`
      } else if (timeRemaining.hours > 0) {
        timeMessage = `${Math.floor(timeRemaining.hours)} hours`
      } else {
        timeMessage = 'less than 1 hour'
      }
      
      return createErrorResponse(
        `Bookings can only be cancelled at least 48 hours before the appointment time. Your appointment is in ${timeMessage}.`,
        { 
          hoursUntilAppointment: Math.round(hoursUntilAppointment * 100) / 100,
          appointmentTime: appointmentDateTime.toISO(),
          currentTime: now.toISO()
        },
        400
      )
    }

    // Use database transaction for cancellation
    const result = await prisma.$transaction(async (tx) => {
      // Update booking status to CANCELLED
      const cancelledBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CANCELLED',
          cancelReason: 'Customer cancellation',
          updatedAt: new Date()
        }
      })

      // Update payment status to indicate refund is being processed
      const updatedPayment = await tx.payment.update({
        where: { bookingId: booking.id },
        data: {
          status: 'REFUNDED',
          updatedAt: new Date()
        }
      })

      return { booking: cancelledBooking, payment: updatedPayment }
    })

    // Initiate refund and send emails
    try {
      await Promise.all([
        // initiateRefund(booking.payment, booking),
        // sendCancellationEmails(booking)
      ])
    } catch (refundError) {
      console.error('Failed to initiate refund or send emails for booking:', refundError)
      // Don't fail the cancellation if refund initiation fails
      // The refund can be processed manually if needed
    }

    return NextResponse.json({
      success: true,
      message: 'Your booking has been cancelled successfully. A refund is being processed.',
      booking: {
        id: result.booking.id,
        bookingSlug: result.booking.bookingSlug,
        status: result.booking.status,
        cancelReason: result.booking.cancelReason
      },
      refund: {
        status: 'processing',
        amount: booking.payment.depositAmount,
        estimatedDays: '3-5 business days'
      }
    })

  } catch (error) {
    
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
      
      return createErrorResponse(
        'Please check your cancellation request and try again.',
        { fieldErrors },
        400
      )
    }

    // Database connection errors
    if (error instanceof Error && error.message.includes('connect')) {
      return createErrorResponse(
        'Unable to process your cancellation due to a temporary service issue. Please try again in a few moments.',
        null,
        503
      )
    }

    // Generic fallback
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return createErrorResponse(
      `Unable to cancel your booking: ${errorMessage}. Please try again or contact support if the problem persists.`,
      null,
      500
    )
  }
}