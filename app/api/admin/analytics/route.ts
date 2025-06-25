import { NextResponse } from 'next/server'

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

    // TODO: Replace with actual database queries
    // Example queries you might use:
    /*
    const revenue = await db.appointments.aggregate({
      _sum: { total: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000)
        },
        status: 'completed'
      }
    })

    const appointments = await db.appointments.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - period * 24 * 60 * 60 * 1000)
        }
      }
    })
    */

    // Mock data calculations (replace with real database queries)
    const currentPeriodData = {
      totalRevenue: 12450,
      totalAppointments: 267,
      newClients: 42,
      avgRating: 4.8,
      noShowRate: 8.5,
      bookingRate: 91.5
    }

    const previousPeriodData = {
      totalRevenue: 10800,
      totalAppointments: 246,
      newClients: 34,
      avgRating: 4.6,
      noShowRate: 10.6,
      bookingRate: 89.4
    }

    // Calculate changes
    const revenueChange = calculateChange(currentPeriodData.totalRevenue, previousPeriodData.totalRevenue)
    const appointmentsChange = calculateChange(currentPeriodData.totalAppointments, previousPeriodData.totalAppointments)
    const newClientsChange = calculateChange(currentPeriodData.newClients, previousPeriodData.newClients)
    const ratingChange = {
      change: `+${(currentPeriodData.avgRating - previousPeriodData.avgRating).toFixed(1)}`,
      changeType: 'increase' as const
    }
    const noShowChange = {
      change: `-${(previousPeriodData.noShowRate - currentPeriodData.noShowRate).toFixed(1)}%`,
      changeType: 'decrease' as const
    }
    const bookingRateChange = {
      change: `+${(currentPeriodData.bookingRate - previousPeriodData.bookingRate).toFixed(1)}%`,
      changeType: 'increase' as const
    }

    // Monthly revenue data (last 6 months)
    const monthlyRevenueData = [
      { month: 'Jan', revenue: 8500, appointments: 185 },
      { month: 'Feb', revenue: 9200, appointments: 198 },
      { month: 'Mar', revenue: 10100, appointments: 210 },
      { month: 'Apr', revenue: 11300, appointments: 235 },
      { month: 'May', revenue: 10800, appointments: 225 },
      { month: 'Jun', revenue: 12450, appointments: 267 }
    ]

    const maxRevenue = Math.max(...monthlyRevenueData.map(m => m.revenue))

    // Top services data
    const topServicesData = [
      { name: 'Hair Cut & Style', bookings: 85, revenue: 6375, percentage: 31.8 },
      { name: 'Color Treatment', bookings: 32, revenue: 4800, percentage: 12.0 },
      { name: 'Beard Trim', bookings: 67, revenue: 1675, percentage: 25.1 },
      { name: 'Deep Conditioning', bookings: 18, revenue: 900, percentage: 6.7 },
      { name: 'Consultation', bookings: 25, revenue: 0, percentage: 9.4 }
    ]

    // Time distribution data
    const timeDistributionData = [
      { hour: '9 AM', bookings: 15 },
      { hour: '10 AM', bookings: 22 },
      { hour: '11 AM', bookings: 28 },
      { hour: '12 PM', bookings: 18 },
      { hour: '1 PM', bookings: 12 },
      { hour: '2 PM', bookings: 25 },
      { hour: '3 PM', bookings: 30 },
      { hour: '4 PM', bookings: 24 },
      { hour: '5 PM', bookings: 16 }
    ]

    const maxBookings = Math.max(...timeDistributionData.map(t => t.bookings))

    // Client distribution
    const clientDistributionData = [
      { type: 'New Clients', count: 42, percentage: 35 },
      { type: 'Returning Clients', count: 78, percentage: 65 }
    ]

    const totalClients = clientDistributionData.reduce((sum, item) => sum + item.count, 0)

    // Build response
    const analytics = {
      overview: [
        {
          name: 'Total Revenue',
          value: formatCurrency(currentPeriodData.totalRevenue),
          change: revenueChange.change,
          changeType: revenueChange.changeType,
          icon: 'DollarSign',
          period: 'vs last month'
        },
        {
          name: 'Total Appointments',
          value: currentPeriodData.totalAppointments.toString(),
          change: appointmentsChange.change,
          changeType: appointmentsChange.changeType,
          icon: 'Calendar',
          period: 'vs last month'
        },
        {
          name: 'New Clients',
          value: currentPeriodData.newClients.toString(),
          change: newClientsChange.change,
          changeType: newClientsChange.changeType,
          icon: 'Users',
          period: 'vs last month'
        },
        {
          name: 'Avg. Rating',
          value: currentPeriodData.avgRating.toString(),
          change: ratingChange.change,
          changeType: ratingChange.changeType,
          icon: 'Star',
          period: 'vs last month'
        },
        {
          name: 'No-show Rate',
          value: `${currentPeriodData.noShowRate}%`,
          change: noShowChange.change,
          changeType: noShowChange.changeType,
          icon: 'Clock',
          period: 'vs last month'
        },
        {
          name: 'Booking Rate',
          value: `${currentPeriodData.bookingRate}%`,
          change: bookingRateChange.change,
          changeType: bookingRateChange.changeType,
          icon: 'TrendingUp',
          period: 'vs last month'
        }
      ],
      monthlyRevenue: monthlyRevenueData.map(item => ({
        ...item,
        formattedRevenue: formatCurrency(item.revenue),
        progressWidth: calculateProgressWidth(item.revenue, maxRevenue)
      })),
      topServices: topServicesData.map((service, index) => ({
        ...service,
        formattedRevenue: formatCurrency(service.revenue),
        rank: index + 1
      })),
      clientDistribution: [
        {
          type: 'New Clients',
          count: 42,
          percentage: 35,
          progressWidth: '35%',
          color: 'bg-green-500'
        },
        {
          type: 'Returning Clients',
          count: 78,
          percentage: 65,
          progressWidth: '65%',
          color: 'bg-blue-500'
        }
      ],
      timeDistribution: timeDistributionData.map(slot => ({
        ...slot,
        progressWidth: calculateProgressWidth(slot.bookings, maxBookings)
      })),
      insights: {
        peakHours: '2-3 PM',
        topService: topServicesData[0].name,
        growthRate: revenueChange.change,
        totalClients: totalClients
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