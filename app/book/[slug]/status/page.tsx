'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Loader2, XCircle, Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react'
import { useBookingStorage } from '@/hooks/useBookingStorage'
import { DateTime } from 'luxon'
import { useBookingStatus } from '@/contexts/BookingStatusContext'

interface BookingData {
  id: string
  bookingSlug: string
  status: string
  service: string
  timezone: string
  appointmentDate: string
  appointmentTime: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceLocation: string
  serviceAddress?: string
  specialRequests?: string
  businessName: string
  businessAddress: string
  businessPhone: string
  cancelReason?: string
  confirmedAt?: string
  createdAt: string
  payment: {
    status: string
    method: string
    type: string
    transactionId?: string
    totalAmount: number
    depositAmount: number
    remainingAmount: number
  } | null
}

interface PageState {
  status: 'loading' | 'confirmed' | 'cancelled' | 'not_found'
  booking?: BookingData
}

export default function StatusPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingSlug = searchParams.get('booking')
  
  const [pageState, setPageState] = useState<PageState>({ status: 'loading' })
  const { clearBookingData } = useBookingStorage()
  const [pollCount, setPollCount] = useState(0)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { setBookingStatus } = useBookingStatus() // Add this line


  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && bookingSlug) {
      startPolling()
    } else if (isClient && !bookingSlug) {
      setPageState({
        status: 'not_found'
      })
    }
  }, [bookingSlug, isClient])

  const fetchBookingByBookingSlug = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/book/${slug}/payment?booking=${bookingSlug}`)

      if (!response.ok) {
        setPageState({
          status: 'not_found'
        })
        setBookingStatus(null) // Update context
        return true // Stop polling
      }

      const result = await response.json()
      const booking = result.booking

      setBookingStatus(booking.status)
      
      // Check if payment is confirmed
      if (booking.payment && booking.status === 'CONFIRMED') {
        setPageState({
          status: 'confirmed',
          booking: booking
        })
        // Clear booking storage after successful confirmation
        clearBookingData()
        return true // Stop polling
      }

      // If booking is cancelled, show cancelled state
      if (booking.status === 'CANCELLED') {
        setPageState({
          status: 'cancelled',
          booking: booking
        })
        clearBookingData()
        return true // Stop polling
      }

      // Keep polling if payment not yet confirmed
      setPageState({
        status: 'loading',
        booking: booking
      })
      return false // Continue polling

    } catch (error) {
      setPageState({
        status: 'not_found'
      })
      setBookingStatus(null) // Update context
      return true // Stop polling
    }
  }

  const startPolling = async () => {
    let intervalId: NodeJS.Timeout
    let currentPollCount = 0

    // Initial fetch
    const isComplete = await fetchBookingByBookingSlug()
    
    if (!isComplete) {
      intervalId = setInterval(async () => {
        currentPollCount++
        setPollCount(currentPollCount)
        
        // Stop polling after 20 attempts (60 seconds)
        if (currentPollCount >= 20) {
          clearInterval(intervalId)
          setPageState({
            status: 'not_found'
          })
          return
        }
        
        const complete = await fetchBookingByBookingSlug()
        if (complete) {
          clearInterval(intervalId)
        }
      }, 3000) // Poll every 3 seconds
    }

    // Cleanup interval on component unmount
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }

  const canCancelBooking = (booking: BookingData): boolean => {
    if (!booking.confirmedAt || booking.status !== 'CONFIRMED') return false

    const appointmentDateTime = DateTime.fromISO(booking.appointmentDate + 'T' + booking.appointmentTime, { zone: booking.timezone || 'Asia/Dubai' })
    const now = DateTime.now().setZone(booking.timezone || 'Asia/Dubai')
    const hoursUntilAppointment = appointmentDateTime.diff(now, 'hours').hours

    return hoursUntilAppointment >= 48 // Must be 48+ hours before appointment
  }

  const handleCancelBooking = async () => {
    if (!pageState.booking) return
    
    setIsCancelling(true)
    setCancelError(null)
    
    try {
      const response = await fetch(`/api/book/${slug}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingSlug: pageState.booking.bookingSlug
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to cancel booking')
      }

      setBookingStatus('CANCELLED')
      
      // Close modal and refresh the booking status
      setShowCancelModal(false)
      await fetchBookingByBookingSlug()
      
    } catch (error) {
      setCancelError(error instanceof Error ? error.message : 'Failed to cancel booking')
    } finally {
      setIsCancelling(false)
    }
  }

  const handleBookAgain = () => {
    clearBookingData()
    // Reset any cached booking status by reloading the page
    window.location.href = `/book/${slug}`
  }

  // Cancel Modal Component
  const CancelModal = () => {
    if (!showCancelModal || !pageState.booking) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancel Booking</h3>
          <p className="text-gray-600 mb-6">
            Do you want to cancel this booking? A refund will be processed within 3-5 business days.
          </p>

          {cancelError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {cancelError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCancelModal(false)
                setCancelError(null)
              }}
              disabled={isCancelling}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              No, Keep It
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel'
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (date: string) => {
    // Parse ISO date string in business timezone
    const dateTime = DateTime.fromISO(date, { zone: pageState.booking?.timezone || 'Asia/Dubai' })
    return dateTime.toFormat('cccc, LLLL d, y') // e.g., "Monday, January 15, 2024"
  }

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  // Loading state
  if (pageState.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Checking Booking Status</h1>
            <p className="text-gray-600 text-sm sm:text-base">Please wait while we verify your booking status...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a few moments. Do not refresh the page.</p>
            {pollCount > 5 && (
              <p className="text-xs text-blue-600 mt-1">
                Still processing... ({pollCount * 3}s elapsed)
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (pageState.status === 'not_found') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8 max-w-md w-full">
          <div className="text-center">
            <XCircle className="h-10 w-10 sm:h-12 sm:w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">We couldn't find your booking details. Please try again or contact support.</p>
            <div className="space-y-3">
              <button
                onClick={() => startPolling()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={handleBookAgain}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Make New Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Cancelled booking state
  if (pageState.status === 'cancelled' && pageState.booking) {
    const booking = pageState.booking
    
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Cancelled Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
          <div className="text-center">
            <XCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Cancelled</h1>
            <p className="text-base sm:text-lg text-gray-600 mb-4">Your booking has been cancelled successfully.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 inline-block">
              <p className="text-red-800 font-medium text-sm sm:text-base">Booking Reference: {booking.bookingSlug}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mt-4">
              <p className="text-orange-800 text-sm">A refund is being processed and will appear in your account within 3-5 business days.</p>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Cancelled Booking Details</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Date & Time</p>
                <p className="text-gray-600 text-sm sm:text-base">{formatDate(booking.appointmentDate)}</p>
                <p className="text-gray-600 text-sm sm:text-base">{booking.appointmentTime} (GST)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Service</p>
                <p className="text-gray-600 text-sm sm:text-base">{booking.service}</p>
              </div>
            </div>

            {booking.cancelReason && (
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Cancellation Reason</p>
                  <p className="text-gray-600 text-sm sm:text-base">{booking.cancelReason}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleBookAgain}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Book New Appointment
          </button>
        </div>
      </div>
    )
  }

  // Confirmed booking - we have booking data
  const booking = pageState.booking!

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Success Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 sm:p-8">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4">Your booking has been confirmed successfully!</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 inline-block">
            <p className="text-green-800 font-medium text-sm sm:text-base">Booking Reference: {booking.bookingSlug}</p>
          </div>
        </div>
      </div>

      {/* Mobile: Stacked Layout, Desktop: Grid Layout */}
      <div className="space-y-4 sm:space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Appointment Details */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:col-span-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Appointment Details</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Date & Time</p>
                <p className="text-gray-600 text-sm sm:text-base">{formatDate(booking.appointmentDate)}</p>
                <p className="text-gray-600 text-sm sm:text-base">{booking.appointmentTime} (GST)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Service</p>
                <p className="text-gray-600 text-sm sm:text-base">{booking.service}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Location</p>
                <p className="text-gray-600 text-sm sm:text-base">
                  {booking.serviceLocation === 'home' ? 'Home Service' : 'In-Store'}
                </p>
                {booking.serviceAddress && (
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">{booking.serviceAddress}</p>
                )}
              </div>
            </div>

            {booking.specialRequests && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Special Requests</p>
                  <p className="text-gray-600 text-sm sm:text-base">{booking.specialRequests}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Customer Information - Hidden some details on mobile */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:col-span-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Name</p>
                <p className="text-gray-600 text-sm sm:text-base">{booking.customerName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base">Email</p>
                <p className="text-gray-600 text-sm sm:text-base break-all">{booking.customerEmail}</p>
              </div>
            </div>

            {booking.customerPhone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Phone</p>
                  <p className="text-gray-600 text-sm sm:text-base">{booking.customerPhone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Information - Simplified on mobile */}
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:col-span-1">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
          
          <div className="space-y-2 sm:space-y-4">
            <div>
              <p className="font-medium text-gray-900 text-sm sm:text-base">{booking.businessName}</p>
              <p className="text-gray-600 text-sm sm:text-base">{booking.businessAddress}</p>
              {booking.businessPhone && (
                <p className="text-gray-600 text-sm sm:text-base">{booking.businessPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {booking.payment && (
          <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 lg:col-span-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Payment Status</p>
                  <p className="text-green-600 font-medium text-sm sm:text-base">Completed</p>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                {booking.payment.depositAmount? <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Deposit Paid:</span>
                  <span className="font-medium text-sm sm:text-base">AED {booking.payment.depositAmount.toFixed(2)}</span>
                </div> : null}
                {booking.payment.depositAmount ? <div className="flex justify-between">
                  <span className="text-gray-600 text-sm sm:text-base">Remaining Amount:</span>
                  <span className="font-medium text-sm sm:text-base">AED {booking.payment.remainingAmount.toFixed(2)}</span>
                </div> : null}
                <div className="flex justify-between text-base sm:text-lg font-semibold pt-2 border-t">
                  <span className="text-gray-600 text-sm sm:text-base">Paid:</span>
                  <span className="font-medium text-sm sm:text-base">AED {booking.payment.platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-semibold pt-2 border-t">
                  <span>Remaining Amount:</span>
                  <span>AED {booking.payment.serviceAmount.toFixed(2)}</span>
                </div>
              </div>

              {booking.payment.transactionId && (
                <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                  Transaction ID: {booking.payment.transactionId}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Section - Only show if booking can be cancelled */}
      {canCancelBooking(booking) && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6">
          <h3 className="font-semibold text-orange-900 mb-2 sm:mb-3 text-sm sm:text-base">Cancel Booking</h3>
          <p className="text-xs sm:text-sm text-orange-800 mb-3 sm:mb-4">
            You can cancel your booking up to 48 hours before the appointment for a full refund. Refunds take 3-5 business days to process.
          </p>
          
          <button
            onClick={() => setShowCancelModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm sm:text-base flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel Booking
          </button>
        </div>
      )}

      {/* Success Notes - Simplified on mobile */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base">Important Notes</h3>
        <div className="text-xs sm:text-sm text-blue-800 space-y-1">
          <p>• Save your booking reference: <strong>{booking.bookingSlug}</strong></p>
          <p>• You will receive a confirmation email shortly.</p>
          <p className="sm:hidden">• Arrive 5-10 minutes early.</p>
          <p className="hidden sm:block">• Please arrive 5-10 minutes before your appointment time.</p>
          {booking.payment?.depositAmount ? (
            <p className="hidden sm:block">• The remaining amount of AED {booking.payment.remainingAmount.toFixed(2)} will be paid directly to the service provider.</p>
          ) : null}
          <p className="sm:hidden">• For changes, contact us 48+ hours in advance.</p>
          <p className="hidden sm:block">• For changes or cancellations, contact us at least 24 hours in advance.</p>
        </div>
      </div>

      {/* Action Buttons - Stacked on mobile */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => window.print()}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors order-2 sm:order-1"
        >
          <span className="hidden sm:inline">Print Confirmation</span>
          <span className="sm:hidden">Print</span>
        </button>
        <button
          onClick={handleBookAgain}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors order-1 sm:order-2"
        >
          <span className="hidden sm:inline">Book Another Appointment</span>
          <span className="sm:hidden">Book Again</span>
        </button>
      </div>

      {/* Cancel Modal */}
      <CancelModal />
    </div>
  )
}