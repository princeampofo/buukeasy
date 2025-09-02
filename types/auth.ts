// Auth-related types
export interface SignupData {
  firstName: string
  lastName: string
  email: string
  businessName: string
  password: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
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
  trialEndsAt?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean> // Updated signature
  signup: (userData: SignupData) => Promise<boolean>
  logout: () => Promise<void>
  refetch: () => Promise<void>
  error: string | null
}

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  signup: (userData: SignupData) => Promise<boolean>
  logout: () => Promise<void>
  refetch: () => Promise<void>
  error: string | null
}

export interface UserData {
  userId: string
  email: string
  businessName: string
}