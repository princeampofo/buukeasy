'use client'

import { useState, useEffect} from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  DollarSign,
  Users
} from 'lucide-react'

interface Service {
  id: number
  name: string
  description: string
  duration: number
  price: number
  category: string
  bookings: number
}


const categories = ['All', 'Hair Services', 'Grooming', 'Consultation']

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  // Replace mock services with state:
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const fetchServices = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/services')
      if (!response.ok) throw new Error('Failed to fetch services')
      
      const data = await response.json()
      setServices(data.services)
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update handleDeleteService:
  const handleDeleteService = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setServices(prev => prev.filter(service => service.id !== id))
      }
    } catch (error) {
      console.error('Error deleting service:', error)
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
                <option key={category} value={category}>{category}</option>
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
                        <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                        <p className="mt-2 text-xs text-gray-400">{service.category}</p>
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
                        {service.bookings} bookings
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