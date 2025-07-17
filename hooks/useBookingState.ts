import { useCallback, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export interface Service {
  id: number
  name: string
  duration: number
  price: number
  homeServicePrice: number
  description: string
  category: string
  availableLocations: ('in-store' | 'home')[]
}

export interface ClientInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  notes: string
  serviceAddress: string
  addressNotes: string
  emailNotifications: boolean
  smsNotifications: boolean
}

export interface PaymentInfo {
  paymentType: 'full' | 'deposit'
  paymentMethod: 'card' | 'applepay' | 'googlepay' | 'paypal' | 'alipay' | 'wechatpay'
  // Note: No sensitive payment data stored in localStorage
  // Card details are handled in component state only
}

export interface BookingState {
  businessSlug: string
  serviceId: number | null
  serviceLocation: 'in-store' | 'home'
  selectedDate: string | null
  selectedTime: string | null
  clientInfo: ClientInfo
  paymentInfo: PaymentInfo
  lastUpdated: number
  sessionId: string
}

const getDefaultClientInfo = (): ClientInfo => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  notes: '',
  serviceAddress: '',
  addressNotes: '',
  emailNotifications: true,
  smsNotifications: true
})

const getDefaultPaymentInfo = (): PaymentInfo => ({
  paymentType: 'full',
  paymentMethod: 'card'
  // No sensitive payment data in default state
})

const generateSessionId = (): string => {
  return `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function useBookingState(businessSlug: string) {
  const storageKey = `booking_${businessSlug}`
  
  const getDefaultState = useCallback((): BookingState => ({
    businessSlug,
    serviceId: null,
    serviceLocation: 'in-store',
    selectedDate: null,
    selectedTime: null,
    clientInfo: getDefaultClientInfo(),
    paymentInfo: getDefaultPaymentInfo(),
    lastUpdated: Date.now(),
    sessionId: generateSessionId()
  }), [businessSlug])

  const [bookingState, setBookingState, clearBookingState] = useLocalStorage<BookingState>(
    storageKey,
    getDefaultState()
  )

  // Update specific parts of the booking state
  const updateService = useCallback((serviceId: number, serviceLocation: 'in-store' | 'home') => {
    setBookingState(prev => ({
      ...prev,
      serviceId,
      serviceLocation,
      lastUpdated: Date.now()
    }))
  }, [setBookingState])

  const updateAppointment = useCallback((date: string, time: string) => {
    setBookingState(prev => ({
      ...prev,
      selectedDate: date,
      selectedTime: time,
      lastUpdated: Date.now()
    }))
  }, [setBookingState])

  const updateClientInfo = useCallback((updates: Partial<ClientInfo>) => {
    setBookingState(prev => ({
      ...prev,
      clientInfo: { ...prev.clientInfo, ...updates },
      lastUpdated: Date.now()
    }))
  }, [setBookingState])

  const updatePaymentInfo = useCallback((updates: Partial<PaymentInfo>) => {
    setBookingState(prev => ({
      ...prev,
      paymentInfo: { ...prev.paymentInfo, ...updates },
      lastUpdated: Date.now()
    }))
  }, [setBookingState])

  // Reset the entire booking state
  const resetBookingState = useCallback(() => {
    setBookingState(getDefaultState())
  }, [setBookingState, getDefaultState])

  // Clean up old booking states on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage)
      const bookingKeys = keys.filter(key => key.startsWith('booking_'))
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
      
      bookingKeys.forEach(key => {
        try {
          const stored = localStorage.getItem(key)
          if (stored) {
            const state = JSON.parse(stored)
            if (state.lastUpdated && state.lastUpdated < oneDayAgo) {
              localStorage.removeItem(key)
            }
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Failed to cleanup old booking states:', error)
    }
  }, [])

  return {
    bookingState,
    updateService,
    updateAppointment,
    updateClientInfo,
    updatePaymentInfo,
    resetBookingState,
    clearBookingState
  }
}