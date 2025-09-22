// app/api/webhooks/ziina/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/lib/db'
import crypto from 'crypto'

const ZIINA_WEBHOOK_SECRET = process.env.ZIINA_WEBHOOK_SECRET

// Allowed Ziina webhook IP addresses
const ALLOWED_IPS = [
  '3.29.184.186',
  '3.29.190.95', 
  '20.233.47.127'
]

// Updated Ziina webhook payload structure
interface ZiinaWebhookPayload {
  event: 'payment_intent.status.updated'
  data: {
    id: string
    account_id: string
    amount: number
    tip_amount?: number
    currency_code: string
    message: string
    created_at: string
    status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'requires_user_action'
    operation_id: string
    redirect_url: string
    embedded_url: string
    success_url: string
    cancel_url: string
    allow_tips: boolean
    fee_amount: number
    latest_error: Record<string, any>
  }
}

function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) return realIP
  if (cfConnectingIP) return cfConnectingIP
  
  // Fallback to request IP
  return 'unknown'
}

function isAllowedIP(ip: string): boolean {
  return ALLOWED_IPS.includes(ip)
}

function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  }, { status })
}

function verifyZiinaSignature(payload: string, signature: string): boolean {
  if (!ZIINA_WEBHOOK_SECRET) {
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', ZIINA_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  } catch (error) {
    return false
  }
}

async function sendBookingConfirmationEmail(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        entrepreneur: { include: { user: true } },
        payment: true
      }
    })

    if (!booking) {
      return
    }
    
    const emailData = {
      to: booking.customerEmail,
      subject: `Booking Confirmed - ${booking.service.name}`,
      template: 'booking-confirmation',
      data: {
        customerName: `${booking.customerFirstName} ${booking.customerLastName}`,
        serviceName: booking.service.name,
        businessName: booking.entrepreneur.businessName,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        depositPaid: booking.payment?.depositAmount || 0,
        remainingAmount: (booking.payment?.serviceAmount || 0) - (booking.payment?.depositAmount || 0),
        serviceLocation: booking.serviceLocation,
        serviceAddress: booking.serviceAddress,
        specialRequests: booking.specialRequests,
        bookingSlug: booking.bookingSlug
      }
    }
    
  } catch (error) {
    console.error('Failed to prepare entrepreneur notification:', error)
  }
}

async function sendBookingNotificationToEntrepreneur(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        entrepreneur: { include: { user: true } },
        payment: true
      }
    })

    if (!booking) {
      return
    }

    const emailData = {
      to: booking.entrepreneur.user.email,
      subject: `New Booking - ${booking.service.name}`,
      template: 'new-booking-notification',
      data: {
        businessName: booking.entrepreneur.businessName,
        customerName: `${booking.customerFirstName} ${booking.customerLastName}`,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        serviceName: booking.service.name,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        depositPaid: booking.payment?.depositAmount || 0,
        remainingAmount: (booking.payment?.serviceAmount || 0) - (booking.payment?.depositAmount || 0),
        serviceLocation: booking.serviceLocation,
        serviceAddress: booking.serviceAddress,
        specialRequests: booking.specialRequests,
        bookingSlug: booking.bookingSlug
      }
    }
    
  } catch (error) {
    console.error('Failed to prepare entrepreneur notification:', error)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Validate IP address first
    const clientIP = getClientIP(request)
    
    if (!isAllowedIP(clientIP)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized IP address'
      }, { status: 403 })
    }

    const headersList = await headers()
    const signature = headersList.get('x-hmac-signature') || 
                     headersList.get('x-signature') ||
                     headersList.get('ziina-signature')
    
    if (!signature) {
      return createErrorResponse('Missing signature', 400)
    }

    const payload = await request.text()
    
    if (!verifyZiinaSignature(payload, signature)) {
      return createErrorResponse('Invalid signature', 401)
    }

    let webhookData: ZiinaWebhookPayload
    try {
      webhookData = JSON.parse(payload)
    } catch (parseError) {
      return createErrorResponse('Invalid JSON payload', 400)
    }

    const { event, data } = webhookData
   
    const booking = await prisma.booking.findFirst({
      where: {
        paymentIntentId: data.id,
        status: { in: ['PENDING', 'CONFIRMED'] } // Allow updates to confirmed bookings too
      },
      include: { 
        service: true,
        entrepreneur: true,
        payment: true
      }
    })

    if (!booking) {
      return createErrorResponse('Booking not found', 404)
    }

    // Handle different payment statuses
    switch (data.status) {
      case 'completed':
        await handlePaymentCompleted(booking, data)
        break

      case 'failed':
        await handlePaymentFailed(booking, data)
        break

      case 'cancelled':
        await handlePaymentCancelled(booking, data)
        break
       
      case 'pending':
        await handlePaymentPending(booking, data)
        break

      default:
        console.warn('Unhandled payment status:', data.status)
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({ 
      success: true, 
      processed_at: new Date().toISOString(),
      processing_time_ms: processingTime
    })

  } catch (error) {
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Webhook processing failed',
      500
    )
  }
}

