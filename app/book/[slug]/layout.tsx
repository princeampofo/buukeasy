'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, ArrowLeft } from 'lucide-react'

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Determine current step based on pathname
  const getCurrentStep = () => {
    if (pathname.includes('/appointment')) return 2
    if (pathname.includes('/details')) return 3
    if (pathname.includes('/payment')) return 4
    if (pathname.includes('/confirmation')) return 5
    return 1 // Service selection (default)
  }

  const currentStep = getCurrentStep()

  const steps = [
    { number: 1, label: 'Service', path: '' },
    { number: 2, label: 'Date & Time', path: '/appointment' },
    { number: 3, label: 'Details', path: '/details' },
    { number: 4, label: 'Payment', path: '/payment' },
  ]

  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed'
    if (stepNumber === currentStep) return 'current'
    return 'upcoming'
  }

  const getStepClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    
    switch (status) {
      case 'completed':
        return 'w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium'
      case 'current':
        return 'w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium'
      default:
        return 'w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium'
    }
  }

  const getStepLabelClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    
    switch (status) {
      case 'completed':
        return 'ml-2 text-sm font-medium text-green-700'
      case 'current':
        return 'ml-2 text-sm font-medium text-blue-700'
      default:
        return 'ml-2 text-sm font-medium text-gray-500'
    }
  }

  const getConnectorClasses = (stepNumber: number) => {
    const status = getStepStatus(stepNumber)
    return status === 'completed' 
      ? 'w-12 h-0.5 bg-green-600' 
      : 'w-12 h-0.5 bg-gray-200'
  }

  // Don't show progress indicator on confirmation page
  const showProgress = !pathname.includes('/confirmation')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link> */}
            
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BookEasy</span>
            </div>
            
            <div className="w-20"></div> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      {/* Progress Indicator - Hide on confirmation page */}
      {showProgress && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex items-center">
                    <div className={getStepClasses(step.number)}>
                      {getStepStatus(step.number) === 'completed' ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className={getStepLabelClasses(step.number)}>{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={getConnectorClasses(step.number + 1)}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}