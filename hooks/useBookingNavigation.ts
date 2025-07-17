import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { BookingState } from './useBookingState'

export function useBookingNavigation(businessSlug: string) {
  const router = useRouter()
  
  const navigateToService = useCallback((params?: { 
    service?: number
    location?: string 
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.service) searchParams.set('service', params.service.toString())
    if (params?.location) searchParams.set('location', params.location)
    
    const query = searchParams.toString()
    router.push(`/book/${businessSlug}${query ? `?${query}` : ''}`)
  }, [router, businessSlug])
  
  const navigateToAppointment = useCallback((params: {
    service: number
    location: string
  }) => {
    const searchParams = new URLSearchParams({
      service: params.service.toString(),
      location: params.location
    })
    
    router.push(`/book/${businessSlug}/appointment?${searchParams.toString()}`)
  }, [router, businessSlug])
  
  const navigateToDetails = useCallback((params: {
    service: number
    date: string
    time: string
    location: string
  }) => {
    const searchParams = new URLSearchParams({
      service: params.service.toString(),
      date: params.date,
      time: params.time,
      location: params.location
    })
    
    router.push(`/book/${businessSlug}/details?${searchParams.toString()}`)
  }, [router, businessSlug])
  
  const navigateToPayment = useCallback((params: {
    service: number
    date: string
    time: string
    location: string
  }) => {
    const searchParams = new URLSearchParams({
      service: params.service.toString(),
      date: params.date,
      time: params.time,
      location: params.location
    })
    
    router.push(`/book/${businessSlug}/payment?${searchParams.toString()}`)
  }, [router, businessSlug])
  
  const navigateToConfirmation = useCallback((params: {
    booking: string
    paymentType: string
    location: string
    bookingId?: string
  }) => {
    const searchParams = new URLSearchParams({
      booking: params.booking,
      paymentType: params.paymentType,
      location: params.location
    })
    
    if (params.bookingId) {
      searchParams.set('bookingId', params.bookingId)
    }
    
    router.push(`/book/${businessSlug}/confirmation?${searchParams.toString()}`)
  }, [router, businessSlug])
  
  const navigateBack = useCallback(() => {
    router.back()
  }, [router])
  
  return {
    navigateToService,
    navigateToAppointment,
    navigateToDetails,
    navigateToPayment,
    navigateToConfirmation,
    navigateBack
  }
}