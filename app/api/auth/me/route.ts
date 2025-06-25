// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mock database - same as in other auth routes
const mockUsers = [
  {
    id: '1',
    email: 'demo@bookeasy.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Demo',
    lastName: 'User',
    businessName: 'Demo Business',
    businessSlug: 'demo-business',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { message: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    ) as { userId: string; email: string; businessName: string }

    // Find user
    const user = mockUsers.find(u => u.id === decoded.userId)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
      businessSlug: user.businessSlug,
      isActive: user.isActive,
      trialEndsAt: user.trialEndsAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      user: userData,
    })

  } catch (error) {
    console.error('Get user error:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}