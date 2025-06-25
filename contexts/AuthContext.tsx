// src/contexts/AuthContext.tsx
'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  businessName: string
  businessSlug: string
  isActive: boolean
  trialEndsAt: string
  createdAt: string
  updatedAt: string
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  businessName: string
  password: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean> // Updated signature
  signup: (userData: SignupData) => Promise<boolean>
  logout: () => Promise<void>
  refetch: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}