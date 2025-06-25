import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  try {
    // TODO: Add authentication middleware
    // const user = await authenticateUser(request)
    
    // Mock data - replace with actual database queries
    const stats = [
      {
        name: 'Total Appointments',
        value: '142',
        change: '+12%',
        changeType: 'increase',
        icon: 'Calendar',
      },
      {
        name: 'New Clients',
        value: '28',
        change: '+4%',
        changeType: 'increase',
        icon: 'Users',
      },
      {
        name: 'Revenue',
        value: '$3,240',
        change: '+8%',
        changeType: 'increase',
        icon: 'DollarSign',
      },
      {
        name: 'Avg. Booking Rate',
        value: '89%',
        change: '-2%',
        changeType: 'decrease',
        icon: 'TrendingUp',
      },
    ]

    const upcomingAppointments = [
      {
        id: 1,
        clientName: 'Sarah Johnson',
        service: 'Hair Cut & Style',
        time: '10:00 AM',
        duration: 60,
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 2,
        clientName: 'Tom Brown',
        service: 'Nail Art',
        time: '11:30 AM',
        duration: 45,
        status: 'pending',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 3,
        clientName: 'Emily Davis',
        service: 'Massage Therapy',
        time: '1:00 PM',
        duration: 90,
        status: 'confirmed',
        date: new Date().toISOString().split('T')[0]
      },
      {
        id: 4,
        clientName: 'Mike Chen',
        service: 'Facial Treatment',
        time: '3:00 PM',
        duration: 30,
        status: 'cancelled',
        date: new Date().toISOString().split('T')[0]
      },
      // Add more appointments
    ]

    const recentActivity = [
      {
        id: 1,
        type: 'booking',
        message: 'New appointment booked by Sarah Johnson',
        time: '5 minutes ago',
        icon: 'CheckCircle',
        iconColor: 'text-green-500',
      },
      {
        id: 2,
        type: 'cancellation',
        message: 'Appointment cancelled by Tom Brown',
        time: '1 hour ago',
        icon: 'XCircle',
        iconColor: 'text-red-500',
      },
      {
        id: 3,
        type: 'reminder',
        message: 'Reminder sent to Emily Davis',
        time: '2 hours ago',
        icon: 'Clock',
        iconColor: 'text-blue-500',
      },
      {
        id: 4,
        type: 'payment',
        message: 'Payment received from Mike Chen',
        time: '3 hours ago',
        icon: 'DollarSign',
        iconColor: 'text-green-500',
      },
    ]

    return NextResponse.json({
      stats,
      upcomingAppointments,
      recentActivity
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}