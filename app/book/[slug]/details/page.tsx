'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Mail, Phone, MessageSquare, MapPin, ArrowLeft } from 'lucide-react'
import { useBookingStorage } from '@/hooks/useBookingStorage'
import { DateTime } from 'luxon'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  emailNotifications: boolean
  smsNotifications: boolean
  serviceAddress: string
  addressNotes: string
}

export default function DetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { 
    bookingData, 
    isLoaded, 
    setCustomerDetails, 
    updateBookingData, 
    isServiceSelected,
    isAppointmentSelected,
    canProceedToStep 
  } = useBookingStorage()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    emailNotifications: true,
    smsNotifications: true,
    serviceAddress: '',
    addressNotes: ''
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Load existing customer data if available
  useEffect(() => {
    if (isLoaded && bookingData.customerEmail) {
      setFormData(prev => ({
        ...prev,
        firstName: bookingData.customerFirstName || '',
        lastName: bookingData.customerLastName || '',
        email: bookingData.customerEmail || '',
        phone: bookingData.customerPhone ? bookingData.customerPhone.replace('+971', '') : '', // Remove country code for display
        notes: bookingData.specialRequests || '',
        serviceAddress: bookingData.serviceAddress || '',
        addressNotes: bookingData.addressNotes || '',
      }))
    }
  }, [isLoaded, bookingData])

  // Redirect if previous steps not completed
  useEffect(() => {
    if (isLoaded) {
      if (!isServiceSelected()) {
        router.push(`/book/${slug}`)
      } else if (!isAppointmentSelected()) {
        router.push(`/book/${slug}/availability`)
      }
    }
  }, [isLoaded, isServiceSelected, isAppointmentSelected, router, slug])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[0-9\s\-]{8,12}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid UAE phone number (e.g., 50 123 4567)'
    }

    // Validate service address for home services
    if (bookingData.serviceLocation === 'home' && !formData.serviceAddress.trim()) {
      newErrors.serviceAddress = 'Service address is required for home services'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatDate = (date: string) => {
    // Parse ISO date string in business timezone
    const dateTime = DateTime.fromISO(date, { zone: bookingData.businessTimezone || 'Asia/Dubai' })
    return dateTime.toFormat('cccc, LLLL d, y') // e.g., "Monday, January 15, 2024"
  }

  const handleContinue = () => {
    if (validateForm()) {
      // Save customer details to booking storage
      const customerDetails: any = {
        customerFirstName: formData.firstName.trim(),
        customerLastName: formData.lastName.trim(),
        customerEmail: formData.email.trim(),
        customerPhone: `+971${formData.phone.trim().replace(/\s/g, '')}`, // Store with country code
        specialRequests: formData.notes.trim() || ''
      }

      // Add service address for home services
      if (bookingData.serviceLocation === 'home') {
        customerDetails.serviceAddress = formData.serviceAddress.trim() || ''
        if (formData.addressNotes.trim()) {
          customerDetails.addressNotes = formData.addressNotes.trim() || ''
        }
      }

      if (bookingData.serviceLocation === 'in-store') {
        customerDetails.serviceAddress = ''
        customerDetails.addressNotes = ''
      }

      // Save customer details
      setCustomerDetails(customerDetails)

      // Navigate to payment
      router.push(`/book/${slug}/payment`)
    } else {
      console.log('Form validation failed:', errors)
    }
  }

  const isFormValid = formData.firstName.trim() !== '' && 
    formData.lastName.trim() !== '' && 
    /\S+@\S+\.\S+/.test(formData.email) && 
    /^[0-9\s\-]{8,12}$/.test(formData.phone.trim()) && 
    (bookingData.serviceLocation !== 'home' || formData.serviceAddress.trim() !== '')

  // Don't render until data is loaded
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  // Don't render if previous steps not completed
  if (!canProceedToStep(3)) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-3 sm:px-6">
      {/* Back Button and Header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <button
          onClick={() => router.push(`/book/${slug}/availability`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Information</h1>
      </div>

      {/* Appointment Summary - Simplified on mobile */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-900">Appointment Summary</h2>
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 text-blue-800 text-sm sm:text-base">
          <div className="space-y-1 sm:space-y-2">
            <p><strong>Service:</strong> {bookingData.serviceName}</p>
            <p className="sm:hidden"><strong>Date:</strong> {bookingData.appointmentDate && formatDate(bookingData.appointmentDate)}</p>
            <p className="sm:hidden"><strong>Time:</strong> {bookingData.appointmentTime}</p>
            <p><strong>Duration:</strong> {bookingData.duration} minutes</p>
            <p><strong>Location:</strong> {bookingData.serviceLocation === 'home' ? 'Home Service' : 'In-Store'}</p>
          </div>
          <div className="hidden sm:block space-y-2">
            <p><strong>Date:</strong> {bookingData.appointmentDate && formatDate(bookingData.appointmentDate)}</p>
            <p><strong>Time:</strong> {bookingData.appointmentTime}</p>
            <p><strong>Price:</strong> AED {bookingData.serviceAmount}</p>
          </div>
          <div className="sm:hidden">
            <p><strong>Price:</strong> AED {bookingData.serviceAmount}</p>
          </div>
        </div>
      </div>

      {/* Client Information Form */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900">Contact Information</h2>
        
        <form className="space-y-4 sm:space-y-6">
          {/* Name Fields */}
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                Phone Number *
              </label>
              <div className="flex">
                <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-lg bg-gray-50 text-gray-700 text-sm sm:text-base">
                  +971
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`flex-1 px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50 123 4567"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Service Address for Home Services */}
          {bookingData.serviceLocation === 'home' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
                Service Address *
              </label>
              <input
                type="text"
                name="serviceAddress"
                value={formData.serviceAddress}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                  errors.serviceAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full address"
              />
              {errors.serviceAddress && (
                <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.serviceAddress}</p>
              )}
              <textarea
                name="addressNotes"
                value={formData.addressNotes}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-2 text-sm sm:text-base"
                placeholder="Additional directions or notes (optional)"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
              Special Requests or Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="Any special requests, health conditions, or preferences we should know about?"
            />
          </div>

          {/* Notification Preferences - Simplified on mobile */}
          <div className="border-t pt-4 sm:pt-6">
            <h3 className="font-semibold mb-3 sm:mb-4 text-gray-900 text-sm sm:text-base">Notification Preferences</h3>
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                  className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-xs sm:text-sm text-gray-700">Send appointment reminders via email</span>
              </label>
              
              {/* <label className="flex items-center">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={handleInputChange}
                  className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-xs sm:text-sm text-gray-700">Send appointment reminders via SMS</span>
              </label> */}
            </div>
          </div>

          {/* Terms and Conditions - Simplified on mobile */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-gray-900 text-sm sm:text-base">Cancellation Policy</h4>
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="sm:hidden">Appointments can be cancelled or rescheduled up to 48 hours in advance. Cancellations made less than 48 hours before may be subject to a cancellation fee.</span>
              <span className="hidden sm:inline">Appointments can be cancelled or rescheduled up to 48 hours in advance. Cancellations made less than 48 hours before the appointment time may be subject to a cancellation fee.</span>
            </p>
          </div>
        </form>
      </div>

      {/* Continue Button - Sticky on mobile */}
      <div className="sticky bottom-0 sm:static bg-white sm:bg-transparent p-4 sm:p-0 rounded-t-xl sm:rounded-none shadow-lg sm:shadow-none border-t sm:border-none -mx-3 sm:mx-0">
        <button
          onClick={handleContinue}
          disabled={!isFormValid}
          className={`w-full flex items-center justify-center px-6 py-3 font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl text-sm sm:text-base ${
            isFormValid
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  )
}