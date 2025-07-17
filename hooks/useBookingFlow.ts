import { BookingState, useBookingState } from './useBookingState'
import { useBookingValidation } from './useBookingValidation'
import { useBookingNavigation } from './useBookingNavigation'

export function useBookingFlow(businessSlug: string) {
  const bookingState = useBookingState(businessSlug)
  const validation = useBookingValidation()
  const navigation = useBookingNavigation(businessSlug)
  
  const proceedToNextStep = () => {
    const progress = validation.getBookingProgress(bookingState.bookingState)
    
    if (!progress.canProceedToNext) {
      return { success: false, errors: progress.nextStepErrors }
    }
    
    const state = bookingState.bookingState
    
    switch (progress.currentStep) {
      case 1:
        if (state.serviceId && state.serviceLocation) {
          navigation.navigateToAppointment({
            service: state.serviceId,
            location: state.serviceLocation
          })
        }
        break
      case 2:
        if (state.serviceId && state.selectedDate && state.selectedTime && state.serviceLocation) {
          navigation.navigateToDetails({
            service: state.serviceId,
            date: state.selectedDate,
            time: state.selectedTime,
            location: state.serviceLocation
          })
        }
        break
      case 3:
        if (state.serviceId && state.selectedDate && state.selectedTime && state.serviceLocation) {
          navigation.navigateToPayment({
            service: state.serviceId,
            date: state.selectedDate,
            time: state.selectedTime,
            location: state.serviceLocation
          })
        }
        break
      default:
        return { success: false, errors: { general: 'Invalid step' } }
    }
    
    return { success: true }
  }
  
  return {
    ...bookingState,
    ...validation,
    ...navigation,
    proceedToNextStep
  }
}

// Utils for formatting and validation
export const formatCardNumber = (value: string): string => {
  return value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
}

export const formatExpiryDate = (value: string): string => {
  return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2')
}

export const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

export const generateBookingId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'BK-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateConfirmationNumber = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = 'CONF-'
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}