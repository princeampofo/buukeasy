'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Save, 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Tag, 
  FileText,
  AlertCircle,
  CheckCircle,
  Upload,
  X,
  Trash2,
  Eye
} from 'lucide-react'

interface ServiceFormData {
  name: string
  description: string
  category: string
  duration: number
  price: number
  requiresDeposit: boolean
  depositAmount: number
  maxAdvanceBooking: number
  minAdvanceBooking: number
  bufferTime: number
  instructions: string
  image: File | null
  existingImageUrl?: string
}

const categories = [
  'Hair Services',
  'Grooming',
  'Skin Care',
  'Massage',
  'Consultation',
  'Wellness',
  'Beauty',
  'Other'
]

export default function EditServicePage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id as string
  
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    category: categories[0],
    duration: 60,
    price: 0,
    requiresDeposit: false,
    depositAmount: 0,
    maxAdvanceBooking: 30,
    minAdvanceBooking: 1,
    bufferTime: 0,
    instructions: '',
    image: null,
    existingImageUrl: ''
  })

  // Load service data on component mount
  useEffect(() => {
    const loadServiceData = async () => {
      try {
        setIsLoadingData(true)
        const response = await fetch(`/api/dashboard/services/${serviceId}`)
        if (!response.ok) throw new Error('Failed to load service')
        
        const service = await response.json()
        
        setFormData({
          name: service.name,
          description: service.description,
          category: service.category,
          duration: service.duration,
          price: service.price,
          requiresDeposit: service.requiresDeposit,
          depositAmount: service.depositAmount,
          maxAdvanceBooking: service.maxAdvanceBooking,
          minAdvanceBooking: service.minAdvanceBooking,
          bufferTime: service.bufferTime,
          instructions: service.instructions,
          image: null,
          existingImageUrl: service.imageUrl
        })
        
        if (service.imageUrl) {
          setImagePreview(service.imageUrl)
        }
      } catch (error) {
        setErrors({ load: 'Failed to load service data' })
      } finally {
        setIsLoadingData(false)
      }
    }

    loadServiceData()
  }, [serviceId])

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }))
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      handleInputChange('image', file)
      handleInputChange('existingImageUrl', '') // Clear existing image URL when uploading new one
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    handleInputChange('image', null)
    handleInputChange('existingImageUrl', '')
    // Reset file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
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

    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative'
    }

    if (formData.requiresDeposit && formData.depositAmount <= 0) {
      newErrors.depositAmount = 'Deposit amount must be greater than 0'
    }

    if (formData.requiresDeposit && formData.depositAmount > formData.price) {
      newErrors.depositAmount = 'Deposit cannot be more than service price'
    }

    if (formData.maxAdvanceBooking <= formData.minAdvanceBooking) {
      newErrors.maxAdvanceBooking = 'Max advance booking must be greater than min advance booking'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          submitData.append(key, value)
        } else if (key !== 'image') {
          submitData.append(key, String(value))
        }
      })

      const response = await fetch(`/api/dashboard/services/${serviceId}`, {
        method: 'PUT',
        body: submitData
      })

      if (response.ok) {
        router.push('/dashboard/services')
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || 'Failed to update service' })
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
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
          <div className="flex items-center justify-between">
            <div>
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
                Edit Service
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your service details and settings
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-3">
              <Link
                href={`/book/your-business?service=${serviceId}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link>
            </div>
          </div>
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

          {errors.load && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errors.load}</p>
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
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
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
                      <option key={category} value={category}>{category}</option>
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
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Describe your service..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Service Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Service preview"
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pricing & Duration
              </h3>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="duration"
                      min="1"
                      step="5"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.duration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      id="price"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.price ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">Set to 0 for free services</p>
                </div>

                <div>
                  <label htmlFor="bufferTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Buffer Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="bufferTime"
                    min="0"
                    step="5"
                    value={formData.bufferTime}
                    onChange={(e) => handleInputChange('bufferTime', parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Time between appointments</p>
                </div>
              </div>

              {/* Deposit Settings */}
              <div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="requiresDeposit"
                    checked={formData.requiresDeposit}
                    onChange={(e) => handleInputChange('requiresDeposit', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requiresDeposit" className="ml-2 block text-sm text-gray-700">
                    Require deposit for booking
                  </label>
                </div>

                {formData.requiresDeposit && (
                  <div className="ml-6">
                    <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit Amount ($)
                    </label>
                    <div className="max-w-xs">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                          type="number"
                          id="depositAmount"
                          min="0"
                          step="0.01"
                          value={formData.depositAmount}
                          onChange={(e) => handleInputChange('depositAmount', parseFloat(e.target.value) || 0)}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.depositAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.depositAmount && (
                        <p className="mt-1 text-sm text-red-600">{errors.depositAmount}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Settings */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Booking Settings
              </h3>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="minAdvanceBooking" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Advance Booking (hours)
                  </label>
                  <input
                    type="number"
                    id="minAdvanceBooking"
                    min="0"
                    value={formData.minAdvanceBooking}
                    onChange={(e) => handleInputChange('minAdvanceBooking', parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">How far in advance clients must book</p>
                </div>

                <div>
                  <label htmlFor="maxAdvanceBooking" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Advance Booking (days)
                  </label>
                  <input
                    type="number"
                    id="maxAdvanceBooking"
                    min="1"
                    value={formData.maxAdvanceBooking}
                    onChange={(e) => handleInputChange('maxAdvanceBooking', parseInt(e.target.value) || 1)}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maxAdvanceBooking ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxAdvanceBooking && (
                    <p className="mt-1 text-sm text-red-600">{errors.maxAdvanceBooking}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">How far in advance clients can book</p>
                </div>
              </div>

              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  id="instructions"
                  rows={3}
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special instructions for clients (preparation, what to bring, etc.)"
                />
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}