// hooks/useBookingStorage.ts
'use client'

import { useState, useEffect } from 'react'

export interface BookingData {
  // Service Selection
  serviceId?: string
  serviceName?: string
  serviceCategory?: string
  duration?: number
  serviceAmount?: number
  serviceLocation?: 'home' | 'in-store'
  
  // Date & Time Selection
  appointmentDate?: string
  appointmentTime?: string
  businessTimezone?: string // Store the business timezone
  
  // Customer Details
  customerEmail?: string
  customerFirstName?: string
  customerLastName?: string
  customerPhone?: string
  
  // Service Address (for home services)
  serviceAddress?: string
  addressNotes?: string
  
  // Additional Information
  specialRequests?: string
  
  // Business Information
  entrepreneurId?: string
  businessSlug?: string
  businessName?: string
}

const STORAGE_KEY = 'booking-data'

export function useBookingStorage() {
  const [bookingData, setBookingData] = useState<BookingData>({})
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setBookingData(parsed)
      }
    } catch (error) {
      console.error('Error loading booking data:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever data changes
  const updateBookingData = (newData: Partial<BookingData>) => {
    const updatedData = { ...bookingData, ...newData }
    setBookingData(updatedData)
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
    } catch (error) {
      console.error('Error saving booking data:', error)
    }
  }

  // Clear all booking data
  const clearBookingData = () => {
    setBookingData({})
    localStorage.removeItem(STORAGE_KEY)
  }

  // Helper functions for common operations
  const setService = (service: {
    serviceId: string
    serviceName: string
    serviceCategory: string
    duration: number
    serviceAmount: number
    serviceLocation: 'home' | 'in-store'
  }) => {
    updateBookingData(service)
  }

  const setAppointment = (appointment: {
    appointmentDate: string // Store as ISO string
    appointmentTime: string
  }) => {
    updateBookingData(appointment)
  }

  const setCustomerDetails = (customer: {
    customerEmail: string
    customerFirstName: string
    customerLastName: string
    customerPhone?: string
    serviceAddress?: string
    addressNotes?: string
    specialRequests?: string
  }) => {
    updateBookingData(customer)
  }

  const setBusinessInfo = (business: {
    entrepreneurId: string
    businessSlug: string
    businessName: string
    businessTimezone?: string // Include timezone in business info
  }) => {
    updateBookingData(business)
  }

  // New helper to set just the timezone
  const setBusinessTimezone = (timezone: string) => {
    updateBookingData({ businessTimezone: timezone })
  }

  // Validation helpers
  const isServiceSelected = () => {
    return !!(bookingData.serviceId && bookingData.serviceAmount && bookingData.serviceLocation)
  }

  const isAppointmentSelected = () => {
    return !!(bookingData.appointmentDate && bookingData.appointmentTime)
  }

  const isCustomerDetailsComplete = () => {
    const hasBasicInfo = !!(bookingData.customerEmail && bookingData.customerFirstName && bookingData.customerLastName && bookingData.customerPhone)
    const hasAddressIfNeeded = bookingData.serviceLocation === 'home' ? !!bookingData.serviceAddress : true
    return hasBasicInfo && hasAddressIfNeeded
  }

  const canProceedToStep = (step: number) => {
    switch (step) {
      case 2: // Date & time
        return isServiceSelected()
      case 3: // Customer details
        return isServiceSelected() && isAppointmentSelected()
      case 4: // Payment
        return isServiceSelected() && isAppointmentSelected() && isCustomerDetailsComplete()
      default:
        return true
    }
  }

  // Helper to get the business timezone with fallback
  const getBusinessTimezone = () => {
    return bookingData.businessTimezone || 'Asia/Dubai'
  }

  return {
    bookingData,
    isLoaded,
    updateBookingData,
    clearBookingData,
    setService,
    setAppointment,
    setCustomerDetails,
    setBusinessInfo,
    setBusinessTimezone,
    getBusinessTimezone,
    isServiceSelected,
    isAppointmentSelected,
    isCustomerDetailsComplete,
    canProceedToStep,
  }
}