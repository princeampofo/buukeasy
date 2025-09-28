'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DateTime } from 'luxon'
import { ChevronLeft, ChevronRight, Clock, ArrowLeft, Globe, Calendar } from 'lucide-react'
import { useBookingStorage } from '@/hooks/useBookingStorage'

interface TimeSlot {
  time: string
  available: boolean
  datetime: string
}

interface BookingWindow {
  minAdvanceHours: number
  maxAdvanceDays: number
  minBookingDate: string
  maxBookingDate: string
}

interface ApiResponse {
  bookingWindow?: BookingWindow
  timeSlots?: TimeSlot[]
  message?: string
  timezone?: string
}

export default function AvailabilityPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const { 
    bookingData, 
    isLoaded, 
    setAppointment, 
    isServiceSelected 
  } = useBookingStorage()
  
  const [selectedDate, setSelectedDate] = useState<DateTime | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState<DateTime>(DateTime.now())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [bookingWindow, setBookingWindow] = useState<BookingWindow | null>(null)
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null)
  const [businessTimezone, setBusinessTimezone] = useState<string>('Asia/Dubai')

  // Redirect if no service selected
  useEffect(() => {
    if (isLoaded && !isServiceSelected()) {
      router.push(`/book/${slug}`)
    }
  }, [isLoaded, slug, router, isServiceSelected])

  // Fetch booking window when service is loaded
  useEffect(() => {
    const fetchBookingWindow = async () => {
      if (!bookingData.serviceId || !bookingData.serviceLocation) return
      
      try {
        
        const response = await fetch(`/api/book/${slug}/availability?serviceId=${bookingData.serviceId}&serviceLocation=${bookingData.serviceLocation}`)
        
        if (response.ok) {
          const data: ApiResponse = await response.json()
          setBookingWindow(data.bookingWindow || null)
          
          // Set the business timezone from response
          if (data.timezone) {
            setBusinessTimezone(data.timezone)
            
            // Update current month to business timezone
            setCurrentMonth(DateTime.now().setZone(data.timezone))
          }
          
          // Set initial date to first available date if none selected
          if (data.bookingWindow && !selectedDate) {
            const minDate = DateTime.fromISO(data.bookingWindow.minBookingDate, { zone: data.timezone || businessTimezone })
            setSelectedDate(minDate)
            setCurrentMonth(minDate.startOf('month'))
          }
        } else {
          const errorData = await response.text()
          console.error('Booking Window API Error:', errorData)
        }
      } catch (error) {
        console.error('Failed to fetch booking window:', error)
      }
    }

    if (isLoaded && bookingData.serviceId && bookingData.serviceLocation && !bookingWindow) {
      fetchBookingWindow()
    }
  }, [isLoaded, bookingData.serviceId, bookingData.serviceLocation, slug, selectedDate, bookingWindow, businessTimezone])

  // Fetch time slots when date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate || !bookingData.serviceId || !bookingData.serviceLocation || !bookingWindow) return
      
      setLoadingSlots(true)
      setAvailabilityMessage(null)
      try {
        const localDateString = selectedDate.toISODate() // YYYY-MM-DD format in the timezone
        
        const response = await fetch(
          `/api/book/${slug}/availability?date=${localDateString}&serviceId=${bookingData.serviceId}&serviceLocation=${bookingData.serviceLocation}`
        )
        
        if (response.ok) {
          const data: ApiResponse = await response.json()
          setTimeSlots(data.timeSlots || [])
          setAvailabilityMessage(data.message || null)
        } else {
          const errorData = await response.text()
          setTimeSlots([])
        }
      } catch (error) {
        console.error('Failed to fetch time slots:', error)
        setTimeSlots([])
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchTimeSlots()
  }, [selectedDate, bookingData.serviceId, bookingData.serviceLocation, slug, bookingWindow, businessTimezone])

  const getDaysInMonth = (date: DateTime) => {
    const startOfMonth = date.startOf('month')
    const endOfMonth = date.endOf('month')
    const days = []

    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = startOfMonth.weekday % 7 // Convert Mon=1 to Sun=0 system
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    const daysInMonth = endOfMonth.day
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(startOfMonth.set({ day }))
    }

    return days
  }

  const isDateSelectable = (date: DateTime | null) => {
    if (!date || !bookingWindow) return false
    
    const minBookingDate = DateTime.fromISO(bookingWindow.minBookingDate, { zone: businessTimezone })
    const maxBookingDate = DateTime.fromISO(bookingWindow.maxBookingDate, { zone: businessTimezone })
    
    return date >= minBookingDate.startOf('day') && date <= maxBookingDate.endOf('day')
  }

  const formatDate = (date: DateTime | null, format: string = 'cccc, LLLL d, y') => {
    if (!date) return null
    return date.toFormat(format)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' 
        ? prev.minus({ months: 1 })
        : prev.plus({ months: 1 })
    )
  }

  const handleDateSelect = (date: DateTime) => {
   
    setSelectedDate(date)
    setSelectedTime(null)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
     
      // Store as ISO date string instead of JS Date
      setAppointment({
        appointmentDate: selectedDate.toISODate(), // Store as YYYY-MM-DD string
        appointmentTime: selectedTime
      })
      router.push(`/book/${slug}/details`)
    }
  }

  const days = getDaysInMonth(currentMonth)

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    )
  }

  // No service selected
  if (!isServiceSelected()) {
    return null
  }

  return (
    <div className="space-y-4 lg:space-y-6 max-w-4xl mx-auto px-4 lg:px-0">
      {/* Header */}
      <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-3 lg:mb-4">
          <button
            onClick={() => router.push(`/book/${slug}`)}
            className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 text-gray-600" />
          </button>
          <h2 className="text-lg lg:text-2xl font-bold text-gray-900">Select Date & Time</h2>
          <div className="flex items-center text-xs text-gray-500 ml-auto">
            <Globe className="h-3 w-3 mr-1" />
            {businessTimezone.split('/')[1]}
          </div>
        </div>
        
        {/* Service Summary */}
        <div className="bg-blue-50 p-3 lg:p-4 rounded-lg lg:rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-1 text-sm lg:text-base">{bookingData.serviceName}</h3>
          <div className="flex flex-wrap items-center gap-2 lg:gap-4 text-xs lg:text-sm text-blue-700">
            <div className="flex items-center">
              <Clock className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
              {bookingData.duration}min
            </div>
            <div className="font-semibold">
              AED {bookingData.serviceAmount?.toFixed(2)}
            </div>
            <div className="capitalize hidden sm:block">
              {bookingData.serviceLocation === 'home' ? 'Home Service' : 'In-Store'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {/* Calendar */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
              Date
            </h3>
            <div className="flex items-center gap-1 lg:gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
              <span className="text-sm lg:text-lg font-medium min-w-[120px] lg:min-w-[180px] text-center">
                <span className="hidden sm:inline">
                  {currentMonth.toFormat('LLLL y')}
                </span>
                <span className="sm:hidden">
                  {currentMonth.toFormat('LLL yy')}
                </span>
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 lg:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="h-4 w-4 lg:h-5 lg:w-5" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3 lg:mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={index} className="text-center text-xs lg:text-sm font-medium text-gray-500 py-1 lg:py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day && isDateSelectable(day) && handleDateSelect(day)}
                disabled={!day || !isDateSelectable(day)}
                className={`h-9 lg:h-12 text-xs lg:text-sm rounded-lg transition-all font-medium ${
                  !day 
                    ? 'invisible' 
                    : !isDateSelectable(day)
                    ? 'text-gray-300 cursor-not-allowed'
                    : selectedDate && day.hasSame(selectedDate, 'day')
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'hover:bg-blue-50 text-gray-900 hover:shadow-sm'
                }`}
              >
                {day && day.day}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {!bookingWindow && bookingData.serviceId && (
            <div className="mt-3 lg:mt-4 text-center text-xs lg:text-sm text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 lg:h-4 lg:w-4 border-2 border-blue-600 border-t-transparent inline-block mr-2"></div>
              Loading...
            </div>
          )}
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-lg lg:rounded-xl shadow-sm border p-4 lg:p-6">
          <div className="flex items-center mb-4 lg:mb-6">
            <Clock className="h-4 w-4 lg:h-5 lg:w-5 text-gray-400 mr-2" />
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">
              <span className="hidden sm:inline">Available Times</span>
              <span className="sm:hidden">Times</span>
            </h3>
            {loadingSlots && (
              <div className="ml-auto">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              </div>
            )}
          </div>
          
          {/* Selected Date Display */}
          {selectedDate && (
            <div className="mb-4 lg:mb-6">
              <p className="text-xs lg:text-sm text-gray-600 bg-gray-50 px-2 lg:px-3 py-1 lg:py-2 rounded-lg">
                <span className="hidden sm:inline">{formatDate(selectedDate, 'cccc, LLLL d, y')}</span>
                <span className="sm:hidden">{formatDate(selectedDate, 'LLL d')}</span>
              </p>
            </div>
          )}

          {/* Time Slots Content */}
          {!selectedDate || !isDateSelectable(selectedDate) ? (
            <div className="text-center py-8 lg:py-12 text-gray-500">
              <Clock className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-gray-300" />
              <p className="font-medium text-sm lg:text-base">Select a date first</p>
              <p className="text-xs lg:text-sm">Choose a date to see available times</p>
            </div>
          ) : loadingSlots ? (
            <div className="text-center py-8 lg:py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 border-2 border-blue-600 border-t-transparent"></div>
              <p className="font-medium text-sm lg:text-base">Loading available times...</p>
            </div>
          ) : availabilityMessage ? (
            <div className="text-center py-8 lg:py-12 text-gray-500">
              <Clock className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-gray-300" />
              <p className="font-medium text-sm lg:text-base">No available times</p>
              <p className="text-xs lg:text-sm">{availabilityMessage}</p>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8 lg:py-12 text-gray-500">
              <Clock className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-2 lg:mb-3 text-gray-300" />
              <p className="font-medium text-sm lg:text-base">No available times</p>
              <p className="text-xs lg:text-sm">Try selecting a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 lg:gap-3 max-h-60 lg:max-h-80 overflow-y-auto">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`p-2 lg:p-3 text-xs lg:text-sm rounded-lg border transition-all font-medium ${
                    selectedTime === slot.time
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : slot.available
                      ? 'bg-white text-gray-900 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                      : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <div className="bg-green-50 border border-green-200 rounded-lg lg:rounded-xl p-4 lg:p-6">
          <h3 className="font-semibold text-green-900 mb-3 lg:mb-4 text-sm lg:text-base">Selected Appointment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-green-800 text-xs lg:text-sm">
            <div className="space-y-1 lg:space-y-2">
              <p><span className="font-medium">Service:</span> <span className="sm:hidden">{bookingData.serviceName}</span><span className="hidden sm:inline">{bookingData.serviceName}</span></p>
              <p><span className="font-medium">Date:</span> <span className="sm:hidden">{formatDate(selectedDate, 'LLL d')}</span><span className="hidden sm:inline">{formatDate(selectedDate, 'cccc, LLLL d, y')}</span></p>
              <p><span className="font-medium">Time:</span> {selectedTime} </p>
            </div>
            <div className="space-y-1 lg:space-y-2 hidden sm:block">
              <p><span className="font-medium">Duration:</span> {bookingData.duration} minutes</p>
              <p><span className="font-medium">Price:</span> AED {bookingData.serviceAmount?.toFixed(2)}</p>
              <p><span className="font-medium">Location:</span> {bookingData.serviceLocation === 'home' ? 'Home Service' : 'In-Store'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {selectedDate && selectedTime && (
        <div className="sticky bottom-0 sm:static z-10">
          <div className="bg-white sm:bg-transparent p-4 sm:p-0 rounded-t-xl sm:rounded-none shadow-lg sm:shadow-none border-t sm:border-none">
            <button
              onClick={handleContinue}
              className="w-full flex items-center justify-center px-4 lg:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
            >
              Continue to Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}