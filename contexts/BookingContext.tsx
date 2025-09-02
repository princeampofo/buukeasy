'use client'

import React, { createContext, useContext, useReducer, ReactNode } from 'react'

// Types based on your Prisma model
export interface BookingData {
  // Service Selection
  serviceId?: string
  serviceName?: string
  serviceCategory?: string
  duration?: number
  totalAmount?: number
  serviceLocation?: 'in-store' | 'home'
  
  // Date & Time Selection
  appointmentDate?: Date
  appointmentTime?: string
  
  // Customer Details
  customerEmail?: string
  customerFirstName?: string
  customerLastName?: string
  customerPhone?: string
  
  // Additional Information
  specialRequests?: string
  
  // Business Information
  entrepreneurId?: string
  businessSlug?: string
  businessName?: string
}

export interface BookingState {
  bookingData: BookingData
  currentStep: number
  isLoading: boolean
  error: string | null
}

type BookingAction =
  | { type: 'SET_SERVICE'; payload: { serviceId: string; serviceName: string; serviceCategory: string; duration: number; totalAmount: number; serviceLocation: 'in-store' | 'home' } }
  | { type: 'SET_APPOINTMENT'; payload: { appointmentDate: Date; appointmentTime: string } }
  | { type: 'SET_CUSTOMER_DETAILS'; payload: { customerEmail: string; customerFirstName: string; customerLastName: string; customerPhone?: string } }
  | { type: 'SET_SPECIAL_REQUESTS'; payload: { specialRequests: string } }
  | { type: 'SET_BUSINESS_INFO'; payload: { entrepreneurId: string; businessSlug: string; businessName: string } }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_BOOKING_DATA'; payload: Partial<BookingData> }
  | { type: 'RESET_BOOKING' }

// Helper function to load state from sessionStorage
const loadPersistedState = (): BookingState => {
  if (typeof window === 'undefined') {
    return {
      bookingData: {},
      currentStep: 1,
      isLoading: false,
      error: null,
    }
  }

  try {
    const persistedState = sessionStorage.getItem('bookingState')
    if (persistedState) {
      const parsed = JSON.parse(persistedState)
      // Convert date strings back to Date objects
      if (parsed.bookingData.appointmentDate) {
        parsed.bookingData.appointmentDate = new Date(parsed.bookingData.appointmentDate)
      }
      return parsed
    }
  } catch (error) {
    console.error('Error loading persisted booking state:', error)
  }

  return {
    bookingData: {},
    currentStep: 1,
    isLoading: false,
    error: null,
  }
}

const initialState: BookingState = loadPersistedState()

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  let newState: BookingState

  switch (action.type) {
    case 'SET_SERVICE':
      newState = {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload,
        },
        currentStep: Math.max(state.currentStep, 2),
        error: null,
      }
      break
    
    case 'SET_APPOINTMENT':
      newState = {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload,
        },
        currentStep: Math.max(state.currentStep, 3),
        error: null,
      }
      break
    
    case 'SET_CUSTOMER_DETAILS':
      newState = {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload,
        },
        currentStep: Math.max(state.currentStep, 4),
        error: null,
      }
      break
    
    case 'SET_SPECIAL_REQUESTS':
      newState = {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload,
        },
        error: null,
      }
      break
    
    case 'SET_BUSINESS_INFO':
      newState = {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload,
        },
        error: null,
      }
      break
    
    case 'SET_STEP':
      newState = {
        ...state,
        currentStep: action.payload,
      }
      break
    
    case 'SET_LOADING':
      newState = {
        ...state,
        isLoading: action.payload,
      }
      break
    
    case 'SET_ERROR':
      newState = {
        ...state,
        error: action.payload,
        isLoading: false,
      }
      break
    
    case 'UPDATE_BOOKING_DATA':
      newState = {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload,
        },
        error: null,
      }
      break
    
    case 'RESET_BOOKING':
      newState = {
        bookingData: {},
        currentStep: 1,
        isLoading: false,
        error: null,
      }
      break
    
    default:
      return state
  }

  // Persist state to sessionStorage (only in browser)
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('bookingState', JSON.stringify(newState))
    } catch (error) {
      console.error('Error persisting booking state:', error)
    }
  }

  return newState
}