async function handlePaymentCompleted(booking: any, data: ZiinaWebhookPayload['data']) {

  // use ziina get payment details API
  const paymentDetails = await getZiinaPaymentDetails(data.id)

  try {
    // Use a database transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      
      // Calculate amounts (amount is in fils, convert to AED)
      const depositAmount = 0
      const tipAmount = paymentDetails.tip_amount ? paymentDetails.tip_amount / 100 : 0
      const processingFee = paymentDetails.fee_amount ? paymentDetails.fee_amount / 100 : 0

      const service = booking.service
      const serviceAmount = booking.serviceLocation === 'home' ? 
        service.homeServicePrice : service.inStoreServicePrice

      const platformFeeRate = 0.05 // 5% platform fee on deposits
      const platformFee = data.amount / 100 // Convert fils to AED
      const netAmount = serviceAmount - depositAmount
      
      // Update or create payment record
      const payment = await tx.payment.upsert({
        where: { bookingId: booking.id },
        create: {
          bookingId: booking.id,
          entrepreneurId: booking.entrepreneurId,
          totalAmount: 0,
          depositAmount: depositAmount,
          serviceAmount: serviceAmount,
          tipAmount: tipAmount,
          currency: data.currency_code || 'AED',
          paymentType: 'DEPOSIT',
          paymentMethod: 'ZIINA',
          paymentIntentId: data.id,
          transactionId: data.operation_id,
          status: 'COMPLETED',
          processingFee: processingFee,
          platformFeeRate: platformFeeRate,
          platformFee: platformFee,
          netAmount: netAmount,
          isFullPayment: false,
          description: `Deposit for ${service.name} - ${booking.entrepreneur.businessName}`
        },
        update: {
          status: 'COMPLETED',
          tipAmount: tipAmount,
          paymentIntentId: data.id,
          transactionId: data.operation_id,
          processingFee: processingFee,
          netAmount: netAmount,
          updatedAt: new Date()
        }
      })

      // Update booking status to CONFIRMED
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          updatedAt: new Date(),
          serviceAddress: booking.serviceLocation === 'in-store' ? 
            booking.entrepreneur.address : booking.serviceAddress,
          addressNotes: booking.serviceLocation === 'in-store' ? 
            '' : booking.addressNotes,
        }
      })

      return { booking: updatedBooking, payment }
    })

    // Send confirmation emails asynchronously
    // Promise.all([
    //   sendBookingConfirmationEmail(booking.id),
    //   sendBookingNotificationToEntrepreneur(booking.id)
    // ]).catch(error => {
    //   console.error('Failed to send emails:', error)
    // })

  } catch (error) {
    throw error
  }
}

async function handlePaymentFailed(booking: any, data: ZiinaWebhookPayload['data']) {

  try {
    const failureReason = data.latest_error?.message || 'Payment failed'

    // Delete the booking because it failed
    await prisma.booking.delete({
      where: { id: booking.id }
    })

  } catch (error) {
    throw error
  }
}

async function handlePaymentCancelled(booking: any, data: ZiinaWebhookPayload['data']) {

  try {
    // Delete the booking because it was cancelled
    await prisma.booking.delete({
      where: { id: booking.id }
    })

  } catch (error) {
    throw error
  }
}

async function handlePaymentPending(booking: any, data: ZiinaWebhookPayload['data']) {

  try {
    
    // Keep booking status as PENDING
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        updatedAt: new Date()
      }
    })

  } catch (error) {
    throw error
  }
}

async function getZiinaPaymentDetails(paymentId: string) {
  const ZIINA_API_BASE_URL = process.env.ZIINA_API_BASE_URL || 'https://api-v2.ziina.com/api'
  const ZIINA_API_KEY = process.env.ZIINA_API_KEY
  
  if (!ZIINA_API_KEY) {
    throw new Error('ZIINA_API_KEY is not configured')
  }

  try {
    const response = await fetch(`${ZIINA_API_BASE_URL}/payment_intent/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ZIINA_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Ziina API error: ${response.status} ${response.statusText}`)
    }

    const paymentDetails = await response.json()
    return paymentDetails

  } catch (error) {
    throw new Error(`Failed to retrieve payment details: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}