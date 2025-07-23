import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import type { UserData } from '@/types/auth'

// Helper function to extract and verify user from request
export async function getUserFromRequest(request: NextRequest): Promise<UserData | null> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    // Throw error if no JWT secret in production
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is required')
    }

    const decoded = jwt.verify(token, jwtSecret) as UserData
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

export function withAuth(
  handler: (request: NextRequest, user: UserData) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    try {
      const user = await getUserFromRequest(request)
      
      if (!user) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        )
      }

      return handler(request, user)

    } catch (error) {
      console.error('Auth middleware error:', error)
      
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      )
    }
  }
}