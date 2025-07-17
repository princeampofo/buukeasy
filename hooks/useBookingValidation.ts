import { BookingState } from './useBookingState'

export interface ValidationErrors {
  [key: string]: string
}

export function useBookingValidation() {
  const validateServiceSelection = (state: BookingState): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {}
    
    if (!state.serviceId) {
      errors.service = 'Please select a service'
    }
    
    if (!state.serviceLocation) {
      errors.location = 'Please select a service location'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  const validateAppointmentSelection = (state: BookingState): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {}
    
    if (!state.selectedDate) {
      errors.date = 'Please select a date'
    }
    
    if (!state.selectedTime) {
      errors.time = 'Please select a time'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  const validateClientInfo = (state: BookingState): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {}
    const { clientInfo } = state
    
    if (!clientInfo.firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    
    if (!clientInfo.lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    
    if (!clientInfo.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(clientInfo.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    if (!clientInfo.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(clientInfo.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }
    
    if (state.serviceLocation === 'home' && !clientInfo.serviceAddress.trim()) {
      errors.serviceAddress = 'Service address is required for home services'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  const validatePaymentInfo = (state: BookingState): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {}
    const { paymentInfo } = state
    
    if (!paymentInfo.paymentType) {
      errors.paymentType = 'Please select a payment option'
    }
    
    if (!paymentInfo.paymentMethod) {
      errors.paymentMethod = 'Please select a payment method'
    }
    
    // Note: Card details validation is handled in payment component
    // to avoid storing sensitive data in localStorage
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
  
  const getBookingProgress = (state: BookingState): {
    currentStep: number
    totalSteps: number
    completedSteps: string[]
    canProceedToNext: boolean
    nextStepErrors?: ValidationErrors
  } => {
    const steps = ['service', 'appointment', 'details', 'payment']
    const completedSteps: string[] = []
    let currentStep = 0
    let canProceedToNext = false
    let nextStepErrors: ValidationErrors = {}
    
    // Check service selection
    const serviceValidation = validateServiceSelection(state)
    if (serviceValidation.isValid) {
      completedSteps.push('service')
      currentStep = Math.max(currentStep, 1)
    }
    
    // Check appointment selection
    const appointmentValidation = validateAppointmentSelection(state)
    if (appointmentValidation.isValid && completedSteps.includes('service')) {
      completedSteps.push('appointment')
      currentStep = Math.max(currentStep, 2)
    }
    
    // Check client info
    const clientValidation = validateClientInfo(state)
    if (clientValidation.isValid && completedSteps.includes('appointment')) {
      completedSteps.push('details')
      currentStep = Math.max(currentStep, 3)
    }
    
    // Check payment info (basic validation, not card details)
    const paymentValidation = validatePaymentInfo(state)
    if (paymentValidation.isValid && completedSteps.includes('details')) {
      completedSteps.push('payment')
      currentStep = Math.max(currentStep, 4)
    }
    
    // Determine if can proceed to next step
    switch (currentStep) {
      case 0:
        canProceedToNext = serviceValidation.isValid
        nextStepErrors = serviceValidation.errors
        break
      case 1:
        canProceedToNext = appointmentValidation.isValid
        nextStepErrors = appointmentValidation.errors
        break
      case 2:
        canProceedToNext = clientValidation.isValid
        nextStepErrors = clientValidation.errors
        break
      case 3:
        canProceedToNext = paymentValidation.isValid
        nextStepErrors = paymentValidation.errors
        break
      default:
        canProceedToNext = true
    }
    
    return {
      currentStep,
      totalSteps: steps.length,
      completedSteps,
      canProceedToNext,
      nextStepErrors: Object.keys(nextStepErrors).length > 0 ? nextStepErrors : undefined
    }
  }
  
  return {
    validateServiceSelection,
    validateAppointmentSelection,
    validateClientInfo,
    validatePaymentInfo,
    getBookingProgress
  }
}