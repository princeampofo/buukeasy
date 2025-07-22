import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('userId')
      
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID required' },
          { status: 400 }
        )
      }
  
      const settings = await prisma.notificationSettings.findUnique({
        where: { userId }
      })
  
      // Return default settings if none exist
      const notificationPreferences = settings || {
        emailNewBookings: true,
        emailCancellations: true,
        emailDailyReminders: false,
        emailMarketingPromotions: false,
        emailWeeklyReports: true,
        smsNewBookings: false,
        smsCancellations: false,
        smsReminders: false
      }
  
      return NextResponse.json({ success: true, data: notificationPreferences })
    } catch (error) {
      console.error('Notification settings fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notification preferences' },
        { status: 500 }
      )
    }
  }
  
  export async function PUT(request: NextRequest) {
    try {
      const body = await request.json()
      const { userId, ...preferences } = body
  
      await prisma.notificationSettings.upsert({
        where: { userId },
        update: preferences,
        create: {
          userId,
          ...preferences
        }
      })
  
      return NextResponse.json({ 
        success: true, 
        message: 'Notification preferences saved successfully' 
      })
    } catch (error) {
      console.error('Notification settings update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save notification preferences' },
        { status: 500 }
      )
    }
  }