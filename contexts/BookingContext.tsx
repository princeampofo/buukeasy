// contexts/BookingContext.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface BookingData {
  // Service & Business Info
  businessSlug?: string
  serviceId?: string
  serviceLocation?: 'in-store' | 'home'
  
  // Appointment Details
  selectedDate?: string
  selectedTime?: string
  
  // Client Information
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  serviceAddress?: string
  addressNotes?: string
  notes?: string
  emailNotifications?: boolean
  smsNotifications?: boolean
  
  // Payment Information
  paymentMethod?: string
  paymentType?: 'full' | 'deposit'
}

interface BookingContextType {
  bookingData: BookingData
  updateBookingData: (data: Partial<BookingData>) => void
  clearBookingData: () => void
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookingData, setBookingData] = useState<BookingData>({})

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }))
  }

  const clearBookingData = () => {
    setBookingData({})
  }

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, clearBookingData }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}