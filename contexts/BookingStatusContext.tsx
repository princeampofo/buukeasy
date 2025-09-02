'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface BookingStatusContextType {
  bookingStatus: string | null
  setBookingStatus: (status: string | null) => void
}

const BookingStatusContext = createContext<BookingStatusContextType | undefined>(undefined)

export function BookingStatusProvider({ children }: { children: ReactNode }) {
  const [bookingStatus, setBookingStatus] = useState<string | null>(null)

  return (
    <BookingStatusContext.Provider value={{ bookingStatus, setBookingStatus }}>
      {children}
    </BookingStatusContext.Provider>
  )
}

export function useBookingStatus() {
  const context = useContext(BookingStatusContext)
  if (context === undefined) {
    throw new Error('useBookingStatus must be used within a BookingStatusProvider')
  }
  return context
}