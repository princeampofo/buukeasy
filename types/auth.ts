// Auth-related types
export interface SignupData {
  firstName: string
  lastName: string
  email: string
  businessName: string
  password: string
}

export interface EntrepreneurProfile {
  id: string
  userId: string
  businessName: string
  description?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  website?: string
  timezone: string
  currency: string
  latitude?: number
  longitude?: number
  isActive: boolean
  isVerified: boolean
  averageRating: number
  totalReviews: number
  bankAccount?: string
  taxId?: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isVerified: boolean
  businessName: string | null
  businessSlug: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
