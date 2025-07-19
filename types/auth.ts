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
  address: string
  city: string
  state: string
  zipCode: string
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
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: 'ENTREPRENEUR' | 'ADMIN'
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  entrepreneurProfile?: EntrepreneurProfile
}
