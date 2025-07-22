

// Business settings
export interface BusinessSettings {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  website: string
  businessDescription: string
  timezone: string
  currency: string
}

// Notification settings
export interface NotificationSettings {
  emailBookings: boolean
  emailCancellations: boolean
  emailReminders: boolean
  smsBookings: boolean
  smsCancellations: boolean
  smsReminders: boolean
  marketingEmails: boolean
  weeklyReports: boolean
}

// Security settings
export interface SecuritySettings {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Settings navigation
export interface SettingsTab {
  id: 'business' | 'notifications' | 'security'
  label: string
  icon: string
}

export const SETTINGS_TABS: SettingsTab[] = [
  { id: 'business', label: 'Business', icon: 'building' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'security', label: 'Security', icon: 'shield' }
]