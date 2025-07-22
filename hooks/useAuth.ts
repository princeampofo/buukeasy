// src/hooks/useAuth.ts
'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
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

// Define which routes require authentication
const PROTECTED_ROUTES = ['/admin']

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check if current route requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
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
        body: JSON.stringify({ email, password, rememberMe }),
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
    // Only check auth if:
    // 1. It's a protected route, OR
    // 2. forceCheck is true, OR
    // 3. We're not on a purely public route (for cases where user might be logged in)
    if (isProtectedRoute) {
      checkAuth()
    } else {
      // For public routes, just set loading to false without checking auth
      setLoading(false)
    }
  }, [pathname, isProtectedRoute])

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