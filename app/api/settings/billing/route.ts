import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-middleware'

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get billing information
    const billingInfo = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        entrepreneurProfile: {
          select: {
            businessName: true,
            currency: true
          }
        }
      }
    })

    if (!billingInfo) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(billingInfo)
  } catch (error) {
    console.error('Billing API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch billing information' },
      { status: 500 }
    )
  }
}