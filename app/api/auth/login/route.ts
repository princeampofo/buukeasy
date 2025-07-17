// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// In a real app, you'd use a database like Prisma, Supabase, or MongoDB
// For now, this is a mock implementation
const mockUsers = [
  {
    id: '1',
    email: 'demo@bookmyslot.com',
    password: '$2a$12$Ld1LcgeR3bPwwU9cWLiSHe5LqJswoi0iuW3kpkKgtrLjWtbzv.lUm', // hashed "demo123"
    firstName: 'Demo',
    lastName: 'User',
    businessName: 'Demo Business',
    createdAt: new Date(),
  }
]

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false), // Add rememberMe validation
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    const { email, password, rememberMe } = validatedData

    // Find user by email
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    console.log(isPasswordValid ? 'Password is valid' : 'Password is invalid')
    
    if (!isPasswordValid) {
      console.error('Login failed: Invalid password for user:', email)
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Determine token expiration based on rememberMe
    const tokenExpiry = rememberMe ? '7d' : '1d'  // 30 days vs 0 days
    const cookieMaxAge = rememberMe 
      ? 60 * 60 * 24 * 7  // 7 days in seconds
      : 60 * 60 * 24 // 1 days in seconds

    // Generate JWT token with appropriate expiration
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        businessName: user.businessName,
        rememberMe: rememberMe  // Store rememberMe flag in token
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: tokenExpiry }
    )

    // Create response with user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      businessName: user.businessName,
    }

    // Set HTTP-only cookie with appropriate expiration
    const response = NextResponse.json({
      message: 'Login successful',
      user: userData,
      rememberMe: rememberMe, // Let frontend know the remember me status
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: cookieMaxAge,  // Dynamic based on rememberMe
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    
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