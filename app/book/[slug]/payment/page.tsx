'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Lock, ArrowLeft, CheckCircle, XCircle, Loader2, Info, AlertTriangle } from 'lucide-react'
import { useBookingStorage } from '@/hooks/useBookingStorage'
import { DateTime } from 'luxon'

interface PaymentState {
  status: 'idle' | 'processing' | 'success' | 'error'
  message?: string
  transactionId?: string
}

export default function PaymentPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingSlug = searchParams.get('booking')
  const paymentStatus = searchParams.get('status') // Can be 'cancelled' or 'failed'
  
  const { 
    bookingData, 
    isLoaded, 
    canProceedToStep,
    clearBookingData,
  } = useBookingStorage()

  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' })
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  
  // Use ref to prevent multiple clearBookingData calls
  const hasHandledPaymentStatus = useRef(false)

  // Calculate platform fee: 5% of service amount, min 3 AED, max 5 AED
  const calculatePlatformFee = () => {
    if (!bookingData.serviceAmount) return 3
    const feeAmount = bookingData.serviceAmount * 0.05
    return Math.min(Math.max(feeAmount, 3), 5)
  }

  const platformFee = calculatePlatformFee()

  // Handle payment status from URL params (cancelled/failed) - FIXED
  useEffect(() => {
  const handleFailedPayment = async () => {
    if ((paymentStatus === 'cancelled' || paymentStatus === 'failed') && !hasHandledPaymentStatus.current) {
      hasHandledPaymentStatus.current = true
      
      try {
        // Delete booking from database
        await fetch(`/api/book/${slug}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingSlug: bookingSlug,
          })
        })
      } catch (error) {
        console.error('Error cancelling booking:', error)
      }
      
      // Clear booking data when payment is cancelled/failed
      clearBookingData()
      
      setPaymentState({
        status: 'error',
        message: paymentStatus === 'cancelled'
          ? 'Your payment was cancelled. Please restart the booking process.'
          : 'Your payment failed. Please restart the booking process.'
      })
    }
  }
  
  handleFailedPayment()
}, [paymentStatus, clearBookingData, slug, bookingSlug])


  // Redirect if previous steps not completed - FIXED: Only redirect if no payment status
  useEffect(() => {
    if (isLoaded && !paymentStatus && !hasHandledPaymentStatus.current) {
      if (!canProceedToStep(4)) {
        if (!bookingData.serviceId) {
          router.push(`/book/${slug}`)
        } else if (!bookingData.appointmentDate) {
          router.push(`/book/${slug}/appointment`)
        } else if (!bookingData.customerFirstName || !bookingData.customerLastName || !bookingData.customerPhone) {
          router.push(`/book/${slug}/details`)
        }
      }
    }
  }, [isLoaded, canProceedToStep, bookingData, router, slug, paymentStatus])

  // Rest of your component remains the same...
  const formatDate = (date: string) => {
    // Parse ISO date string in business timezone
    const dateTime = DateTime.fromISO(date, { zone: bookingData.businessTimezone || 'Asia/Dubai' })
    return dateTime.toFormat('cccc, LLLL d, y') // e.g., "Monday, January 15, 2024"
  }

  const formatTime = (time: string) => {
    return time
  }

  const createPaymentIntent = async () => {
    setIsCreatingPayment(true)
    setPaymentState({ status: 'processing' })

    try {
      const response = await fetch(`/api/book/${slug}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: bookingData.serviceId,
          appointmentDate: bookingData.appointmentDate,
          appointmentTime: bookingData.appointmentTime,
          depositAmount: bookingData.depositAmount,
          serviceAmount: bookingData.serviceAmount,
          platformFee: platformFee,
          serviceLocation: bookingData.serviceLocation,
          
          customerFirstName: bookingData.customerFirstName,
          customerLastName: bookingData.customerLastName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
          serviceAddress: bookingData.serviceAddress,
          addressNotes: bookingData.addressNotes,
          specialRequests: bookingData.specialRequests || '',
          
          entrepreneurId: bookingData.entrepreneurId,
          paymentMethod: 'ziina',
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const result = await response.json()

      if (result.success && result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        throw new Error(result.message || 'Failed to create payment intent')
      }

    } catch (error) {
      console.error('Payment creation error:', error)
      setPaymentState({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Payment failed. Please try again.' 
      })
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const handleRestartBooking = () => {
    clearBookingData()
    router.push(`/book/${slug}`)
  }

  // Don't render until data is loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  // If payment was cancelled or failed, show error message and restart option
  if (paymentStatus === 'cancelled' || paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            {paymentStatus === 'cancelled' ? (
              <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-orange-600 mx-auto mb-4" />
            ) : (
              <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto mb-4" />
            )}
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {paymentStatus === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
            </h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              {paymentStatus === 'cancelled' 
                ? 'Your payment was cancelled. Please restart the booking process to try again.'
                : 'Your payment failed. Please restart the booking process to try again.'
              }
            </p>
            <button
              onClick={handleRestartBooking}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Start New Booking
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if previous steps not completed (and no error status)
  if (!canProceedToStep(4)) {
    return null
  }

  const remainingAmount = (bookingData.serviceAmount || 0) - (bookingData.depositAmount || 0)

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-3 sm:px-6">
      {/* Back Button and Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => router.push(`/book/${slug}/details`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment</h1>
      </div>

      {/* Deposit Information Banner */}
      {bookingData.depositAmount ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1 sm:mb-2 text-sm sm:text-base">Deposit Payment</h3>
              <p className="text-blue-800 text-xs sm:text-sm leading-relaxed">
              You're paying a deposit of <strong>AED {bookingData.depositAmount?.toFixed(2)}</strong> plus a platform fee of <strong>AED {platformFee.toFixed(2)}</strong> to secure your appointment. 
              <span className="hidden sm:inline"> The remaining service amount of <strong>AED {remainingAmount.toFixed(2)}</strong> will be paid directly to the service provider at the time of your appointment.</span>
            </p>
          </div>
        </div>
      </div>): ""}

      {/* Platform Fee Information */}
      {/* <div className="bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Platform Fee</h3>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              A platform fee of <strong>AED {platformFee.toFixed(2)}</strong> is added to help maintain and improve our booking platform. This fee is 5% of the service amount (minimum AED 3, maximum AED 5).
            </p>
          </div>
        </div>
      </div> */}

      {/* Booking Summary */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Booking Summary</h2>
        
        <div className="space-y-3 sm:space-y-4">
          {/* Service Details - Mobile Stacked, Desktop Grid */}
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Service Details</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-right flex-1 ml-2">{bookingData.serviceName}</span>
                </div>
                <div className="flex justify-between sm:hidden">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-right flex-1 ml-2">{bookingData.appointmentDate && formatDate(bookingData.appointmentDate)}</span>
                </div>
                <div className="flex justify-between sm:hidden">
                  <span className="text-gray-600">Time:</span>
                  <span className="text-right flex-1 ml-2">{formatTime(bookingData.appointmentTime || '')} (GST)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-right flex-1 ml-2">{bookingData.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="text-right flex-1 ml-2">{bookingData.serviceLocation === 'home' ? 'Home Service' : 'In-Store'}</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:block">
              <h3 className="font-medium text-gray-900 mb-3">Appointment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{bookingData.appointmentDate && formatDate(bookingData.appointmentDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span>{formatTime(bookingData.appointmentTime || '')} (GST)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Customer:</span>
                  <span>{bookingData.customerFirstName} {bookingData.customerLastName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Address for Home Services */}
          {bookingData.serviceLocation === 'home' && bookingData.serviceAddress && (
            <div className="pt-3 sm:pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Service Address</h3>
              <p className="text-xs sm:text-sm text-gray-600">{bookingData.serviceAddress}</p>
              {bookingData.addressNotes && (
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Note: {bookingData.addressNotes}</p>
              )}
            </div>
          )}

          {/* Special Requests - Hidden on mobile if empty */}
          {bookingData.specialRequests && (
            <div className="pt-3 sm:pt-4 border-t">
              <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Special Requests</h3>
              <p className="text-xs sm:text-sm text-gray-600">{bookingData.specialRequests}</p>
            </div>
          )}

          {/* Payment Breakdown */}
          <div className="pt-3 sm:pt-4 border-t">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-600">Service Amount:</span>
                <span className="font-medium">AED {bookingData.serviceAmount?.toFixed(2)}</span>
              </div>
              {bookingData.depositAmount ? (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-medium">AED {bookingData.depositAmount?.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">AED {platformFee.toFixed(2)}</span>
              </div>
              {bookingData.depositAmount ? (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-600">Remaining (At Appointment):</span>
                  <span className="font-medium">AED {remainingAmount.toFixed(2)}</span>
                </div>
              ) : null}
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Pay Today:</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">AED {platformFee.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Payment</h2>
        </div>

        {/* Payment Status Messages */}
        {paymentState.status === 'error' && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              <span className="text-red-800 font-medium text-sm sm:text-base">Payment Failed</span>
            </div>
            <p className="text-red-600 text-xs sm:text-sm mt-1">{paymentState.message}</p>
          </div>
        )}

        <div className="space-y-3 sm:space-y-4">
          <button
            onClick={createPaymentIntent}
            disabled={paymentState.status === 'processing' || isCreatingPayment}
            className={`w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all ${
              paymentState.status === 'processing' || isCreatingPayment
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {(paymentState.status === 'processing' || isCreatingPayment) ? (
              <>
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                Pay AED {platformFee.toFixed(2)}
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 justify-center">
            <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>
      </div>

      {/* Terms and Conditions - Simplified on mobile */}
      <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h3 className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Terms and Conditions</h3>
        <div className="text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-2">
          <p>• By proceeding with payment, you agree to our terms of service and privacy policy.</p>
          {bookingData.depositAmount ? (
            <>
              <p>• This deposit secures your appointment time and is non-refundable within 48 hours.</p>
              <p className="hidden sm:block">• Cancellations must be made at least 48 hours in advance for a full deposit refund.</p>
              <p className="hidden sm:block">• The remaining service amount will be paid directly to the service provider.</p>
              <p className="hidden sm:block">• You will receive a confirmation email once payment is completed.</p>
            </>
          ) : ""}
          <p>• The platform fee helps maintain and improve our booking system. This fee is 5% of the service amount (minimum AED 3, maximum AED 5)</p>
          <p className="sm:block">• Cancellations must be made 48+ hours in advance.</p>
          <p className="sm:block">• You will receive a confirmation email once completed.</p>
        </div>
      </div>
    </div>
  )
}