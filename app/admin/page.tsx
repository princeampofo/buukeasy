// /app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

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
    TrendingUp,
  }
  return iconMap[iconName] || CheckCircle
}

// Replace the mock data section with:
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
    duration: number
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
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  // Add state and useEffect in the component:
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }
    
  // Get user data from auth context
  const { user } = useAuthContext()

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Calculate trial days remaining
  const getTrialInfo = () => {
    if (!user?.trialEndsAt) return null
    
    const daysRemaining = Math.ceil(
      (new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return {
      daysRemaining,
      isExpired: daysRemaining <= 0,
      isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0
    }
  }

  const trialInfo = getTrialInfo()

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="mb-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              {getGreeting()}, {user?.firstName}!
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with {user?.businessName} today
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/admin/services/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Link>
          </div>
        </div>

        {/* Trial Warning Banner */}
        {trialInfo && (trialInfo.isExpired || trialInfo.isExpiringSoon) && (
          <div className={`mt-6 rounded-md p-4 ${
            trialInfo.isExpired 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className={`h-5 w-5 ${
                  trialInfo.isExpired ? 'text-red-400' : 'text-yellow-400'
                }`} />
              </div>
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  trialInfo.isExpired ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {trialInfo.isExpired 
                    ? 'Your trial has expired' 
                    : `Your trial expires in ${trialInfo.daysRemaining} day${trialInfo.daysRemaining !== 1 ? 's' : ''}`
                  }
                </h3>
                <div className={`mt-2 text-sm ${
                  trialInfo.isExpired ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  <p>
                    {trialInfo.isExpired 
                      ? 'Upgrade to continue using all features of BookEasy.'
                      : 'Upgrade now to continue enjoying all features without interruption.'
                    }
                  </p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      className={`px-2 py-1.5 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        trialInfo.isExpired
                          ? 'bg-red-100 text-red-800 hover:bg-red-200 focus:ring-red-600'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:ring-yellow-600'
                      }`}
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardData?.stats.map((item) => {
              const IconComponent = getIconComponent(item.icon)
              return (
                <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <IconComponent className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {item.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {item.value}
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Today's Appointments
                  </h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Link
                      href="/admin/appointments"
                      className="text-sm text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      View all
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                {(dashboardData?.upcomingAppointments?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {dashboardData?.upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.clientName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {appointment.service} • {appointment.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {appointment.time}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any appointments scheduled for today.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {dashboardData?.recentActivity.map((activity, activityIdx) => {
                      const IconComponent = getIconComponent(activity.icon)
                      return (
                        <li key={activity.id}>
                          <div className="relative pb-8">
                            {activityIdx !== dashboardData.recentActivity.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${activity.iconColor.replace('text-', 'bg-').replace('-500', '-100')}`}>
                                  <IconComponent className={`h-4 w-4 ${activity.iconColor}`} />
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    {activity.message}
                                  </p>
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
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

            {/* Quick Actions */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <Link
                    href="/admin/services"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Services
                  </Link>
                  <Link
                    href="/admin/availability"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Set Availability
                  </Link>
                  <Link
                    href={`/book/${user?.businessSlug}`}
                    target="_blank"
                    className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Booking Page
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