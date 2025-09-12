// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth-middleware'
import type { UserData } from '@/types/auth'
import { DateTime } from 'luxon'

export const GET = withAuth(async (_request: NextRequest, user: UserData) => {
  try {
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the entrepreneur profile ID
    const entrepreneurProfile = await prisma.entrepreneurProfile.findUnique({
      where: { userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    const entrepreneurId = entrepreneurProfile.id

    // Get date ranges
    const today = DateTime.now().setZone(entrepreneurProfile.timezone || 'Asia/Dubai')
    const startOfToday = today.startOf('day')
    const endOfToday = today.endOf('day')

    // Get start of current week (Sunday)
    const startOfWeek = today.minus({ days: today.weekday % 7 }).startOf('day');
    const endOfWeek = startOfWeek.plus({ days: 6 }).endOf('day');
    
    // Get start and end of current month
    const startOfMonth = today.startOf('month')
    const endOfMonth = today.endOf('month')

    // Current time for next appointment
    const now = DateTime.now().setZone(entrepreneurProfile.timezone || 'Asia/Dubai')

    // 1. Monthly Estimated Revenue (from completed payments for bookings in current month)
    const monthlyBookingsWithPayments = await prisma.booking.findMany({
      where: {
        entrepreneurId: entrepreneurId,
        appointmentDate: {
          gte: startOfMonth.toISODate(),
          lte: endOfMonth.toISODate()
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED']
        }
      },
      include: {
        payment: {
          where: {
            status: 'COMPLETED'
          }
        }
      }
    })

    let monthlyRevenue = 0

    for (const booking of monthlyBookingsWithPayments) {
      if (booking.payment) {
        monthlyRevenue += booking.payment.serviceAmount || 0
      }
    }


    // 2. This Week's Bookings Count (using appointment date)
    const thisWeekBookings = await prisma.booking.count({
      where: {
        entrepreneurId: entrepreneurId,
        appointmentDate: {
          gte: startOfWeek,
          lte: endOfWeek
        },
        status: {
          in: ['CONFIRMED', 'COMPLETED', 'NO_SHOW']
        }
      }
    })

    // 3. Today's Bookings Count (using appointment date)
    const todaysBookings = await prisma.booking.count({
      where: {
        entrepreneurId: entrepreneurId,
        appointmentDate: startOfToday.toISODate(),
        status: {
          in: ['CONFIRMED', 'COMPLETED']
        }
      }
    })

    // 4. Next Upcoming Appointment
    const nextAppointment = await prisma.booking.findFirst({
      where: {
        entrepreneurId: entrepreneurId,
        appointmentDate: {
          gte: now.toISODate()
        },
        status: {
          in: ['CONFIRMED']
        }
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { appointmentDate: 'asc' },
        { appointmentTime: 'asc' }
      ]
    })


  // Calculate next appointment display value
  const getNextAppointmentValue = () => {
    if (!nextAppointment) return 'None scheduled';

    const datePart = nextAppointment.appointmentDate;

    // time is already in 24-hour format
    const timeStr = nextAppointment.appointmentTime.trim();
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);

    if (!timeMatch) return 'Invalid time format';

    let [hoursStr, minutesStr ] = timeMatch;
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);


    const appointmentDateTime = DateTime.fromISO(`${datePart}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`, { zone: entrepreneurProfile.timezone || 'Asia/Dubai' });

    const now = DateTime.now().setZone(entrepreneurProfile.timezone || 'Asia/Dubai');
    const diffInMinutes = Math.floor((appointmentDateTime.toMillis() - now.toMillis()) / (1000 * 60));

    if (diffInMinutes < 0) return 'None scheduled';
    if (diffInMinutes < 60) return `In ${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `In ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `In ${diffInDays}d`;
  };

    const stats = [
      {
        name: "Monthly Revenue",
        value: `$${monthlyRevenue.toFixed(2)}`,
        change: 'Projected earnings',
        changeType: 'increase' as const,
        icon: 'DollarSign',
      },
      {
        name: "This Week's Bookings",
        value: thisWeekBookings.toString(),
        change: 'Scheduled appointments',
        changeType: 'increase' as const,
        icon: 'Calendar',
      },
      {
        name: "Today's Bookings",
        value: todaysBookings.toString(),
        change: 'Scheduled for today',
        changeType: 'increase' as const,
        icon: 'Users',
      },
      {
        name: 'Next Appointment',
        value: getNextAppointmentValue(),
        change: nextAppointment ? nextAppointment.service.name : 'No upcoming appointments',
        changeType: 'increase' as const,
        icon: 'Clock',
      },
    ]

    // Fetch today's appointments for the appointments section
    const upcomingAppointments = await prisma.booking.findMany({
      where: {
        entrepreneurId: entrepreneurId,
        appointmentDate: {
          gte: startOfToday.toISODate(),
          lte: endOfToday.toISODate()
        }
      },
      include: {
        service: {
          select: {
            name: true,
            duration: true
          }
        }
      },
      orderBy: {
        appointmentTime: 'asc'
      }
    })

    // Fetch recent activity - include payment information with timestamps
    // const recentActivity = await prisma.booking.findMany({
    //   where: {
    //     entrepreneurId: entrepreneurId,
    //     OR: [
    //       { status: 'CONFIRMED' },
    //       { status: 'CANCELLED' },
    //       { status: 'COMPLETED' },
    //     ]
    //   },
    //   orderBy: {
    //     createdAt: 'desc'
    //   },
    //   take: 10,
    //   include: {
    //     payment: {
    //       select: {
    //         id: true,
    //         status: true,
    //         createdAt: true,
    //         netAmount: true
    //       }
    //     }
    //   }
    // })


    // Transform appointments for frontend
    const formattedAppointments = upcomingAppointments.map((appt) => ({
      id: appt.id,
      clientName: appt.customerFirstName,
      service: appt.service.name,
      time: appt.appointmentTime,
      duration: `${appt.service.duration} min`,
      status: appt.status.toLowerCase(),
      date: appt.appointmentDate
    }))

    // Transform recent activity for frontend - Show both booking and payment events separately
    // const formattedActivity: any[] = []
    
    // recentActivity.forEach((activity) => {
    //   // Always add the booking/appointment event first
    //   let bookingActivityType = {
    //     type: 'booking',
    //     icon: 'Calendar',
    //     iconColor: 'text-blue-500',
    //     message: `New appointment booked by ${activity.customerFirstName}`
    //   }

    //   if (activity.status === 'CANCELLED') {
    //     bookingActivityType = {
    //       type: 'cancellation',
    //       icon: 'XCircle',
    //       iconColor: 'text-red-500',
    //       message: `Appointment cancelled by ${activity.customerFirstName}`
    //     }
    //   } else if (activity.status === 'COMPLETED') {
    //     bookingActivityType = {
    //       type: 'completion',
    //       icon: 'CheckCircle',
    //       iconColor: 'text-blue-500',
    //       message: `Appointment completed with ${activity.customerFirstName}`
    //     }
    //   } else if (activity.status === 'NO_SHOW') {
    //     bookingActivityType = {
    //       type: 'no-show',
    //       icon: 'AlertCircle',
    //       iconColor: 'text-orange-500',
    //       message: `${activity.customerFirstName} was a no-show`
    //     }
    //   }

    //   // Add the booking activity
    //   formattedActivity.push({
    //     id: `${activity.id}-booking`,
    //     ...bookingActivityType,
    //     time: formatTimeAgo(activity.createdAt) // Use createdAt for booking time
    //   })

    //   // // If there's a completed payment, add it as a separate activity
    //   // if (activity.payment && activity.payment.status === 'COMPLETED') {
    //   //   formattedActivity.push({
    //   //     id: `${activity.id}-payment`,
    //   //     type: 'payment',
    //   //     icon: 'DollarSign',
    //   //     iconColor: 'text-green-500',
    //   //     message: `Deposit received from ${activity.customerFirstName}`,
    //   //     time: formatTimeAgo(activity.payment.createdAt) // Use payment creation time
    //   //   })
    //   // }
    // })

    // // Sort by date and time
    // formattedActivity.sort((a, b) => {
    //   const timeA = new Date().getTime() - parseTimeAgo(a.time)
    //   const timeB = new Date().getTime() - parseTimeAgo(b.time)
    //   return timeB - timeA
    // })

    // Take only the most recent 15 activities
    // const finalFormattedActivity = formattedActivity.slice(0, 15)
    const finalFormattedActivity : any[] = [] // Empty array since recent activity is disabled for now

    // Return all the data

    return NextResponse.json({
      stats,
      upcomingAppointments: formattedAppointments,
      recentActivity: finalFormattedActivity,
      nextAppointment: nextAppointment ? {
        id: nextAppointment.id,
        clientName: nextAppointment.customerFirstName,
        service: nextAppointment.service.name,
        time: nextAppointment.appointmentTime,
        date: nextAppointment.appointmentDate
      } : null
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
})

// Helper function to format time ago
// function formatTimeAgo(date: Date) {
//   const now = new Date()
//   const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
//   if (diffInMinutes < 60) {
//     return `${diffInMinutes} min${diffInMinutes !== 1 ? 's' : ''} ago`
//   }
  
//   const diffInHours = Math.floor(diffInMinutes / 60)
//   if (diffInHours < 24) {
//     return `${diffInHours} hr${diffInHours !== 1 ? 's' : ''} ago`
//   }
  
//   const diffInDays = Math.floor(diffInHours / 24)
//   return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
// }

// Helper function to parse time ago string back to minutes for sorting
// function parseTimeAgo(timeAgoString: string): number {
//   const parts = timeAgoString.split(' ')
//   const value = parseInt(parts[0])
//   const unit = parts[1]
  
//   if (unit.includes('minute')) {
//     return value
//   } else if (unit.includes('hour')) {
//     return value * 60
//   } else if (unit.includes('day')) {
//     return value * 60 * 24
//   }
  
//   return 0
// }