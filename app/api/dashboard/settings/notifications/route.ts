import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth-middleware'
import type { UserData } from '@/types/auth'

export const GET = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    // Get the authenticated user
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // find the related entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    // Get notification settings
    const settings = await prisma.notificationSettings.findFirst({
      where: { entrepreneurId: entrepreneurProfile.id }
    })

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        emailBookings: true,
        emailCancellations: true,
        emailReminders: true,
        smsBookings: false,
        smsCancellations: false,
        smsReminders: false,
        marketingEmails: true,
        weeklyReports: true
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
})

export const PUT = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    // Get user id from user data
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // get entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: userId }
    })
    
    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }
    
    const data = await request.json()
    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: {
        entrepreneurId: entrepreneurProfile?.id
      },
      update: {
        emailBookings: data.emailBookings,
        emailCancellations: data.emailCancellations,
        emailReminders: data.emailReminders,
        smsBookings: data.smsBookings,
        smsCancellations: data.smsCancellations,
        smsReminders: data.smsReminders,
        marketingEmails: data.marketingEmails,
        weeklyReports: data.weeklyReports
      },
      create: {
        entrepreneurId: entrepreneurProfile?.id,
        emailBookings: data.emailBookings ?? true,
        emailCancellations: data.emailCancellations ?? true,
        emailReminders: data.emailReminders ?? true,
        smsBookings: data.smsBookings ?? false,
        smsCancellations: data.smsCancellations ?? false,
        smsReminders: data.smsReminders ?? false,
        marketingEmails: data.marketingEmails ?? true,
        weeklyReports: data.weeklyReports ?? true
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
})