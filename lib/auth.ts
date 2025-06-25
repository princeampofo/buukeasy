// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    businessName: string
  }
}

export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
      // Get token from cookie
      const token = request.cookies.get('auth-token')?.value

      if (!token) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        )
      }

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
      ) as { userId: string; email: string; businessName: string }

      // Add user info to request
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.user = decoded

      return handler(authenticatedRequest)

    } catch (error) {
      console.error('Auth middleware error:', error)
      
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          { message: 'Invalid authentication token' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}

// Helper function to extract user from request
export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    ) as { userId: string; email: string; businessName: string }

    return decoded
  } catch (error) {
    return null
  }
}