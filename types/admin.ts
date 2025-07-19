// types/admin.ts 

// Service form data
export interface ServiceFormData {
    name: string                    // Service Name field
    category: string                // Category dropdown
    description: string             // Description textarea
    duration: number                // Duration (minutes) field
    price: number                   // Price ($) field
    bufferTime: number              // Buffer Time (minutes) field
    requireDeposit: boolean         // "Require deposit for booking" checkbox
    minAdvanceHours: number         // "Minimum Advance Booking (hours)" field
    maxAdvanceDays: number          // "Maximum Advance Booking (days)" field
    specialInstructions: string     // "Special Instructions" textarea
    serviceImage?: File             // Image upload
  }
  
  // Availability data 
  export interface TimeSlotData {
    dayOfWeek: number              // 0-6 (Sunday-Saturday) from checkboxes
    startTime: string              // "From" time picker (e.g., "09:00 AM")
    endTime: string                // "to" time picker (e.g., "12:00 PM")
    isActive: boolean              // Whether this slot is active
  }
  
  export interface AvailabilitySettings {
    monday: TimeSlotData[]         // Multiple time slots per day
    tuesday: TimeSlotData[]
    wednesday: TimeSlotData[]
    thursday: TimeSlotData[]
    friday: TimeSlotData[]
    saturday: TimeSlotData[]
    sunday: TimeSlotData[]
  }
  
  // Appointment data 
  export interface AppointmentTableRow {
    id: string
    customerName: string           // Customer name display
    customerEmail: string          // Email shown in table
    customerPhone: string          // Phone shown in table
    serviceName: string            // Service type
    appointmentDate: string        // Date (e.g., "June 18, 2025")
    appointmentTime: string        // Time (e.g., "at 10:00")
    duration: number               // Duration in minutes (e.g., "60 min")
    price: number                  // Price (e.g., "$75.00")
    status: 'confirmed' | 'cancelled' | 'completed' | 'modified' | 'pending'
    notes?: string                 // Special notes/requests
  }
  
  // Filters for appointments table
  export interface AppointmentFilters {
    searchTerm: string             // Search appointments input
    status: string                 // "All Status" dropdown
    date: string                   // Date picker filter
  }
  
  // Service categories
  export const SERVICE_CATEGORIES = [
    'Hair Services',
    'Nail Care', 
    'Skin Care',
    'Barbering',
    'Beauty Treatment',
    'Massage',
    'Other'
  ] as const
  
  export type ServiceCategory = typeof SERVICE_CATEGORIES[number]
  
  // Appointment statuses
  export const APPOINTMENT_STATUSES = [
    'pending',
    'confirmed', 
    'completed',
    'cancelled',
    'modified',
    'no_show'
  ] as const
  
  export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number]
  
  // Days of week for availability
  export const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ] as const
  
  // Time options for availability form
  export const TIME_OPTIONS = [
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
    '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM',
    '10:00 PM'
  ] as const
  
  // API response types
  export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }
  
  // Validation schemas (for form validation)
  export interface ServiceValidation {
    name: {
      required: boolean
      minLength?: number
      maxLength?: number
    }
    category: {
      required: boolean
    }
    description: {
      required: boolean
      maxLength?: number
    }
    duration: {
      required: boolean
      min: number
      max: number
    }
    price: {
      required: boolean
      min: number
    }
  }