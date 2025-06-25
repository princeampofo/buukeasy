// src/hooks/useAuth.ts
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

interface UseAuthReturn {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  signup: (userData: SignupData) => Promise<boolean>
  logout: () => Promise<void>
  refetch: () => Promise<void>
  error: string | null
}

interface SignupData {
  firstName: string
  lastName: string
  email: string
  businessName: string
  password: string
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Important for cookies
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe }), // Include rememberMe flag
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        return true
      } else {
        const data = await response.json()
        setError(data.message || 'Login failed')
        return false
      }
    } catch (error) {
      setError('An error occurred during login')
      return false
    }
  }

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setError(null)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        return true
      } else {
        const data = await response.json()
        setError(data.message || 'Signup failed')
        return false
      }
    } catch (error) {
      setError('An error occurred during signup')
      return false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      router.push('/login')
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    refetch: checkAuth,
    error,
  }
}