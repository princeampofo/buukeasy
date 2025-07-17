'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Clock, DollarSign, User, MapPin, Star } from 'lucide-react'

interface Service {
  id: number
  name: string
  duration: number
  price: number
  homeServicePrice: number
  description: string
  category: string
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
  services: Service[]
}

export default function ServiceSelectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedServiceLocation, setSelectedServiceLocation] = useState<'in-store' | 'home'>('in-store')

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load business data')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchBusinessData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !businessData) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Business Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The requested business could not be found.'}</p>
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    )
  }

  const categories = ['All', ...Array.from(new Set(businessData.services.map(s => s.category)))]
  const filteredServices = selectedCategory === 'All' 
    ? businessData.services 
    : businessData.services.filter(s => s.category === selectedCategory)

  const handleServiceSelect = (serviceId: number) => {
    setSelectedService(serviceId)
  }

  return (
    <div className="space-y-6">
      {/* Business Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{businessData.name}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                <span className="font-medium">{businessData.rating}</span>
                <span className="ml-1">({businessData.reviews} reviews)</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{businessData.address}</span>
              </div>
            </div>
            <p className="text-gray-600">{businessData.description}</p>
          </div>
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <User className="h-10 w-10 text-white" />
          </div>
        </div>
      </div>

      {/* Service Selection */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Select a Service</h2>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceSelect(service.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedService === service.id
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                  {selectedService === service.id && service.availableLocations.includes('home') && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium mb-2">Service Location:</p>
                        <div className="space-y-2">
                        <label className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-white">
                            <div className="flex items-center">
                              <input
                              type="radio"
                              name="serviceLocation"
                              value="in-store"
                              checked={selectedServiceLocation === 'in-store'}
                              onChange={(e) => setSelectedServiceLocation(e.target.value as 'in-store' | 'home')}
                              className="mr-2"
                              />
                              <span className="text-sm">In-Store</span>
                            </div>
                            <span className="text-sm font-medium">${service.price}</span>
                        </label>
                        <label className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-white">
                            <div className="flex items-center">
                              <input
                              type="radio"
                              name="serviceLocation"
                              value="home"
                              checked={selectedServiceLocation === 'home'}
                              onChange={(e) => setSelectedServiceLocation(e.target.value as 'home')}
                              className="mr-2"
                              />
                              <span className="text-sm">Home Service</span>
                            </div>
                            <span className="text-sm font-medium">${service.homeServicePrice}</span>
                        </label>
                        </div>
                    </div>
                    )}
                  <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>
                        ${selectedService === service.id ? 
                          (selectedServiceLocation === 'home' ? service.homeServicePrice : service.price) : 
                          service.price}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedService === service.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {selectedService === service.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Button */}
      {selectedService && (
        <div className="flex justify-end">
          <Link
            href={`/book/${slug}/appointment?service=${selectedService}&location=${selectedServiceLocation}`}
            className="btn-primary px-8 py-3"
          >
            Continue to Date & Time
          </Link>
        </div>
      )}
    </div>
  )
}