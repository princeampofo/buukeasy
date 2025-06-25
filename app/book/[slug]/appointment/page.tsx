'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'

// Mock available time slots
const generateTimeSlots = (date: Date) => {
  const slots = []
  const startHour = 9
  const endHour = 17
  const interval = 30 // minutes

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time = new Date(date)
      time.setHours(hour, minute, 0, 0)
      
      // Mock some unavailable slots
      const isAvailable = Math.random() > 0.3
      
      slots.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        available: isAvailable,
        datetime: time
      })
    }
  }
  
  return slots
}

export default function AppointmentPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')
  const serviceLocation = searchParams.get('location') || 'in-store'
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())

  // build slots on the client only
  const [timeSlots, setTimeSlots] = useState<{time: string; available: boolean; datetime: Date }[]>([])
  useEffect(() => {
   setTimeSlots(generateTimeSlots(selectedDate))}, [selectedDate])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    // Add empty cells for days before the first day of the month
    const firstDayOfWeek = firstDay.getDay()
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateSelectable = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="space-y-6">
      {/* Selected Service Summary */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Select Date & Time</h2>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900">Deep Tissue Massage</h3>
          <p className="text-blue-700 text-sm">60 minutes • $120</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Select Date</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-lg font-medium min-w-[200px] text-center">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day && isDateSelectable(day) && setSelectedDate(day)}
                disabled={!day || !isDateSelectable(day)}
                className={`h-10 text-sm rounded transition-colors ${
                  !day 
                    ? 'invisible' 
                    : !isDateSelectable(day)
                    ? 'text-gray-300 cursor-not-allowed'
                    : selectedDate && day.toDateString() === selectedDate.toDateString()
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                {day?.getDate()}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold">Available Times</h3>
          </div>
          
          {selectedDate && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  !slot.available
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : selectedTime === slot.time
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-900 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>

          {timeSlots.filter(slot => slot.available).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No available times for this date</p>
              <p className="text-sm">Please select a different date</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Appointment Summary */}
      {selectedDate && selectedTime && (
        <div className="card bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Selected Appointment</h3>
          <div className="text-green-800">
            <p><strong>Service:</strong> Deep Tissue Massage</p>
            <p><strong>Date:</strong> {formatDate(selectedDate)}</p>
            <p><strong>Time:</strong> {selectedTime}</p>
            <p><strong>Duration:</strong> 60 minutes</p>
            <p><strong>Price:</strong> {serviceLocation === 'home' ? '$150' : '$120'}</p>
            <p><strong>Location:</strong> {serviceLocation === 'home' ? 'Home Service' : 'In-Store'}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Link
          href={`/book/${slug}`}
          className="btn-secondary"
        >
          Back to Services
        </Link>
        
        {selectedDate && selectedTime && (
          <Link
            href={`/book/${slug}/details?service=${serviceId}&date=${selectedDate.toISOString()}&time=${selectedTime}&location=${serviceLocation}`}
            className="btn-primary"
          >
            Continue to Details
          </Link>
        )}
      </div>
    </div>
  )
}