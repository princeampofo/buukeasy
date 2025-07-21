import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth-middleware'

// Helper function to calculate progress width
const calculateProgressWidth = (value: number, maxValue: number): string => {
  if (maxValue === 0) return '0%'
  return `${(value / maxValue * 100).toFixed(1)}%`
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Helper function to calculate percentage change
const calculateChange = (current: number, previous: number): { change: string; changeType: 'increase' | 'decrease' } => {
  if (previous === 0) return { change: '+0%', changeType: 'increase' }
  
  const percentChange = ((current - previous) / previous) * 100
  const isIncrease = percentChange >= 0
  
  return {
    change: `${isIncrease ? '+' : ''}${percentChange.toFixed(1)}%`,
    changeType: isIncrease ? 'increase' : 'decrease'
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = parseInt(searchParams.get('period') || '30')

    // Get the authenticated user
    const user = await getUserFromRequest(request as any)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: user.userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    // Calculate date ranges
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000)

    // Base where clause for all queries
    const baseWhereClause = {
      providerId: entrepreneurProfile.id
    }

    // Fetch current period data
    const [
      currentRevenue,
      currentAppointments,
      currentNewClientsData,
      currentRatings,
      currentNoShows,
      currentBookingRate
    ] = await prisma.$transaction([
      // Total revenue
      prisma.booking.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          ...baseWhereClause,
          createdAt: { gte: startDate, lte: endDate },
          payment: {
            status: 'PAID'
          }
        }
      }),

      // Total appointments
      prisma.booking.count({
        where: {
          ...baseWhereClause,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),

      // New clients - using groupBy for distinct count
      prisma.booking.groupBy({
        by: ['customerEmail'],
        where: {
          ...baseWhereClause,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),

      // Average ratings
      prisma.review.aggregate({
        _avg: {
          rating: true
        },
        where: {
          booking: {
            ...baseWhereClause,
            createdAt: { gte: startDate, lte: endDate }
          }
        }
      }),

      // No-shows
      prisma.booking.count({
        where: {
          ...baseWhereClause,
          appointmentDate: { gte: startDate, lte: endDate },
          status: 'NO_SHOW'
        }
      }),

      // Total bookings for rate calculation
      prisma.booking.count({
        where: {
          ...baseWhereClause,
          appointmentDate: { gte: startDate, lte: endDate },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      })
    ])

    // Extract unique client count from groupBy result
    const currentNewClients = currentNewClientsData.length

    // Fetch previous period data with the same base where clause
    const [
      previousRevenue,
      previousAppointments,
      previousNewClientsData,
      previousRatings,
      previousNoShows,
      previousBookingRate
    ] = await prisma.$transaction([
      prisma.booking.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          ...baseWhereClause,
          createdAt: { gte: previousStartDate, lte: startDate },
          payment: {
            status: 'PAID'
          }
        }
      }),

      prisma.booking.count({
        where: {
          ...baseWhereClause,
          createdAt: { gte: previousStartDate, lte: startDate }
        }
      }),

      // New clients - using groupBy for distinct count
      prisma.booking.groupBy({
        by: ['customerEmail'],
        where: {
          ...baseWhereClause,
          createdAt: { gte: previousStartDate, lte: startDate }
        }
      }),

      prisma.review.aggregate({
        _avg: {
          rating: true
        },
        where: {
          booking: {
            ...baseWhereClause,
            createdAt: { gte: previousStartDate, lte: startDate }
          }
        }
      }),

      prisma.booking.count({
        where: {
          ...baseWhereClause,
          appointmentDate: { gte: previousStartDate, lte: startDate },
          status: 'NO_SHOW'
        }
      }),

      prisma.booking.count({
        where: {
          ...baseWhereClause,
          appointmentDate: { gte: previousStartDate, lte: startDate },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      })
    ])

    // Extract unique client count from groupBy result
    const previousNewClients = previousNewClientsData.length

    // Calculate rates and changes - handle division by zero
    const currentNoShowRate = currentAppointments > 0 ? (currentNoShows / currentAppointments) * 100 : 0
    const previousNoShowRate = previousAppointments > 0 ? (previousNoShows / previousAppointments) * 100 : 0
    const currentBookingRateValue = (currentBookingRate + currentNoShows) > 0 
      ? (currentBookingRate / (currentBookingRate + currentNoShows)) * 100 
      : 0
    const previousBookingRateValue = (previousBookingRate + previousNoShows) > 0 
      ? (previousBookingRate / (previousBookingRate + previousNoShows)) * 100 
      : 0

    // Monthly revenue data (last 6 months)
    const monthlyData = await prisma.$transaction(
      Array.from({ length: 6 }, (_, i) => {
        const monthEnd = new Date()
        monthEnd.setMonth(monthEnd.getMonth() - i)
        monthEnd.setDate(1)
        monthEnd.setHours(23, 59, 59, 999)
        
        const monthStart = new Date(monthEnd)
        monthStart.setDate(1)
        monthStart.setHours(0, 0, 0, 0)

        return prisma.booking.findMany({
          where: {
            ...baseWhereClause,
            appointmentDate: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          include: {
            payment: true
          }
        })
      })
    )

    const monthlyRevenueData = monthlyData.map((bookings: any[], index: number) => {
      const monthEnd = new Date()
      monthEnd.setMonth(monthEnd.getMonth() - index)
      const revenue = bookings.reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0)
      return {
        month: monthEnd.toLocaleString('default', { month: 'short' }),
        revenue,
        appointments: bookings.length,
        formattedRevenue: formatCurrency(revenue),
        progressWidth: calculateProgressWidth(revenue, Math.max(...monthlyData.map((m: any[]) => 
          m.reduce((sum: any, b: { payment: { amount: any } }) => sum + (b.payment?.amount || 0), 0)
        )))
      }
    }).reverse()

    // Top services
    const topServices = await prisma.service.findMany({
      where: {
        entrepreneurId: entrepreneurProfile.id
      },
      include: {
        bookings: {
          where: {
            appointmentDate: { gte: startDate, lte: endDate }
          },
          include: {
            payment: true
          }
        }
      },
      orderBy: {
        bookings: {
          _count: 'desc'
        }
      },
      take: 5
    })

    const totalBookings = currentAppointments || 1 // Avoid division by zero
    const topServicesData = topServices.map((service: { bookings: any[]; name: any }, index: number) => {
      const revenue = service.bookings.reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0)
      return {
        name: service.name,
        bookings: service.bookings.length,
        revenue,
        formattedRevenue: formatCurrency(revenue),
        percentage: (service.bookings.length / totalBookings * 100).toFixed(1),
        rank: index + 1
      }
    })

    // Time distribution
    const timeDistribution = await prisma.booking.groupBy({
      by: ['appointmentTime'],
      where: {
        ...baseWhereClause,
        appointmentDate: { gte: startDate, lte: endDate }
      },
      _count: true,
      orderBy: {
        appointmentTime: 'asc'
      }
    })

    const maxBookings = Math.max(...timeDistribution.map((slot: { _count: any }) => slot._count))
    const timeDistributionData = timeDistribution.map((slot: { appointmentTime: any; _count: number }) => ({
      hour: new Date(`2000-01-01T${slot.appointmentTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      }),
      bookings: slot._count,
      progressWidth: calculateProgressWidth(slot._count, maxBookings)
    }))

    // Client distribution
    const clientDistribution = [
      {
        type: 'New Clients',
        count: currentNewClients,
        percentage: ((currentNewClients / totalBookings) * 100).toFixed(1),
        progressWidth: calculateProgressWidth(currentNewClients, totalBookings),
        color: 'bg-blue-500'
      },
      {
        type: 'Returning Clients',
        count: totalBookings - currentNewClients,
        percentage: (((totalBookings - currentNewClients) / totalBookings) * 100).toFixed(1),
        progressWidth: calculateProgressWidth(totalBookings - currentNewClients, totalBookings),
        color: 'bg-green-500'
      }
    ]

    // Insights - handle empty data cases
    const insights = {
      peakHours: timeDistributionData.length > 0 
        ? timeDistributionData.reduce((peak: { bookings: number }, current: { bookings: number }) => 
            current.bookings > peak.bookings ? current : peak
          ).hour
        : 'N/A',
      topService: topServicesData[0]?.name || 'N/A',
      growthRate: calculateChange(
        currentRevenue._sum?.totalAmount || 0,
        previousRevenue._sum?.totalAmount || 0
      ).change,
      totalClients: currentNewClients
    }

    // Format overview stats
    const overview = [
      {
        name: 'Total Revenue',
        value: formatCurrency(currentRevenue._sum?.totalAmount || 0),
        ...calculateChange(currentRevenue._sum?.totalAmount || 0, previousRevenue._sum?.totalAmount || 0),
        icon: 'DollarSign',
        period: `Last ${period} days`
      },
      {
        name: 'Total Appointments',
        value: currentAppointments.toString(),
        ...calculateChange(currentAppointments, previousAppointments),
        icon: 'Calendar',
        period: `Last ${period} days`
      },
      {
        name: 'New Clients',
        value: currentNewClients.toString(),
        ...calculateChange(currentNewClients, previousNewClients),
        icon: 'Users',
        period: `Last ${period} days`
      },
      {
        name: 'Average Rating',
        value: (currentRatings._avg?.rating || 0).toFixed(1),
        ...calculateChange(currentRatings._avg?.rating || 0, previousRatings._avg?.rating || 0),
        icon: 'Star',
        period: `Last ${period} days`
      },
      {
        name: 'No-Show Rate',
        value: `${currentNoShowRate.toFixed(1)}%`,
        ...calculateChange(previousNoShowRate, currentNoShowRate), // Reversed for better context
        icon: 'Clock',
        period: `Last ${period} days`
      },
      {
        name: 'Booking Rate',
        value: `${currentBookingRateValue.toFixed(1)}%`,
        ...calculateChange(currentBookingRateValue, previousBookingRateValue),
        icon: 'TrendingUp',
        period: `Last ${period} days`
      }
    ]

    return NextResponse.json({
      overview,
      monthlyRevenue: monthlyRevenueData,
      topServices: topServicesData,
      clientDistribution,
      timeDistribution: timeDistributionData,
      insights
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}