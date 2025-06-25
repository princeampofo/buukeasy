'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Clock, DollarSign, User, MapPin, Star } from 'lucide-react'

// Mock data - in real app, fetch based on slug
const businessData = {
  name: "Elite Wellness Spa",
  rating: 4.9,
  reviews: 127,
  address: "123 Main St, City, State",
  description: "Premium wellness and beauty services in a relaxing environment",
  services: [
    {
      id: 1,
      name: "Deep Tissue Massage",
      duration: 60,
      price: 120,
      homeServicePrice: 150,
      description: "Therapeutic massage targeting deep muscle tension and knots",
      category: "Massage Therapy",
      availableLocations: ['in-store', 'home']
    },
    {
      id: 2,
      name: "Swedish Massage",
      duration: 60,
      price: 100,
      homeServicePrice: 130,
      description: "Relaxing full-body massage with gentle pressure",
      category: "Massage Therapy",
      availableLocations: ['in-store', 'home']
    },
    {
      id: 3,
      name: "Facial Treatment",
      duration: 45,
      price: 85,
      homeServicePrice: 110,
      description: "Customized facial treatment for all skin types",
      category: "Skincare",
      availableLocations: ['in-store', 'home']
    },
    {
      id: 4,
      name: "Hot Stone Massage",
      duration: 90,
      price: 150,
      homeServicePrice: 180,
      description: "Relaxing massage using heated volcanic stones",
      category: "Massage Therapy",
      availableLocations: ['in-store', 'home']
    },
    {
      id: 5,
      name: "Couples Massage",
      duration: 60,
      price: 220,
      homeServicePrice: 250,
      description: "Side-by-side massage experience for two",
      category: "Massage Therapy",
      availableLocations: ['in-store', 'home']
    }
  ]
}

export default function ServiceSelectionPage() {
  const { slug } = useParams<{ slug: string }>()
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedServiceLocation, setSelectedServiceLocation] = useState<'in-store' | 'home'>('in-store')

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
                        <div className="flex gap-2">
                        <label className="flex items-center">
                            <input
                            type="radio"
                            name="serviceLocation"
                            value="in-store"
                            checked={selectedServiceLocation === 'in-store'}
                            onChange={(e) => setSelectedServiceLocation(e.target.value as 'in-store' | 'home')}
                            className="mr-2"
                            />
                            <span className="text-sm">In-Store (${service.price})</span>
                        </label>
                        <label className="flex items-center">
                            <input
                            type="radio"
                            name="serviceLocation"
                            value="home"
                            checked={selectedServiceLocation === 'home'}
                            onChange={(e) => setSelectedServiceLocation(e.target.value as 'home')}
                            className="mr-2"
                            />
                            <span className="text-sm">Home Service (${service.homeServicePrice})</span>
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
                      <span>${service.price}</span>
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