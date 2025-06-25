import { NextResponse } from 'next/server'

interface NotificationSettings {
  emailBookings: boolean
  emailCancellations: boolean
  emailReminders: boolean
  smsBookings: boolean
  smsCancellations: boolean
  smsReminders: boolean
  marketingEmails: boolean
  weeklyReports: boolean
}

// Temporary in-memory storage - replace with database
let notificationSettings: NotificationSettings = {
  emailBookings: false,
  emailCancellations: false,
  emailReminders: false,
  smsBookings: false,
  smsCancellations: false,
  smsReminders: false,
  marketingEmails: false,
  weeklyReports: false
}

export async function GET() {
  try {
    // TODO: Replace with actual database query
    // const settings = await db.notificationSettings.findFirst({
    //   where: { userId: currentUser.id }
    // })

    return NextResponse.json(notificationSettings)
  } catch (error) {
    console.error('Failed to fetch notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const data: NotificationSettings = await request.json()
    
    // Validate that all required fields are boolean
    const requiredFields = [
      'emailBookings', 'emailCancellations', 'emailReminders',
      'smsBookings', 'smsCancellations', 'smsReminders',
      'marketingEmails', 'weeklyReports'
    ]

    for (const field of requiredFields) {
      if (typeof data[field as keyof NotificationSettings] !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid value for ${field}. Must be true or false.` },
          { status: 400 }
        )
      }
    }

    // TODO: Replace with actual database update
    // const updatedSettings = await db.notificationSettings.upsert({
    //   where: { userId: currentUser.id },
    //   update: data,
    //   create: { ...data, userId: currentUser.id }
    // })

    // Update in-memory storage for now
    notificationSettings = { ...data }

    return NextResponse.json({ 
      message: 'Notification settings updated successfully',
      data: notificationSettings 
    })
  } catch (error) {
    console.error('Failed to update notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}