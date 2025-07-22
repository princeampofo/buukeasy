// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '@/lib/db'
import type { SignupData } from '@/types/auth'
import { PrismaClient } from '@prisma/client'

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

async function generateUniqueSlug(businessName: string): Promise<string> {
  // Generate base slug
  let baseSlug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length

  let slug = baseSlug
  let counter = 1

  // Keep trying until we find a unique slug
  while (true) {
    // Check if slug exists
    const existing = await prisma.entrepreneurProfile.findUnique({
      where: { slug }
    })

    if (!existing) {
      return slug
    }

    // If exists, append counter and try again
    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validatedData = signupSchema.parse(body)
    const { firstName, lastName, email, businessName, password } = validatedData

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(businessName)

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user and entrepreneur profile in a transaction
    const result = await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: `${firstName} ${lastName}`,
          role: 'ENTREPRENEUR',
          isVerified: false,
        },
      })

      // Create entrepreneur profile
      const profile = await tx.entrepreneurProfile.create({
        data: {
          userId: user.id,
          businessName,
          slug,
          isActive: true,
          isVerified: false,
          timezone: 'Eastern Time',
          currency: 'USD',
          averageRating: 0,
          totalReviews: 0,
        },
      })

      // Create default notification settings
      await tx.notificationSettings.create({
        data: {
          entrepreneurId: profile.id,
          emailBookings: true,
          emailCancellations: true,
          emailReminders: true,
          smsBookings: false,
          smsCancellations: false,
          smsReminders: false,
          marketingEmails: true,
          weeklyReports: true,
        },
      })

      return { user, profile }
    })

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: '7d' }
    )

    // Split name into first and last name
    const [firstName = '', lastName = ''] = result.user.name.split(' ', 2)

    // Create standardized user data
    const userData = {
      id: result.user.id,
      email: result.user.email,
      firstName,
      lastName,
      role: result.user.role,
      isVerified: result.user.isVerified,
      businessName: result.profile.businessName,
      businessSlug: result.profile.slug,
      isActive: result.profile.isActive,
      createdAt: result.user.createdAt.toISOString(),
      updatedAt: result.user.updatedAt.toISOString()
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
      { message: 'Failed to create account' },
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