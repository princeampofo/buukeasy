// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '@/lib/db'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    const { email, password, rememberMe } = validatedData

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        entrepreneurProfile: true,
      },
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Determine token expiration based on rememberMe
    const tokenExpiry = rememberMe ? '7d' : '1d'
    const cookieMaxAge = rememberMe 
      ? 60 * 60 * 24 * 7  // 7 days in seconds
      : 60 * 60 * 24 // 1 day in seconds

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: tokenExpiry }
    )

    // Create standardized user data
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

    // Set HTTP-only cookie with appropriate expiration
    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
      rememberMe: rememberMe,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,
      path: '/',
    })

    return response

  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}