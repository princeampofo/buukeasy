'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar, 
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy
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
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' },
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
  const { user } = useAuthContext()
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
      
      if (!user?.id) {
        setError('User not authenticated')
        return
      }
      
      const response = await fetch(`/api/dashboard/availability?entrepreneurId=${user.id}`)
      const result: ApiResponse = await response.json()
      
      if (result.success && result.data) {
        setSchedule(result.data)
        setOriginalSchedule(result.data)
      } else {
        setError(result.error || 'Failed to load availability')
      }
    } catch (err) {
      setError('Failed to load availability data')
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
    // Check for validation errors before saving
    if (hasValidationErrors()) {
      setSaveStatus('error')
      setError('Please fix all validation errors before saving. Check for invalid time ranges and overlapping slots.')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')
    setError(null)
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const response = await fetch('/api/dashboard/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entrepreneurId: user.id,
          availabilityData: schedule
        }),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setOriginalSchedule({ ...schedule })
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setError(result.error || 'Failed to save availability')
        // Reset schedule to original state on error
        setSchedule({ ...originalSchedule })
      }
    } catch (err) {
      setSaveStatus('error')
      setError('Failed to save availability')
      // Reset schedule to original state on error
      setSchedule({ ...originalSchedule })
    } finally {
      setIsSaving(false)
    }
  }

  const hasValidationErrors = (): boolean => {
    return Object.keys(schedule).some(day => {
      const daySchedule = schedule[day]
      if (!daySchedule.enabled) return false
      
      // Check for invalid time slots
      const hasInvalidSlots = daySchedule.slots.some(slot => !validateTimeSlot(slot.start, slot.end))
      
      // Check for overlapping slots
      const hasOverlaps = hasOverlappingSlots(day)
      
      return hasInvalidSlots || hasOverlaps
    })
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

  // Helper function to format time display in GST
  const formatTimeDisplay = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Calculate total weekly hours
  const calculateTotalHours = () => {
    return Object.values(schedule).reduce((total, day) => {
      if (!day.enabled) return total
      return total + day.slots.reduce((dayTotal, slot) => {
        const start = new Date(`1970-01-01T${slot.start}:00`)
        const end = new Date(`1970-01-01T${slot.end}:00`)
        return dayTotal + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0)
    }, 0)
  }

  // Update the Save button to be disabled when there are validation errors
  const saveButtonDisabled = !hasChanges || isSaving || hasValidationErrors()

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error && !schedule) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <AlertCircle className="mx-auto h-6 w-6 text-red-400 mb-2" />
            <h3 className="text-base font-medium text-red-800 mb-2">Error Loading</h3>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAvailability}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Availability
          </h2>
          <p className="mt-1 text-sm text-gray-500 hidden sm:block">
            Set your weekly schedule and available time slots for appointments (Gulf Standard Time)
          </p>
          <p className="mt-1 text-xs text-gray-500 sm:hidden">
            Set your schedule (GST)
          </p>
          
          {/* Mobile Action Buttons */}
          <div className="mt-4 flex space-x-2 sm:hidden">
            <button
              type="button"
              onClick={resetToOriginal}
              disabled={!hasChanges}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saveButtonDisabled}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex sm:justify-end sm:space-x-3 sm:mt-4">
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
              disabled={saveButtonDisabled}
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
          <div className={`mb-4 p-3 sm:p-4 rounded-md ${
            saveStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              {saveStatus === 'success' ? (
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="ml-2 sm:ml-3">
                <p className={`text-xs sm:text-sm ${
                  saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {saveStatus === 'success' 
                    ? 'Availability saved successfully.' 
                    : error || 'Error saving. Please try again.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Schedule */}
        <div className="space-y-3 sm:space-y-6">
          {daysOfWeek.map(({ key, label, short }) => {
            const daySchedule = schedule[key]
            const hasErrors = daySchedule.enabled && (
              daySchedule.slots.some(slot => !validateTimeSlot(slot.start, slot.end)) ||
              hasOverlappingSlots(key)
            )

            return (
              <div key={key} className="bg-white shadow rounded-lg">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <input
                        type="checkbox"
                        id={`${key}-enabled`}
                        checked={daySchedule.enabled}
                        onChange={(e) => updateDayEnabled(key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`${key}-enabled`} className="ml-2 sm:ml-3 font-medium text-gray-900">
                        <span className="sm:hidden text-sm">{short}</span>
                        <span className="hidden sm:inline text-lg">{label}</span>
                      </label>
                      {hasErrors && (
                        <AlertCircle className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {daySchedule.enabled && (
                        <>
                          <button
                            type="button"
                            onClick={() => addTimeSlot(key)}
                            className="inline-flex items-center px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Add</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToAllDays(key)}
                            className="inline-flex items-center px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            title="Copy to all days"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="hidden lg:inline sm:ml-1">Copy</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {daySchedule.enabled && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4">
                    {daySchedule.slots.length > 0 ? (
                      <div className="space-y-3">
                        {daySchedule.slots.map((slot, index) => {
                          const isValid = validateTimeSlot(slot.start, slot.end)
                          return (
                            <div key={index} className="space-y-2 sm:space-y-0">
                              {/* Mobile Layout */}
                              <div className="sm:hidden">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Clock className="h-3 w-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">Time Slot {index + 1}</span>
                                  {!isValid && (
                                    <AlertCircle className="h-3 w-3 text-red-500" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => updateTimeSlot(key, index, 'start', e.target.value)}
                                    className={`flex-1 border rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                      !isValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                  />
                                  <span className="text-sm text-gray-600">to</span>
                                  <input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => updateTimeSlot(key, index, 'end', e.target.value)}
                                    className={`flex-1 border rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                                </div>
                                {!isValid && (
                                  <p className="text-xs text-red-600 mt-1">Invalid time range</p>
                                )}
                              </div>
                              
                              {/* Desktop Layout */}
                              <div className="hidden sm:flex sm:items-center sm:space-x-4">
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
                            </div>
                          )
                        })}
                        {hasOverlappingSlots(key) && (
                          <div className="flex items-center text-red-600 text-xs sm:text-sm">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Time slots cannot overlap
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8">
                        <Clock className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                        <p className="mt-2 text-xs sm:text-sm text-gray-500">No time slots added</p>
                        <button
                          type="button"
                          onClick={() => addTimeSlot(key)}
                          className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs sm:text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Add Time Slot
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!daySchedule.enabled && (
                  <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
                    <Calendar className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <p className="mt-2 text-xs sm:text-sm text-gray-500">Not available</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary - Hidden on very small screens */}
        <div className="hidden sm:block mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-blue-900 mb-4">Schedule Summary</h3>
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
                {daysOfWeek.filter(({ key }) => schedule[key].enabled).length === 0 && (
                  <li className="text-gray-500">No days selected</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-2">Total Hours per Week</h4>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">
                {calculateTotalHours().toFixed(1)} hours
              </p>
              <p className="text-xs text-blue-600 mt-1">Gulf Standard Time (GST)</p>
            </div>
          </div>
        </div>

        {/* Mobile Summary - Compact version for small screens */}
        <div className="sm:hidden mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-blue-800">Weekly Hours</p>
              <p className="text-lg font-bold text-blue-900">
                {calculateTotalHours().toFixed(1)}h
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-blue-800">Available Days</p>
              <p className="text-sm text-blue-700">
                {daysOfWeek.filter(({ key }) => schedule[key].enabled).length}/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}