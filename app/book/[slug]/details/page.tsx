'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { User, Mail, Phone, MessageSquare, MapPin } from 'lucide-react'

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

interface ServiceData {
  id: number
  name: string
  duration: number
  price: number
  homeServicePrice: number
  description: string
  category: string
}

interface BusinessData {
  name: string
  services: ServiceData[]
}

export default function DetailsPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const serviceLocation = searchParams.get('location') || 'in-store'

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
  const [serviceData, setServiceData] = useState<ServiceData | null>(null)
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch business and service data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch business data
        const businessResponse = await fetch(`/api/book/${slug}`)
        if (businessResponse.ok) {
          const business = await businessResponse.json()
          setBusinessData(business)
          
          // Find the specific service
          if (serviceId) {
            const service = business.services.find((s: ServiceData) => s.id === parseInt(serviceId))
            setServiceData(service || null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (slug && serviceId) {
      fetchData()
    }
  }, [slug, serviceId])

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
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Validate service address for home services
    if (serviceLocation === 'home' && !formData.serviceAddress.trim()) {
      newErrors.serviceAddress = 'Service address is required for home services'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isFormValid = formData.firstName.trim() !== '' && 
    formData.lastName.trim() !== '' && 
    /\S+@\S+\.\S+/.test(formData.email) && 
    /^\+?[\d\s\-\(\)]+$/.test(formData.phone) && 
    (serviceLocation !== 'home' || formData.serviceAddress.trim() !== '')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!serviceData || !businessData) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-600 mb-4">The requested service could not be found.</p>
        <Link href={`/book/${slug}`} className="btn-primary">
          Back to Services
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Appointment Summary */}
      <div className="card bg-blue-50 border-blue-200">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">Appointment Summary</h2>
        <div className="grid md:grid-cols-2 gap-4 text-blue-800">
          <div>
            <p><strong>Service:</strong> {serviceData.name}</p>
            <p><strong>Duration:</strong> {serviceData.duration} minutes</p>
            <p><strong>Location:</strong> {serviceLocation === 'home' ? 'Home Service' : 'In-Store'}</p>
          </div>
          <div>
            <p><strong>Date:</strong> {date && formatDate(date)}</p>
            <p><strong>Time:</strong> {time}</p>
            <p><strong>Price:</strong> ${serviceLocation === 'home' ? serviceData.homeServicePrice : serviceData.price}</p>
          </div>
        </div>
      </div>

      {/* Client Information Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Your Information</h2>
        
        <form className="space-y-6">
          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <User className="h-4 w-4 inline mr-1" />
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Mail className="h-4 w-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="form-label">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {serviceLocation === 'home' && (
            <div>
              <label className="form-label">
                <MapPin className="h-4 w-4 inline mr-1" />
                Service Address *
              </label>
              <input
                type="text"
                name="serviceAddress"
                value={formData.serviceAddress}
                onChange={handleInputChange}
                className={`input-field ${errors.serviceAddress ? 'border-red-500' : ''}`}
                placeholder="Enter your full address"
              />
              {errors.serviceAddress && (
                <p className="text-red-500 text-sm mt-1">{errors.serviceAddress}</p>
              )}
              <textarea
                name="addressNotes"
                value={formData.addressNotes}
                onChange={handleInputChange}
                rows={2}
                className="input-field mt-2"
                placeholder="Additional directions or notes (optional)"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="form-label">
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Special Requests or Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="input-field"
              placeholder="Any special requests, health conditions, or preferences we should know about?"
            />
          </div>

          {/* Notification Preferences */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">Send appointment reminders via email</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="smsNotifications"
                  checked={formData.smsNotifications}
                  onChange={handleInputChange}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">Send appointment reminders via SMS</span>
              </label>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Cancellation Policy</h4>
            <p className="text-sm text-gray-600">
              Appointments can be cancelled or rescheduled up to 24 hours in advance. 
              Cancellations made less than 24 hours before the appointment time may be 
              subject to a cancellation fee.
            </p>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Link
          href={`/book/${slug}/appointment?service=${serviceId}&location=${serviceLocation}`}
          className="btn-secondary"
        >
          Back to Date & Time
        </Link>
        
        <Link
          href={`/book/${slug}/payment?service=${serviceId}&date=${date}&time=${time}&firstName=${formData.firstName}&lastName=${formData.lastName}&email=${formData.email}&phone=${formData.phone}&location=${serviceLocation}&address=${encodeURIComponent(formData.serviceAddress || '')}`}
          className={`btn-primary ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={(e) => {
            if (!validateForm()) {
              e.preventDefault()
            }
          }}
        >
          Continue to Payment
        </Link>
      </div>
    </div>
  )
}