// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Mock database - replace with real database in production
let mockUsers = [
  {
    id: '1',
    email: 'demo@bookeasy.com',
    password: '$2a$12$/vyWQN1YhTI1Z8A0HamzxenWYB7.rCpN6pBFifx4MZ6lm0wYYcCUy',
    firstName: 'Demo',
    lastName: 'User',
    businessName: 'Demo Business',
    createdAt: new Date(),
  }
]

const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  businessName: z.string().min(1, 'Business name is required').max(100, 'Business name too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
})

function generateUserId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

function generateBusinessSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = signupSchema.parse(body)
    const { firstName, lastName, email, businessName, password } = validatedData

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: generateUserId(),
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      businessName,
      businessSlug: generateBusinessSlug(businessName),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    }

    // Add to mock database
    mockUsers.push(newUser)

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        businessName: newUser.businessName 
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' }
    )

    // Create response with user data (excluding password)
    const userData = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      businessName: newUser.businessName,
      businessSlug: newUser.businessSlug,
      isActive: newUser.isActive,
      trialEndsAt: newUser.trialEndsAt,
    }

    // Set HTTP-only cookie with the token
    const response = NextResponse.json({
      message: 'Account created successfully',
      user: userData,
    }, { status: 201 })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: 'Invalid input data', 
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
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