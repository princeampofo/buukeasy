

// Business Information form data
export interface BusinessInfoFormData {
    businessName: string       // Business Name field
    ownerName: string         // Owner Name field (user.name)
    email: string             // Email field (user.email)
    phone: string             // Phone field
    address: string           // Address field
    city: string              // City field
    state: string             // State field
    zipCode: string           // ZIP Code field
    website?: string          // Website field
    businessDescription: string // Business Description textarea
    timezone: string          // Timezone dropdown
    currency: string          // Currency dropdown
  }
  
  // Security form data
  export interface SecurityFormData {
    currentPassword: string   // Current Password field
    newPassword: string       // New Password field
    confirmPassword: string   // Confirm New Password field
  }
  
  // Password requirements validation
  export interface PasswordRequirements {
    minLength: boolean        // At least 8 characters
    hasUppercase: boolean     // One uppercase letter
    hasLowercase: boolean     // One lowercase letter
    hasNumber: boolean        // One number
  }
  
  // Notification preferences form data
  export interface NotificationPreferences {
    // Email notifications
    emailNewBookings: boolean           // New appointment bookings
    emailCancellations: boolean         // Appointment cancellations
    emailDailyReminders: boolean        // Daily appointment reminders
    emailMarketingPromotions: boolean   // Marketing and promotional emails
    emailWeeklyReports: boolean         // Weekly business reports
    
    // SMS notifications
    smsNewBookings: boolean             // New appointment bookings
    smsCancellations: boolean           // Appointment cancellations
    smsReminders: boolean               // Appointment reminders
  }
  
  // Billing information
  export interface BillingInfo {
    currentPlan: {
      name: string                      // "Premium Plan"
      description: string               // "Unlimited appointments and advanced features"
      price: number                     // 29
      currency: string                  // "USD"
      interval: string                  // "month"
      nextBillingDate: string           // "July 18, 2025"
      features: string[]                // Array of plan features
    }
    paymentMethod: {
      last4: string                     // "4242"
      expiryDate: string               // "12/27"
      brand: string                    // "visa", "mastercard", etc.
    }
    recentInvoices: Array<{
      id: string
      date: string                      // "June 18, 2025"
      amount: number                    // 29.00
      status: 'paid' | 'pending' | 'failed'
      downloadUrl?: string
    }>
  }
  
  // Timezone options for dropdown
  export const TIMEZONE_OPTIONS = [
    { value: 'Eastern Time', label: 'Eastern Time (ET)' },
    { value: 'Central Time', label: 'Central Time (CT)' },
    { value: 'Mountain Time', label: 'Mountain Time (MT)' },
    { value: 'Pacific Time', label: 'Pacific Time (PT)' },
    { value: 'Alaska Time', label: 'Alaska Time (AT)' },
    { value: 'Hawaii Time', label: 'Hawaii Time (HT)' }
  ] as const
  
  // Currency options for dropdown
  export const CURRENCY_OPTIONS = [
    { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
    { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
    { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
    { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' }
  ] as const
  
  // Settings tab navigation
  export interface SettingsTab {
    id: 'business' | 'notifications' | 'security' | 'billing'
    label: string
    icon: string
  }
  
  export const SETTINGS_TABS: SettingsTab[] = [
    { id: 'business', label: 'Business Info', icon: 'building' },
    { id: 'notifications', label: 'Notifications', icon: 'bell' },
    { id: 'security', label: 'Security', icon: 'shield' },
    { id: 'billing', label: 'Billing', icon: 'credit-card' }
  ]
  
  // API response types for settings
  export interface SettingsApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
  }
  
  // Form validation types
  export interface FormValidationErrors {
    [fieldName: string]: string | undefined
  }
  
  export interface FormValidationResult {
    isValid: boolean
    errors: FormValidationErrors
  }
  
  // Settings update payloads
  export interface UpdateBusinessInfoPayload {
    businessName?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    website?: string
    description?: string
    timezone?: string
    currency?: string
  }
  
  export interface UpdateNotificationPayload {
    emailNewBookings?: boolean
    emailCancellations?: boolean
    emailDailyReminders?: boolean
    emailMarketingPromotions?: boolean
    emailWeeklyReports?: boolean
    smsNewBookings?: boolean
    smsCancellations?: boolean
    smsReminders?: boolean
  }
  
  export interface ChangePasswordPayload {
    currentPassword: string
    newPassword: string
  }
  
  // Subscription and billing types
  export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' | 'TRIALING'
  export type InvoiceStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  
  export interface SubscriptionPlan {
    id: string
    name: string
    description: string
    price: number
    currency: string
    interval: 'month' | 'year'
    features: string[]
    isActive: boolean
  }
  
  export interface UserSubscription {
    id: string
    planId: string
    status: SubscriptionStatus
    currentPeriodStart: Date
    currentPeriodEnd: Date
    nextBillingDate?: Date
    cancelAtPeriodEnd: boolean
    plan: SubscriptionPlan
  }