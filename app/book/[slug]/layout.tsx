'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { Zap } from 'lucide-react'
import { useState, useEffect } from 'react'
import { BookingStatusProvider, useBookingStatus } from '@/contexts/BookingStatusContext'

// Separate component for the actual layout logic
function BookingLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { bookingStatus, setBookingStatus } = useBookingStatus()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch booking status if we're on the status page
  useEffect(() => {
    if (isClient && pathname.includes('/status')) {
      const bookingSlug = searchParams.get('booking')
      if (bookingSlug) {
        fetchBookingStatus(bookingSlug)
      }
    }
  }, [pathname, searchParams, isClient])

  const fetchBookingStatus = async (bookingSlug: string) => {
    try {
      const slug = pathname.split('/')[2] // Extract slug from pathname
      const response = await fetch(`/api/book/${slug}/payment?booking=${bookingSlug}`)
      if (response.ok) {
        const result = await response.json()
        setBookingStatus(result.booking.status)
      }
    } catch (error) {
      // Silently fail - status will remain null
    }
  }

  // Determine current step based on pathname
  const getCurrentStep = () => {
    if (pathname.includes('/availability')) return 2
    if (pathname.includes('/details')) return 3
    if (pathname.includes('/payment')) return 4
    if (pathname.includes('/status')) return 5 // Confirmation step
    return 1 // Service selection (default)
  }

  const currentStep = getCurrentStep()

  // Determine the label for step 5 based on booking status
  const getStep5Label = () => {
    if (bookingStatus === 'CANCELLED') return 'Cancelled'
    return 'Confirmation'
  }

  const steps = [
    { number: 1, label: 'Service', path: '' },
    { number: 2, label: 'Date & Time', path: '/availability' },
    { number: 3, label: 'Details', path: '/details' },
    { number: 4, label: 'Payment', path: '/payment' },
    { number: 5, label: getStep5Label(), path: '/status' },
  ]

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'upcoming'
  }

  const getStepClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    
    // Special styling for cancelled bookings
    if (stepNumber === 5 && bookingStatus === 'CANCELLED') {
      return 'w-6 h-6 sm:w-8 sm:h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium'
    }
    
    switch (status) {
      case 'completed':
        return 'w-6 h-6 sm:w-8 sm:h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium'
      case 'current':
        return 'w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-medium'
      default:
        return 'w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium'
    }
  }

  const getStepLabelClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    
    // Special styling for cancelled bookings
    if (stepNumber === 5 && bookingStatus === 'CANCELLED') {
      return 'ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-red-700'
    }
    
    switch (status) {
      case 'completed':
        return 'ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-green-700'
      case 'current':
        return 'ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-blue-700'
      default:
        return 'ml-1 sm:ml-2 text-xs sm:text-sm font-medium text-gray-500'
    }
  }

  const getConnectorClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    return status === 'completed' 
      ? 'w-4 sm:w-8 lg:w-12 h-0.5 bg-green-600' 
      : 'w-4 sm:w-8 lg:w-12 h-0.5 bg-gray-200'
  }

  const getStepIcon = (step: any) => {
    if (step.number === 5 && bookingStatus === 'CANCELLED') {
      // X icon for cancelled bookings
      return (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )
    }
    
    if (getStepStatus(step.number) === 'completed') {
      // Checkmark for completed steps
      return (
        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
    
    // Step number for current/upcoming steps
    return step.number
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">            
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-blue-800" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">BuukEasy</span>
            </div>
            
            <div className="w-16 sm:w-20"></div> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-center space-x-1 sm:space-x-2 lg:space-x-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div className={getStepClasses(step.number)}>
                    {getStepIcon(step)}
                  </div>
                  <span className={`${getStepLabelClasses(step.number)} hidden xs:inline sm:inline`}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={getConnectorClasses(step.number + 1)}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  )
}

// Main layout component that provides the context
export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BookingStatusProvider>
      <BookingLayoutContent>
        {children}
      </BookingLayoutContent>
    </BookingStatusProvider>
  )
}
