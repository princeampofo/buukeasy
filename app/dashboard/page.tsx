// /app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

import { DateTime } from 'luxon'

// Add icon mapping helper:
const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    AlertCircle,
    Calendar,
    Users,
  }
  return iconMap[iconName] || CheckCircle
}

// Replace the mock data section with:
interface DashboardData {
  stats: Array<{
    name: string
    value: string
    change: string
    changeType: 'increase' | 'decrease'
    icon: string
  }>
  upcomingAppointments: Array<{
    id: number
    clientName: string
    service: string
    time: string
    duration: string
    status: string
  }>
  recentActivity: Array<{
    id: number
    type: string
    message: string
    time: string
    icon: string
    iconColor: string
  }>
  nextAppointment?: {
    id: number
    clientName: string
    service: string
    time: string
    date: string
  } | null
}

// Helper function to format currency in AED
const formatAED = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

export default function DashboardPage() {
  // Get user data from auth context
  const { user } = useAuthContext()
  const [selectedDate, _] = useState(DateTime.now().setZone('Asia/Dubai').toISODate())
  // Add state and useEffect in the component:
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [selectedDate])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Get time-based greeting in GST
  const getGreeting = () => {
    const gstTime = DateTime.now().setZone('Asia/Dubai')
    const hour = gstTime.hour

    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // // Calculate trial days remaining
  // const getTrialInfo = () => {
  //   if (!user?.trialEndsAt) return null
    
  //   const daysRemaining = Math.ceil(
  //     (new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  //   )
    
  //   return {
  //     daysRemaining,
  //     isExpired: daysRemaining <= 0,
  //     isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0
  //   }
  // }

  // const trialInfo = getTrialInfo()

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      no_show: 'bg-orange-100 text-orange-800',
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  // Updated stats card styling with better visual hierarchy and AED formatting
  const getStatsCardStyle = (statName: string) => {
    switch (statName) {
      case "Monthly Revenue":
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-150'
      case "This Week's Bookings":
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150'
      case "Today's Bookings":
        return 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-150'
      case 'Next Appointment':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-150'
      default:
        return 'bg-white hover:bg-gray-50'
    }
  }

  // Helper function to get appropriate icon color based on stat
  const getStatIconColor = (statName: string) => {
    switch (statName) {
      case "Monthly Revenue":
        return 'text-green-600'
      case "This Week's Bookings":
        return 'text-blue-600'
      case "Today's Bookings":
        return 'text-purple-600'
      case 'Next Appointment':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  // Helper function to format stat values properly
  const formatStatValue = (statName: string, value: string) => {
    if (statName.includes('Revenue') && value.includes('$')) {
      // Convert dollar amounts to AED format
      const numericValue = parseFloat(value.replace(/[$,]/g, ''))
      return formatAED(numericValue)
    }
    return value
  }

  if (isLoading) {
    return (
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="mb-1 sm:mb-2 text-xl sm:text-2xl md:text-3xl font-bold leading-7 text-gray-900">
              {getGreeting()}, {user?.firstName}!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              <span className="hidden sm:inline">Here's what's happening with {user?.businessName} today</span>
              <span className="sm:hidden">Your business overview</span>
            </p>
          </div>
          <div className="mt-3 sm:mt-0 flex gap-2">
            <Link
              href="/dashboard/services/new"
              className="inline-flex items-center px-3 py-2 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Service</span>
              <span className="sm:hidden">Add Service</span>
            </Link>
          </div>
        </div>

        {/* Trial Warning Banner - Hide details on mobile */}
        {/* {trialInfo && (trialInfo.isExpired || trialInfo.isExpiringSoon) && (
          <div className={`mt-4 sm:mt-6 rounded-md p-3 sm:p-4 ${
            trialInfo.isExpired 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  trialInfo.isExpired ? 'text-red-400' : 'text-yellow-400'
                }`} />
              </div>
              <div className="ml-3 flex-1">
                <h3 className={`text-xs sm:text-sm font-medium ${
                  trialInfo.isExpired ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {trialInfo.isExpired 
                    ? 'Trial expired' 
                    : `Trial expires in ${trialInfo.daysRemaining} day${trialInfo.daysRemaining !== 1 ? 's' : ''}`
                  }
                </h3>
                <div className={`mt-1 sm:mt-2 text-xs sm:text-sm ${
                  trialInfo.isExpired ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  <p className="hidden sm:block">
                    {trialInfo.isExpired 
                      ? 'Upgrade to continue using all features of BuukMe.'
                      : 'Upgrade now to continue enjoying all features without interruption.'
                    }
                  </p>
                  <p className="sm:hidden">
                    Upgrade to continue using BuukMe.
                  </p>
                </div>
                <div className="mt-2 sm:mt-4">
                  <button
                    type="button"
                    className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium ${
                      trialInfo.isExpired
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Stats Grid - Responsive */}
        <div className="mt-6 sm:mt-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {dashboardData?.stats.map((item) => {
              const IconComponent = getIconComponent(item.icon)
              return (
                <div key={item.name} className={`overflow-hidden shadow rounded-lg border transition-all duration-200 ${getStatsCardStyle(item.name)}`}>
                  <div className="p-3 sm:p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <IconComponent className={`h-5 w-5 sm:h-6 sm:w-6 ${getStatIconColor(item.name)}`} />
                      </div>
                      <div className="ml-3 sm:ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                            {item.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-lg sm:text-2xl font-bold text-gray-900">
                              {formatStatValue(item.name, item.value)}
                            </div>
                          </dd>
                          {item.change && (
                            <div className="text-xs text-gray-500 mt-1 truncate hidden sm:block">
                              {item.change}
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                    Today's Appointments
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={selectedDate}
                      // disable date input if no date is selected
                      disabled
                      className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Link
                      href="/dashboard/appointments"
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <span className="hidden sm:inline">View all</span>
                      <span className="sm:hidden">All</span>
                      <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="px-4 sm:px-6 py-4">
                {(dashboardData?.upcomingAppointments?.length ?? 0) > 0 ? (
                  <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                    {dashboardData?.upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                          <div className="flex-shrink-0 hidden sm:block">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {appointment.clientName}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                              {appointment.service}
                              <span className="hidden sm:inline"> • {appointment.duration}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-medium text-gray-900">
                              {appointment.time}
                            </p>
                            <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                              {appointment.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Calendar className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                      <span className="hidden sm:inline">You don't have any appointments scheduled for today.</span>
                      <span className="sm:hidden">No appointments today.</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Only */}
          <div className="space-y-6 sm:space-y-8">
            {/* Recent Activity - COMMENTED OUT */}
            {/* 
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-4">
                <div className="flow-root max-h-80 overflow-y-auto">
                  <ul className="-mb-8">
                    {dashboardData?.recentActivity.map((activity, activityIdx) => {
                      const IconComponent = getIconComponent(activity.icon)
                      return (
                        <li key={activity.id}>
                          <div className="relative pb-6 sm:pb-8">
                            {activityIdx !== dashboardData.recentActivity.length - 1 ? (
                              <span
                                className="absolute top-4 left-3 sm:left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-2 sm:space-x-3">
                              <div>
                                <span className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full flex items-center justify-center ring-4 sm:ring-8 ring-white ${activity.iconColor.replace('text-', 'bg-').replace('-500', '-100')}`}>
                                  <IconComponent className={`h-3 w-3 sm:h-4 sm:w-4 ${activity.iconColor}`} />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    {activity.message}
                                  </p>
                                </div>
                                <div className="text-right text-xs whitespace-nowrap text-gray-500 flex-shrink-0">
                                  {activity.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
            */}

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="px-4 sm:px-6 py-4">
                <div className="space-y-2 sm:space-y-3">
                  <Link
                    href="/dashboard/services"
                    className="w-full flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="hidden sm:inline">Manage Services</span>
                    <span className="sm:hidden">Services</span>
                  </Link>
                  <Link
                    href="/dashboard/availability"
                    className="w-full flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="hidden sm:inline">Set Availability</span>
                    <span className="sm:hidden">Availability</span>
                  </Link>
                  <Link
                    href={`/book/${user?.businessSlug}`}
                    target="_blank"
                    className="w-full flex items-center justify-center px-3 sm:px-4 py-2 border border-blue-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    <span className="hidden sm:inline">View Booking Page</span>
                    <span className="sm:hidden">Booking Page</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}