interface BookingContextType {
  state: BookingState
  dispatch: React.Dispatch<BookingAction>
  
  // Helper functions
  setService: (service: { serviceId: string; serviceName: string; serviceCategory: string; duration: number; totalAmount: number; serviceLocation: 'in-store' | 'home' }) => void
  setAppointment: (appointment: { appointmentDate: Date; appointmentTime: string }) => void
  setCustomerDetails: (customer: { customerEmail: string; customerFirstName: string; customerLastName: string; customerPhone?: string }) => void
  setSpecialRequests: (requests: string) => void
  setBusinessInfo: (business: { entrepreneurId: string; businessSlug: string; businessName: string }) => void
  updateBookingData: (data: Partial<BookingData>) => void
  resetBooking: () => void
  
  // Validation helpers
  isServiceSelected: () => boolean
  isAppointmentSelected: () => boolean
  isCustomerDetailsComplete: () => boolean
  canProceedToNextStep: (step: number) => boolean
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  const setService = (service: { serviceId: string; serviceName: string; serviceCategory: string; duration: number; totalAmount: number; serviceLocation: 'in-store' | 'home' }) => {
    dispatch({ type: 'SET_SERVICE', payload: service })
  }

  const setAppointment = (appointment: { appointmentDate: Date; appointmentTime: string }) => {
    dispatch({ type: 'SET_APPOINTMENT', payload: appointment })
  }

  const setCustomerDetails = (customer: { customerEmail: string; customerFirstName: string; customerLastName: string; customerPhone?: string }) => {
    dispatch({ type: 'SET_CUSTOMER_DETAILS', payload: customer })
  }

  const setSpecialRequests = (requests: string) => {
    dispatch({ type: 'SET_SPECIAL_REQUESTS', payload: { specialRequests: requests } })
  }

  const setBusinessInfo = (business: { entrepreneurId: string; businessSlug: string; businessName: string }) => {
    dispatch({ type: 'SET_BUSINESS_INFO', payload: business })
  }

  const updateBookingData = (data: Partial<BookingData>) => {
    dispatch({ type: 'UPDATE_BOOKING_DATA', payload: data })
  }

  const resetBooking = () => {
    // Clear sessionStorage when resetting
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('bookingState')
    }
    dispatch({ type: 'RESET_BOOKING' })
  }

  // Validation helpers
  const isServiceSelected = () => {
    return !!(state.bookingData.serviceId && state.bookingData.totalAmount && state.bookingData.serviceLocation)
  }

  const isAppointmentSelected = () => {
    return !!(state.bookingData.appointmentDate && state.bookingData.appointmentTime)
  }

  const isCustomerDetailsComplete = () => {
    return !!(state.bookingData.customerEmail && state.bookingData.customerName)
  }

  const canProceedToNextStep = (step: number) => {
    switch (step) {
      case 1: // Service selection
        return isServiceSelected()
      case 2: // Date & time
        return isServiceSelected() && isAppointmentSelected()
      case 3: // Customer details
        return isServiceSelected() && isAppointmentSelected() && isCustomerDetailsComplete()
      case 4: // Payment
        return isServiceSelected() && isAppointmentSelected() && isCustomerDetailsComplete()
      default:
        return false
    }
  }

  const value: BookingContextType = {
    state,
    dispatch,
    setService,
    setAppointment,
    setCustomerDetails,
    setSpecialRequests,
    setBusinessInfo,
    updateBookingData,
    resetBooking,
    isServiceSelected,
    isAppointmentSelected,
    isCustomerDetailsComplete,
    canProceedToNextStep,
  }

  return (
    <BookingContext.Provider value={value}>
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