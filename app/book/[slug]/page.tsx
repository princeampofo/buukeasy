'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, User, MapPin, Star, Phone, Mail } from 'lucide-react'
import Image from 'next/image'
import { useBookingStorage } from '@/hooks/useBookingStorage'

interface Service {
  id: string
  name: string
  duration: number
  price: number
  homeServicePrice: number
  homeServiceDeposit: number
  inStoreServiceDeposit: number
  description: string
  category: string
  imageUrl?: string
  availableLocations: ('in-store' | 'home')[]
}

interface BusinessData {
  id: string
  slug: string
  name: string
  rating: number
  reviews: number
  address: string
  phone: string
  email: string
  description: string
  ownerName: string
  profileImage?: string | null
  services: Service[]
}

export default function ServiceSelectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { 
    bookingData, 
    isLoaded, 
    setService, 
    setBusinessInfo, 
    updateBookingData,
    isServiceSelected 
  } = useBookingStorage()
  
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  
  // Get selected service and location from storage
  const selectedService = bookingData.serviceId || null
  const selectedServiceLocation = bookingData.serviceLocation || 'in-store'

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/book/${slug}`)
        
        if (!response.ok) {
          throw new Error('Business not found')
        }
        
        const data = await response.json()
        setBusinessData(data)
        
        // Set business info in storage only if it's different
        if (bookingData.entrepreneurId !== data.id) {
          setBusinessInfo({
            entrepreneurId: data.id,
            businessSlug: data.slug,
            businessName: data.name,
            businessTimezone: data.timezone || 'Asia/Dubai' // Default to GST
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load business data')
      } finally {
        setLoading(false)
      }
    }

    if (slug && isLoaded) {
      fetchBusinessData()
    }
  }, [slug, isLoaded])

  const handleServiceSelect = (serviceId: string) => {
    const service = businessData?.services.find(s => s.id === serviceId)
    if (service) {
      const location = service.availableLocations.length > 0 ? service.availableLocations[0] : 'in-store'

      setService({
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        duration: service.duration,
        serviceAmount: location === 'home' ? service.homeServicePrice : service.price,
        serviceLocation: location
      })
    }
  }

  const handleLocationToggle = (serviceId: string, newLocation: 'in-store' | 'home') => {
    const service = businessData?.services.find(s => s.id === serviceId)
    if (service) {

      setService({
        serviceId: service.id,
        serviceName: service.name,
        serviceCategory: service.category,
        duration: service.duration,
        serviceAmount: newLocation === 'home' ? service.homeServicePrice : service.price,
        serviceLocation: newLocation
      })
    }
  }

  // Don't render until data is loaded to prevent hydration issues
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  if (error || !businessData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-8 text-center mx-2 sm:mx-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The requested business could not be found.'}</p>
        <button 
          onClick={() => router.push('/')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(businessData.services.map(s => s.category)))]
  const filteredServices = selectedCategory === 'All' 
    ? businessData.services 
    : businessData.services.filter(s => s.category === selectedCategory)

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-2 sm:px-0">
      {/* Business Header */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold mb-2 text-white truncate">{businessData.name}</h1>
              {/* Hide description on mobile */}
              <p className="hidden sm:block text-blue-100 mb-4 leading-relaxed">{businessData.description}</p>
              
              <div className="flex flex-col gap-2 sm:gap-3 text-sm">
                {/* Rating - always show */}
                <div className="flex items-center bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm w-fit">
                  <Star className="h-4 w-4 text-yellow-300 fill-current mr-1" />
                  <span className="font-medium text-white">{businessData.rating}</span>
                  <span className="ml-1 text-blue-100">({businessData.reviews})</span>
                </div>
                
                {/* Address - truncate on mobile */}
                <div className="flex items-start text-blue-100 text-xs sm:text-sm">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2 sm:line-clamp-none">{businessData.address}</span>
                </div>
              </div>
            </div>
            
            {/* Profile image - smaller on mobile */}
            {businessData.profileImage && businessData.profileImage !== 'null' && (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-white/30 flex-shrink-0">
                <Image
                  src={businessData.profileImage}
                  alt={businessData.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact info - show condensed version */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{businessData.ownerName}</span>
            </div>
            
            {businessData.phone && (
              <div className="flex items-center">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span>{businessData.phone}</span>
              </div>
            )}
            
            <div className="flex items-center">
              <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="truncate">{businessData.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Select a Service</h2>
        
        {/* Category Filter - horizontal scroll on mobile */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services List */}
        <div className="space-y-3">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service.id)}
              className={`relative rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                selectedService === service.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 sm:mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {service.category}
                          </span>
                          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            {service.duration}m
                          </div>
                        </div>
                      </div>
                      
                      {/* Price Display - more compact on mobile */}
                      <div className="text-right ml-3">
                        <div className="text-lg sm:text-xl font-bold text-gray-900">
                          AED {selectedService === service.id 
                            ? (selectedServiceLocation === 'home' ? service.homeServicePrice : service.price).toFixed(2)
                            : (service.price).toFixed(2)
                          }
                        </div>
                      </div>
                    </div>
                    
                    {/* Location Toggle - more compact on mobile */}
                    {selectedService === service.id && service.availableLocations.length > 1 && (
                      <div 
                        className="flex items-center justify-between"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-700">Location:</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs sm:text-sm ${selectedServiceLocation === 'in-store' ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                              In-Store
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newLocation = selectedServiceLocation === 'in-store' ? 'home' : 'in-store';
                                handleLocationToggle(service.id, newLocation);
                              }}
                              className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-blue-100 ${
                                selectedServiceLocation === 'home' ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                  selectedServiceLocation === 'home' ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className={`text-xs sm:text-sm ${selectedServiceLocation === 'home' ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                              Home
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Single Location Display */}
                    {selectedService === service.id && service.availableLocations.length === 1 && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {service.availableLocations[0] === 'in-store' ? 'In-Store Service' : 'Home Service Available'}
                      </div>
                    )}
                  </div>
                  
                  {/* Selection Indicator */}
                  <div className="ml-3 sm:ml-4 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedService === service.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedService === service.id && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No services found in this category.</p>
          </div>
        )}
      </div>

      {/* Continue Button - fixed on mobile */}
      {isServiceSelected() && (
        <div className="fixed bottom-0 left-0 right-0 sm:static bg-white sm:bg-transparent border-t sm:border-none p-3 sm:p-0 shadow-lg sm:shadow-none z-10">
          <button
            onClick={() => router.push(`/book/${slug}/availability`)}
            className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            Continue to Date & Time
          </button>
        </div>
      )}
      
      {/* Add bottom padding when continue button is fixed on mobile */}
      {isServiceSelected() && (
        <div className="h-20 sm:hidden"></div>
      )}
    </div>
  )
}