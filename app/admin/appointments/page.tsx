'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Appointment {
  id: number
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  date: string // ISO date string
  time: string // e.g. "14:30"
  duration: number // in minutes
  price?: number // optional, can be null or undefined
  status: 'confirmed' | 'modified' | 'cancelled' | 'completed'
  notes?: string // optional notes field
  formattedDate?: string // optional formatted date for display
  formattedPrice?: string // optional formatted price for display
}

const statusOptions = ['all', 'confirmed', 'modified', 'cancelled']

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)

  // Fetch appointments from API
  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedDate) params.append('date', selectedDate)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/appointments?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      
      const data = await response.json()
      setAppointments(data.appointments)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch appointments on component mount and when filters change
  useEffect(() => {
    fetchAppointments()
  }, [selectedStatus, selectedDate, searchTerm])

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      modified: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Edit3 },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle },
    }
    return styles[status as keyof typeof styles] || styles.confirmed
  }

  const handleMarkComplete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark appointment as complete')
      }

      // Refresh appointments list
      await fetchAppointments()
      setOpenDropdown(null)
    } catch (err) {
      console.error('Error marking appointment as complete:', err)
      // TODO: Show error toast/notification
    }
  }

  const handleCancelAppointment = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      // Refresh appointments list
      await fetchAppointments()
      setOpenDropdown(null)
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      // TODO: Show error toast/notification
    }
  }

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays(currentWeek)

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
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
              <XCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading appointments</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                    onClick={fetchAppointments}
                  >
                    Try again
                  </button>
                </div>
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
              Appointments
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your upcoming and past appointments
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'list' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="mt-8">
            {appointments.length > 0 ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {appointments.map((appointment) => {
                    const statusConfig = getStatusBadge(appointment.status)
                    return (
                      <li key={appointment.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {appointment.clientName}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {appointment.service}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                      {appointment.formattedDate || new Date(appointment.date).toLocaleDateString()} at {appointment.time}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {appointment.duration} min • {appointment.formattedPrice || `$${appointment.price}` || 'Free'}
                                    </p>
                                  </div>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                    <statusConfig.icon className="h-3 w-3 mr-1" />
                                    {appointment.status}
                                  </span>
                                  
                                  <div className="relative">
                                    <button
                                      type="button"
                                      className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      onClick={() => setOpenDropdown(openDropdown === appointment.id ? null : appointment.id)}
                                    >
                                      <MoreVertical className="h-4 w-4 text-gray-400" />
                                    </button>
                                    
                                    {openDropdown === appointment.id && (
                                      <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                        <div className="py-1">
                                          <button
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => handleMarkComplete(appointment.id)}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Complete
                                          </button>
                                          <button
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            onClick={() => handleCancelAppointment(appointment.id)}
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel Appointment
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {appointment.notes && (
                                <p className="mt-2 text-sm text-gray-600">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
                              )}
                              
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  {appointment.clientEmail}
                                </div>
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {appointment.clientPhone}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || selectedStatus !== 'all' || selectedDate ? 
                    'Try adjusting your search or filter criteria.' :
                    'No appointments scheduled yet.'
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          // Calendar View
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Week of {weekDays[0].toLocaleDateString()}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      const prevWeek = new Date(currentWeek)
                      prevWeek.setDate(currentWeek.getDate() - 7)
                      setCurrentWeek(prevWeek)
                    }}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900"
                    onClick={() => setCurrentWeek(new Date())}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      const nextWeek = new Date(currentWeek)
                      nextWeek.setDate(currentWeek.getDate() + 7)
                      setCurrentWeek(nextWeek)
                    }}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <div key={day} className="bg-white p-4 min-h-32">
                  <div className="font-medium text-sm text-gray-900 mb-2">
                    {day} {weekDays[index].getDate()}
                  </div>
                  <div className="space-y-1">
                    {appointments
                      .filter(apt => apt.date === weekDays[index].toISOString().split('T')[0])
                      .map(appointment => {
                        const statusConfig = getStatusBadge(appointment.status)
                        return (
                          <div
                            key={appointment.id}
                            className={`p-2 rounded text-xs ${statusConfig.bg} ${statusConfig.text} cursor-pointer hover:opacity-80`}
                          >
                            <div className="font-medium">{appointment.time}</div>
                            <div className="truncate">{appointment.clientName}</div>
                            <div className="truncate">{appointment.service}</div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}