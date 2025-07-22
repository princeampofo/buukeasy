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

    // Get notification settings
    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: user.userId }
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
    console.error('Notification Settings API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Update or create notification settings
    const settings = await prisma.notificationSettings.upsert({
      where: {
        userId: user.userId
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
        userId: user.userId,
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
    console.error('Update Notification Settings API Error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}