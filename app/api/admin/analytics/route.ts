import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Helper function to calculate progress width
const calculateProgressWidth = (value: number, maxValue: number): string => {
  return `${Math.round((value / maxValue) * 100)}%`
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return amount === 0 ? 'Free' : `$${amount.toLocaleString()}`
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

    // Calculate date ranges
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - period * 24 * 60 * 60 * 1000)
    const previousStartDate = new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000)

    // Fetch current period data
    const [
      currentRevenue,
      currentAppointments,
      currentNewClients,
      currentRatings,
      currentNoShows,
      currentBookingRate
    ] = await prisma.$transaction([
      // Total revenue
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: 'PAID'
        },
        _sum: { amount: true }
      }),

      // Total appointments
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        }
      }),

      // New clients (unique customers)
      prisma.booking.count({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        distinct: ['customerEmail']
      }),

      // Average ratings
      prisma.review.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate }
        },
        _avg: { rating: true }
      }),

      // No-shows
      prisma.booking.count({
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
          status: 'NO_SHOW'
        }
      }),

      // Total bookings for rate calculation
      prisma.booking.count({
        where: {
          appointmentDate: { gte: startDate, lte: endDate },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      })
    ])

    // Fetch previous period data
    const [
      previousRevenue,
      previousAppointments,
      previousNewClients,
      previousRatings,
      previousNoShows,
      previousBookingRate
    ] = await prisma.$transaction([
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lte: startDate },
          status: 'PAID'
        },
        _sum: { amount: true }
      }),

      prisma.booking.count({
        where: {
          createdAt: { gte: previousStartDate, lte: startDate }
        }
      }),

      prisma.booking.count({
        where: {
          createdAt: { gte: previousStartDate, lte: startDate }
        },
        distinct: ['customerEmail']
      }),

      prisma.review.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lte: startDate }
        },
        _avg: { rating: true }
      }),

      prisma.booking.count({
        where: {
          appointmentDate: { gte: previousStartDate, lte: startDate },
          status: 'NO_SHOW'
        }
      }),

      prisma.booking.count({
        where: {
          appointmentDate: { gte: previousStartDate, lte: startDate },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      })
    ])

    // Calculate rates and changes
    const currentNoShowRate = (currentNoShows / currentAppointments) * 100
    const previousNoShowRate = (previousNoShows / previousAppointments) * 100
    const currentBookingRateValue = (currentBookingRate / (currentBookingRate + currentNoShows)) * 100
    const previousBookingRateValue = (previousBookingRate / (previousBookingRate + previousNoShows)) * 100

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

    const monthlyRevenueData = monthlyData.map((bookings, index) => {
      const monthEnd = new Date()
      monthEnd.setMonth(monthEnd.getMonth() - index)
      return {
        month: monthEnd.toLocaleString('default', { month: 'short' }),
        revenue: bookings.reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0),
        appointments: bookings.length
      }
    }).reverse()

    // Top services data
    const topServices = await prisma.service.findMany({
      include: {
        bookings: {
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

    const topServicesData = topServices.map(service => ({
      name: service.name,
      bookings: service.bookings.length,
      revenue: service.bookings.reduce((sum, booking) => sum + (booking.payment?.amount || 0), 0),
      percentage: (service.bookings.length / currentAppointments) * 100
    }))

    // Time distribution data
    const timeDistribution = await prisma.booking.groupBy({
      by: ['appointmentTime'],
      _count: true,
      orderBy: {
        appointmentTime: 'asc'
      }
    })

    const timeDistributionData = timeDistribution.map(slot => ({
      hour: new Date(`2000-01-01T${slot.appointmentTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      }),
      bookings: slot._count
    }))

    // Client distribution
    const returningClients = await prisma.booking.groupBy({
      by: ['customerEmail'],
      _count: true,
      having: {
        _count: {
          gt: 1
        }
      }
    })

    const clientDistributionData = [
      {
        type: 'New Clients',
        count: currentNewClients,
        percentage: (currentNewClients / currentAppointments) * 100
      },
      {
        type: 'Returning Clients',
        count: returningClients.length,
        percentage: (returningClients.length / currentAppointments) * 100
      }
    ]

    // Build response with real data
    const analytics = {
      overview: [
        {
          name: 'Total Revenue',
          value: formatCurrency(currentRevenue._sum.amount || 0),
          ...calculateChange(currentRevenue._sum.amount || 0, previousRevenue._sum.amount || 0),
          icon: 'DollarSign',
          period: 'vs last period'
        },
        {
          name: 'Total Appointments',
          value: currentAppointments.toString(),
          ...calculateChange(currentAppointments, previousAppointments),
          icon: 'Calendar',
          period: 'vs last period'
        },
        {
          name: 'New Clients',
          value: currentNewClients.toString(),
          ...calculateChange(currentNewClients, previousNewClients),
          icon: 'Users',
          period: 'vs last period'
        },
        {
          name: 'Avg. Rating',
          value: (currentRatings._avg.rating || 0).toFixed(1),
          ...calculateChange(currentRatings._avg.rating || 0, previousRatings._avg.rating || 0),
          icon: 'Star',
          period: 'vs last period'
        },
        {
          name: 'No-show Rate',
          value: `${currentNoShowRate.toFixed(1)}%`,
          ...calculateChange(previousNoShowRate, currentNoShowRate),
          icon: 'Clock',
          period: 'vs last period'
        },
        {
          name: 'Booking Rate',
          value: `${currentBookingRateValue.toFixed(1)}%`,
          ...calculateChange(currentBookingRateValue, previousBookingRateValue),
          icon: 'TrendingUp',
          period: 'vs last period'
        }
      ],
      monthlyRevenue: monthlyRevenueData.map(item => ({
        ...item,
        formattedRevenue: formatCurrency(item.revenue),
        progressWidth: calculateProgressWidth(item.revenue, Math.max(...monthlyRevenueData.map(m => m.revenue)))
      })),
      topServices: topServicesData.map((service, index) => ({
        ...service,
        formattedRevenue: formatCurrency(service.revenue),
        rank: index + 1
      })),
      clientDistribution: clientDistributionData.map(item => ({
        ...item,
        progressWidth: `${item.percentage}%`,
        color: item.type === 'New Clients' ? 'bg-green-500' : 'bg-blue-500'
      })),
      timeDistribution: timeDistributionData.map(slot => ({
        ...slot,
        progressWidth: calculateProgressWidth(slot.bookings, Math.max(...timeDistributionData.map(t => t.bookings)))
      })),
      insights: {
        peakHours: timeDistributionData.reduce((a, b) => a.bookings > b.bookings ? a : b).hour,
        topService: topServicesData[0]?.name || 'No services yet',
        growthRate: calculateChange(currentRevenue._sum.amount || 0, previousRevenue._sum.amount || 0).change,
        totalClients: currentNewClients + returningClients.length
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}