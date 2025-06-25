'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface TimeSlot {
  start: string
  end: string
}

interface DaySchedule {
  enabled: boolean
  slots: TimeSlot[]
}

interface WeeklySchedule {
  [key: string]: DaySchedule
}

interface ApiResponse {
  success: boolean
  data?: WeeklySchedule
  error?: string
  message?: string
}

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
]

// Default empty schedule
const emptySchedule: WeeklySchedule = {
  monday: { enabled: false, slots: [] },
  tuesday: { enabled: false, slots: [] },
  wednesday: { enabled: false, slots: [] },
  thursday: { enabled: false, slots: [] },
  friday: { enabled: false, slots: [] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] }
}

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState<WeeklySchedule>(emptySchedule)
  const [originalSchedule, setOriginalSchedule] = useState<WeeklySchedule>(emptySchedule)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  // Fetch availability data on component mount
  useEffect(() => {
    fetchAvailability()
  }, [])

  // Check for changes whenever schedule updates
  useEffect(() => {
    const hasChangesNow = JSON.stringify(schedule) !== JSON.stringify(originalSchedule)
    setHasChanges(hasChangesNow)
  }, [schedule, originalSchedule])

  const fetchAvailability = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/availability')
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        setSchedule(result.data)
        setOriginalSchedule(result.data)
      } else {
        setError(result.error || 'Failed to load availability')
      }
    } catch (err) {
      setError('Failed to load availability data')
      console.error('Error fetching availability:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateDayEnabled = (day: string, enabled: boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
        slots: enabled ? prev[day].slots : []
      }
    }))
  }

  const addTimeSlot = (day: string) => {
    const newSlot = { start: '09:00', end: '17:00' }
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, newSlot]
      }
    }))
  }

  const updateTimeSlot = (day: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, index) =>
          index === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const removeTimeSlot = (day: string, slotIndex: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, index) => index !== slotIndex)
      }
    }))
  }

  const copyToAllDays = (sourceDay: string) => {
    const sourceSchedule = schedule[sourceDay]
    const updatedSchedule = { ...schedule }
    
    daysOfWeek.forEach(({ key }) => {
      if (key !== sourceDay) {
        updatedSchedule[key] = {
          enabled: sourceSchedule.enabled,
          slots: [...sourceSchedule.slots]
        }
      }
    })
    
    setSchedule(updatedSchedule)
  }

  const resetToOriginal = () => {
    setSchedule({ ...originalSchedule })
    setSaveStatus('idle')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveStatus('idle')
    
    try {
      const response = await fetch('/api/admin/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(schedule),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setOriginalSchedule({ ...schedule })
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setError(result.error || 'Failed to save availability')
      }
    } catch (err) {
      setSaveStatus('error')
      setError('Failed to save availability')
      console.error('Error saving availability:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const validateTimeSlot = (start: string, end: string): boolean => {
    if (!start || !end) return false
    const startTime = new Date(`1970-01-01T${start}:00`)
    const endTime = new Date(`1970-01-01T${end}:00`)
    return startTime < endTime
  }

  const hasOverlappingSlots = (day: string): boolean => {
    const slots = schedule[day].slots
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const slot1Start = new Date(`1970-01-01T${slots[i].start}:00`)
        const slot1End = new Date(`1970-01-01T${slots[i].end}:00`)
        const slot2Start = new Date(`1970-01-01T${slots[j].start}:00`)
        const slot2End = new Date(`1970-01-01T${slots[j].end}:00`)
        
        if ((slot1Start < slot2End && slot1End > slot2Start)) {
          return true
        }
      }
    }
    return false
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Loading availability...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !schedule) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Availability</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAvailability}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Availability Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Set your weekly schedule and available time slots for appointments
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={resetToOriginal}
              disabled={!hasChanges}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Save Status */}
        {saveStatus !== 'idle' && (
          <div className={`mt-4 p-4 rounded-md ${
            saveStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              {saveStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <div className="ml-3">
                <p className={`text-sm ${
                  saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {saveStatus === 'success' 
                    ? 'Your availability has been saved successfully.' 
                    : error || 'There was an error saving your availability. Please try again.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="mt-8 space-y-6">
          {daysOfWeek.map(({ key, label }) => {
            const daySchedule = schedule[key]
            const hasErrors = daySchedule.enabled && (
              daySchedule.slots.some(slot => !validateTimeSlot(slot.start, slot.end)) ||
              hasOverlappingSlots(key)
            )

            return (
              <div key={key} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${key}-enabled`}
                        checked={daySchedule.enabled}
                        onChange={(e) => updateDayEnabled(key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`${key}-enabled`} className="ml-3 text-lg font-medium text-gray-900">
                        {label}
                      </label>
                      {hasErrors && (
                        <AlertCircle className="ml-2 h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {daySchedule.enabled && (
                        <>
                          <button
                            type="button"
                            onClick={() => addTimeSlot(key)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Slot
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToAllDays(key)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Copy to All
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {daySchedule.enabled && (
                  <div className="px-6 py-4">
                    {daySchedule.slots.length > 0 ? (
                      <div className="space-y-3">
                        {daySchedule.slots.map((slot, index) => {
                          const isValid = validateTimeSlot(slot.start, slot.end)
                          return (
                            <div key={index} className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">From</span>
                              </div>
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) => updateTimeSlot(key, index, 'start', e.target.value)}
                                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              <span className="text-sm text-gray-600">to</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) => updateTimeSlot(key, index, 'end', e.target.value)}
                                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(key, index)}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              {!isValid && (
                                <span className="text-xs text-red-600">Invalid time range</span>
                              )}
                            </div>
                          )
                        })}
                        {hasOverlappingSlots(key) && (
                          <div className="flex items-center text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Time slots cannot overlap
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500">No time slots added yet</p>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(key)}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Time Slot
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!daySchedule.enabled && (
                  <div className="px-6 py-8 text-center">
                    <Calendar className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">Not available on this day</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Schedule Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Available Days</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {daysOfWeek
                  .filter(({ key }) => schedule[key].enabled)
                  .map(({ label }) => (
                    <li key={label}>{label}</li>
                  ))
                }
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Total Hours per Week</h4>
              <p className="text-2xl font-bold text-blue-900">
                {Object.values(schedule).reduce((total, day) => {
                  if (!day.enabled) return total
                  return total + day.slots.reduce((dayTotal, slot) => {
                    const start = new Date(`1970-01-01T${slot.start}:00`)
                    const end = new Date(`1970-01-01T${slot.end}:00`)
                    return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
                  }, 0)
                }, 0)} hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}