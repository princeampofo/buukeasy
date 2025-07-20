import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import { calculatePercentageChange } from '@/lib/util'

export async function GET() {
  try {
    // Get the current date range
    const today = new Date()
    const startOfToday = new Date(today.setHours(0, 0, 0, 0))
    const endOfToday = new Date(today.setHours(23, 59, 59, 999))
    
    // Get the previous period for comparison (last month)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    // Fetch current period stats
    const [
      currentAppointments,
      currentNewClientsResult,
      currentRevenue,
      currentBookings
    ] = await prisma.$transaction([
      // Total appointments
      prisma.booking.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      
      // New clients (unique customers today)
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        },
        select: {
          customerEmail: true
        }
      }),
      
      // Revenue
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday
          },
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Total booking slots vs booked slots for booking rate
      prisma.booking.count({
        where: {
          appointmentDate: {
            gte: startOfToday,
            lte: endOfToday
          },
          status: {
            in: ['CONFIRMED', 'COMPLETED']
          }
        }
      })
    ])

    // Fetch previous period stats
    const [
      previousAppointments,
      previousNewClientsResult,
      previousRevenue,
      previousBookings
    ] = await prisma.$transaction([
      // Previous period appointments
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(lastMonth.setHours(0, 0, 0, 0)),
            lte: new Date(lastMonth.setHours(23, 59, 59, 999))
          }
        }
      }),
      
      // Previous period new clients
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: new Date(lastMonth.setHours(0, 0, 0, 0)),
            lte: new Date(lastMonth.setHours(23, 59, 59, 999))
          }
        },
        select: {
          customerEmail: true
        }
      }),
      
      // Previous period revenue
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: new Date(lastMonth.setHours(0, 0, 0, 0)),
            lte: new Date(lastMonth.setHours(23, 59, 59, 999))
          },
          status: 'PAID'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Previous period booking rate
      prisma.booking.count({
        where: {
          appointmentDate: {
            gte: new Date(lastMonth.setHours(0, 0, 0, 0)),
            lte: new Date(lastMonth.setHours(23, 59, 59, 999))
          },
          status: {
            in: ['CONFIRMED', 'COMPLETED']
          }
        }
      })
    ])

    // Calculate unique clients
    const currentNewClients = new Set(currentNewClientsResult.map((b: { customerEmail: any }) => b.customerEmail)).size
    const previousNewClients = new Set(previousNewClientsResult.map((b: { customerEmail: any }) => b.customerEmail)).size

    const stats = [
      {
        name: 'Total Appointments',
        value: currentAppointments.toString(),
        change: calculatePercentageChange(previousAppointments, currentAppointments),
        changeType: currentAppointments >= previousAppointments ? 'increase' : 'decrease',
        icon: 'Calendar',
      },
      {
        name: 'New Clients',
        value: currentNewClients.toString(),
        change: calculatePercentageChange(previousNewClients, currentNewClients),
        changeType: currentNewClients >= previousNewClients ? 'increase' : 'decrease',
        icon: 'Users',
      },
      {
        name: 'Revenue',
        value: `$${(currentRevenue._sum.amount || 0).toFixed(2)}`,
        change: calculatePercentageChange(
          previousRevenue._sum.amount || 0,
          currentRevenue._sum.amount || 0
        ),
        changeType: (currentRevenue._sum.amount || 0) >= (previousRevenue._sum.amount || 0) ? 'increase' : 'decrease',
        icon: 'DollarSign',
      },
      {
        name: 'Avg. Booking Rate',
        value: `${Math.round((currentBookings / (currentBookings + 2)) * 100)}%`, // Assuming 2 available slots per booked slot
        change: calculatePercentageChange(
          (previousBookings / (previousBookings + 2)) * 100,
          (currentBookings / (currentBookings + 2)) * 100
        ),
        changeType: currentBookings >= previousBookings ? 'increase' : 'decrease',
        icon: 'TrendingUp',
      },
    ]

    // Fetch today's appointments
    const upcomingAppointments = await prisma.booking.findMany({
      where: {
        appointmentDate: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      include: {
        service: true
      },
      orderBy: {
        appointmentTime: 'asc'
      }
    })

    // Fetch recent activity
    const recentActivity = await prisma.booking.findMany({
      where: {
        OR: [
          { status: 'CONFIRMED' },
          { status: 'CANCELLED' },
          { status: 'COMPLETED' }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10,
      include: {
        payment: true
      }
    })

    // Transform appointments and activity for frontend
    const formattedAppointments = upcomingAppointments.map((appt: { id: any; customerName: any; service: { name: any }; appointmentTime: any; duration: any; status: string; appointmentDate: { toISOString: () => string } }) => ({
      id: appt.id,
      clientName: appt.customerName,
      service: appt.service.name,
      time: appt.appointmentTime,
      duration: appt.duration,
      status: appt.status.toLowerCase(),
      date: appt.appointmentDate.toISOString().split('T')[0]
    }))

    const formattedActivity = recentActivity.map((activity: { customerName: any; status: string; payment: { status: string } | null; id: any; updatedAt: Date }) => {
      let activityType = {
        type: 'booking',
        icon: 'CheckCircle',
        iconColor: 'text-green-500',
        message: `New appointment booked by ${activity.customerName}`
      }

      if (activity.status === 'CANCELLED') {
        activityType = {
          type: 'cancellation',
          icon: 'XCircle',
          iconColor: 'text-red-500',
          message: `Appointment cancelled by ${activity.customerName}`
        }
      } else if (activity.payment?.status === 'PAID') {
        activityType = {
          type: 'payment',
          icon: 'DollarSign',
          iconColor: 'text-green-500',
          message: `Payment received from ${activity.customerName}`
        }
      }

      return {
        id: activity.id,
        ...activityType,
        time: formatTimeAgo(activity.updatedAt)
      }
    })

    return NextResponse.json({
      stats,
      upcomingAppointments: formattedAppointments,
      recentActivity: formattedActivity
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// Helper function to format time ago
function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
}