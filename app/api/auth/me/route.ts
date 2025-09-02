// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db'

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
    ) as { userId: string; email: string; role: string }

    // Find user with entrepreneur profile
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        entrepreneurProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }


    // Return standardized user data
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      businessName: user.entrepreneurProfile?.businessName || null,
      businessSlug: user.entrepreneurProfile?.slug || null,
      isActive: user.entrepreneurProfile?.isActive || false,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      timezone: user.entrepreneurProfile?.timezone || null,
    }

    return NextResponse.json({
      user: userData,
    })

  } catch (error) {
    
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