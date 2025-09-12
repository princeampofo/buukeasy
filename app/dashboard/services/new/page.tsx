'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import {
  Save,
  ArrowLeft,
  Clock,
  AlertCircle,
  Upload,
  X,
  Home,
  Store,
  Calendar
} from 'lucide-react'

interface ServiceFormData {
  name: string
  description: string
  category: string
  duration: number
  specialInstructions: string
  image: File | null
  offersHomeService: boolean
  offersInStoreService: boolean
  homeServicePrice: number
  homeServiceBufferTime: number
  inStoreServicePrice: number
  inStoreServiceBufferTime: number
  minAdvanceHours: number
  maxAdvanceDays: number
}

const categories = [
  'HAIR_SERVICES',
  'NAIL_CARE',
  'SKIN_CARE',
  'BEAUTY_TREATMENT',
  'MASSAGE',
  'OTHER'
]

// Function to format category for display
const formatCategory = (category: string) => {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

// Helper function to format AED currency
const formatAED = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export default function NewServicePage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  // const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: categories[0],
    duration: 60,
    specialInstructions: '',
    image: null,
    offersHomeService: false,
    offersInStoreService: false,
    homeServicePrice: 0,
    homeServiceBufferTime: 0,
    inStoreServicePrice: 0,
    inStoreServiceBufferTime: 0,
    minAdvanceHours: 48,
    maxAdvanceDays: 30
  })

  const handleInputChange = (field: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'Duration must be greater than 0'
    }

    if (formData.minAdvanceHours <= 0) {
      newErrors.minAdvanceHours = 'Minimum advance hours must be greater than 0'
    }

    if (formData.maxAdvanceDays <= 0) {
      newErrors.maxAdvanceDays = 'Maximum advance days must be greater than 0'
    }

    if (!formData.offersHomeService && !formData.offersInStoreService) {
      newErrors.serviceType = 'Please select at least one service location option'
    }

    if (formData.offersHomeService && formData.homeServicePrice <= 0) {
      newErrors.homeServicePrice = 'Home service price must be greater than 0'
    }

    if (formData.offersInStoreService && formData.inStoreServicePrice <= 0) {
      newErrors.inStoreServicePrice = 'In-store service price must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!user) {
      setErrors({ submit: 'You must be logged in to create a service' })
      return
    }

    setIsLoading(true)

    try {
      const submitData = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          // Skip image for now
          // submitData.append(key, value)
        } else if (key !== 'image') {
          submitData.append(key, String(value))
        }
      })

      // Set deposits to 0 as they're no longer configurable
      submitData.append('homeServiceDeposit', '0')
      submitData.append('inStoreServiceDeposit', '0')

      const response = await fetch('/api/dashboard/services', {
        method: 'POST',
        body: submitData
      })

      if (response.ok) {
        router.push('/dashboard/services')
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || 'Failed to create service' })
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/services"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Back to Services
            </Link>
          </div>
          <h2 className="mt-4 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Add New Service
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Create a new service for your business (prices in UAE Dirhams)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Basic Information
              </h3>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    placeholder="e.g., Hair Cut & Style"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{formatCategory(category)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  placeholder="Brief description of your service..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service Duration & Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Service Duration & Settings
              </h3>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Service Duration (minutes) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      step="1"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    />
                  </div>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">How long the actual service takes</p>
                </div>

                <div>
                  <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    id="specialInstructions"
                    rows={3}
                    value={formData.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any special instructions for clients..."
                    style={{ resize: 'none' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minAdvanceHours" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Hours in Advance *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="minAdvanceHours"
                      min="1"
                      step="1"
                      value={formData.minAdvanceHours}
                      onChange={(e) => handleInputChange('minAdvanceHours', parseInt(e.target.value) || 0)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.minAdvanceHours ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Minimum notice required for bookings</p>
                  {errors.minAdvanceHours && (
                    <p className="mt-1 text-sm text-red-600">{errors.minAdvanceHours}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="maxAdvanceDays" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Days in Advance *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="maxAdvanceDays"
                      min="1"
                      step="1"
                      value={formData.maxAdvanceDays}
                      onChange={(e) => handleInputChange('maxAdvanceDays', parseInt(e.target.value) || 0)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.maxAdvanceDays ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">How far ahead clients can book</p>
                  {errors.maxAdvanceDays && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxAdvanceDays}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Location & Pricing */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Service Location & Pricing
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select where you offer this service and set pricing.
              </p>
            </div>
            <div className="px-6 py-4 space-y-6">
              {/* Service Location Options */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Where do you offer this service? *
                </div>
                
                {errors.serviceType && (
                  <p className="text-sm text-red-600">{errors.serviceType}</p>
                )}

                {/* Home Service Option */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="offersHomeService"
                      checked={formData.offersHomeService}
                      onChange={(e) => handleInputChange('offersHomeService', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="offersHomeService" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                      <Home className="h-4 w-4 mr-2 text-gray-400" />
                      Home Service
                    </label>
                  </div>

                  {formData.offersHomeService && (
                    <div className="ml-7 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="homeServicePrice" className="block text-sm font-medium text-gray-700 mb-2">
                            Home Service Price (AED) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 text-sm">AED</span>
                            <input
                              type="number"
                              id="homeServicePrice"
                              min="0"
                              step="0.01"
                              value={formData.homeServicePrice}
                              onChange={(e) => handleInputChange('homeServicePrice', parseFloat(e.target.value) || 0)}
                              className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.homeServicePrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                              placeholder="0.00"
                            />
                          </div>
                          {errors.homeServicePrice && (
                            <p className="mt-1 text-sm text-red-600">{errors.homeServicePrice}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="homeServiceBufferTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Buffer Time (minutes)
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              id="homeServiceBufferTime"
                              min="0"
                              step="1"
                              value={formData.homeServiceBufferTime}
                              onChange={(e) => handleInputChange('homeServiceBufferTime', parseInt(e.target.value) || 0)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Extra time between home service appointments (for travel, setup, etc.)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* In-Store Service Option */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="offersInStoreService"
                      checked={formData.offersInStoreService}
                      onChange={(e) => handleInputChange('offersInStoreService', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="offersInStoreService" className="ml-3 flex items-center text-sm font-medium text-gray-700">
                      <Store className="h-4 w-4 mr-2 text-gray-400" />
                      In-Store Service
                    </label>
                  </div>

                  {formData.offersInStoreService && (
                    <div className="ml-7 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="inStoreServicePrice" className="block text-sm font-medium text-gray-700 mb-2">
                            In-Store Service Price (AED) *
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 text-sm">AED</span>
                            <input
                              type="number"
                              id="inStoreServicePrice"
                              min="0"
                              step="0.01"
                              value={formData.inStoreServicePrice}
                              onChange={(e) => handleInputChange('inStoreServicePrice', parseFloat(e.target.value) || 0)}
                              className={`block w-full pl-12 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.inStoreServicePrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                              placeholder="0.00"
                            />
                          </div>
                          {errors.inStoreServicePrice && (
                            <p className="mt-1 text-sm text-red-600">{errors.inStoreServicePrice}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="inStoreServiceBufferTime" className="block text-sm font-medium text-gray-700 mb-2">
                            Buffer Time (minutes)
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                              type="number"
                              id="inStoreServiceBufferTime"
                              min="0"
                              step="1"
                              value={formData.inStoreServiceBufferTime}
                              onChange={(e) => handleInputChange('inStoreServiceBufferTime', parseInt(e.target.value) || 0)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <p className="mt-1 text-xs text-gray-500">Extra time between in-store appointments (for cleanup, preparation, etc.)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/services"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </Link>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Create Service
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}