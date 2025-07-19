'use client'

import { useState, useEffect} from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  DollarSign,
  Users
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description: string | null
  duration: number
  price: number
  category: string
  bufferTime: number
  requireDeposit: boolean
  minAdvanceHours: number
  maxAdvanceDays: number
  specialInstructions: string | null
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const categories = [
  'All',
  'HAIR_SERVICES',
  'NAIL_CARE',
  'SKIN_CARE',
  'BARBERING',
  'BEAUTY_TREATMENT',
  'MASSAGE',
  'OTHER'
]

// Function to format category for display
const formatCategory = (category: string) => {
  if (category === 'All') return category
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

export default function ServicesPage() {
  const { user } = useAuthContext()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.businessSlug) {
      fetchServices()
    }
  }, [user])

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const fetchServices = async () => {
    if (!user?.businessSlug) return

    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/services?entrepreneurId=${user.businessSlug}`)
      if (!response.ok) throw new Error('Failed to fetch services')
      
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch services')
      }
      
      setServices(data.data)
    } catch (error) {
      console.error('Error fetching services:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch services')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setServices(prev => prev.filter(service => service.id !== id))
      } else {
        throw new Error('Failed to delete service')
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert('Failed to delete service')
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

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading services</h3>
                <p className="mt-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Services
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your business services and pricing
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/admin/services/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>{formatCategory(category)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mt-8">
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white overflow-hidden shadow rounded-lg border"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {service.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{service.description || 'No description available'}</p>
                        <p className="mt-2 text-xs text-gray-400">{formatCategory(service.category)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration} min
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {service.price === 0 ? 'Free' : `${service.price}`}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {/* Assuming bookings count is not directly available in the new Service interface */}
                        {/* For now, we'll show a placeholder or remove if not needed */}
                        {/* <span>{service.bookings}</span> bookings */}
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <Link
                        href={`/admin/services/${service.id}/edit`}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors text-center"
                      >
                        Edit Service
                      </Link>
                      <button
                        onClick={() => handleDeleteService(service.id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedCategory !== 'All' ? 
                  'Try adjusting your search or filter criteria.' :
                  'Get started by creating your first service.'
                }
              </p>
              {!searchTerm && selectedCategory === 'All' && (
                <div className="mt-6">
                  <Link
                    href="/admin/services/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first service
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Service Statistics */}
        {filteredServices.length > 0 && (
          <div className="mt-12 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Service Statistics
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-900">Total Services</p>
                      <p className="text-2xl font-bold text-blue-600">{services.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-900">Avg. Price</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${Math.round(services.filter(s => s.price > 0).reduce((acc, s) => acc + s.price, 0) / services.filter(s => s.price > 0).length)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-900">Avg. Duration</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {Math.round(services.reduce((acc, s) => acc + s.duration, 0) / services.length)} min
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}