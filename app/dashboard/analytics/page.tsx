'use client'

import { useState, useEffect } from 'react'
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Star,
  BarChart3,
  Download,
  Filter,
  Loader2
} from 'lucide-react'

// Type definitions
interface OverviewStat {
  name: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  icon: string
  period: string
}

interface MonthlyRevenue {
  month: string
  revenue: number
  appointments: number
  formattedRevenue: string
  progressWidth: string
}

interface TopService {
  name: string
  bookings: number
  revenue: number
  percentage: number
  formattedRevenue: string
  rank: number
}

interface ClientDistribution {
  type: string
  count: number
  percentage: number
  progressWidth: string
  color: string
}

interface TimeDistribution {
  hour: string
  bookings: number
  progressWidth: string
}

interface Insights {
  peakHours: string
  topService: string
  growthRate: string
  totalClients: number
}

interface AnalyticsData {
  overview: OverviewStat[]
  monthlyRevenue: MonthlyRevenue[]
  topServices: TopService[]
  clientDistribution: ClientDistribution[]
  timeDistribution: TimeDistribution[]
  insights: Insights
}

// Icon mapping for dynamic icons
const iconMap = {
  DollarSign,
  Calendar,
  Users,
  Star,
  Clock,
  TrendingUp
}

// Helper function to format AED currency
const formatAED = (amount: number) => {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount)
}

// Helper function to format time in GST
const formatGSTTime = (timeString: string) => {
  // Handle both 12-hour format (2-4 PM) and 24-hour format
  if (timeString.includes('-')) {
    // Range format like "2-4 PM"
    return timeString + ' GST'
  }
  
  // Single time format
  const time = new Date(`1970-01-01T${timeString}:00`)
  return time.toLocaleTimeString('en-AE', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) + ' GST'
}

// Helper function to format stat values properly
const formatStatValue = (statName: string, value: string) => {
  // Convert revenue values from $ to AED format
  if (statName.toLowerCase().includes('revenue') && value.includes('$')) {
    const numericValue = parseFloat(value.replace(/[$,]/g, ''))
    return formatAED(numericValue)
  }
  return value
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch analytics data
  const fetchAnalytics = async (period: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/dashboard/analytics?period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and period change
  useEffect(() => {
    fetchAnalytics(selectedPeriod)
  }, [selectedPeriod])

  const handleExportData = async () => {
    try {
      const response = await fetch(`/api/dashboard/analytics/export?period=${selectedPeriod}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `analytics-${selectedPeriod}days.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Handle period change
  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPeriod(e.target.value)
  }

  // Loading state
  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">
              <h3 className="text-lg font-medium">Error loading analytics</h3>
              <p className="mt-1">{error}</p>
              <button
                onClick={() => fetchAnalytics(selectedPeriod)}
                className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500">No analytics data available</p>
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
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Analytics & Reports
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track your business performance and growth metrics (revenue in AED, times in GST)
            </p>
          </div>
          <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
            <select
              value={selectedPeriod}
              onChange={handlePeriodChange}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.overview.map((item) => {
              const IconComponent = iconMap[item.icon as keyof typeof iconMap]
              return (
                <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {IconComponent && <IconComponent className="h-6 w-6 text-gray-400" />}
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {item.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {formatStatValue(item.name, item.value)}
                            </div>
                            <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                              item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.changeType === 'increase' ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {item.change}
                            </div>
                          </dd>
                          <dd className="text-xs text-gray-500 mt-1">
                            {item.period}
                            {item.name.toLowerCase().includes('revenue') && (
                              <span className="text-xs text-blue-600 ml-1">(AED)</span>
                            )}
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

        {/* Charts Section */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Revenue Chart */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Revenue & Appointments Trend
              </h3>
              <p className="text-xs text-gray-500">Revenue amounts shown in AED</p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {data.monthlyRevenue.map((item) => (
                  <div key={item.month} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900 w-8">
                        {item.month}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: item.progressWidth }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {item.formattedRevenue.includes('$') ? 
                          formatAED(parseFloat(item.formattedRevenue.replace(/[$,]/g, ''))) : 
                          item.formattedRevenue
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.appointments} appointments
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Services */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Top Services
              </h3>
              <p className="text-xs text-gray-500">Revenue amounts shown in AED</p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {data.topServices.map((service) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">{service.rank}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {service.bookings} bookings
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {service.formattedRevenue.includes('$') ? 
                          formatAED(parseFloat(service.formattedRevenue.replace(/[$,]/g, ''))) : 
                          service.formattedRevenue
                        }
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.percentage}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Charts */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Client Distribution */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Client Distribution
              </h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {data.clientDistribution.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {item.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count} clients ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: item.progressWidth }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.insights.totalClients}
                  </div>
                  <div className="text-sm text-gray-500">Total Clients This Period</div>
                </div>
              </div>
            </div>
          </div>

          {/* Popular Time Slots */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Popular Time Slots
              </h3>
              <p className="text-xs text-gray-500">Times shown in Gulf Standard Time (GST)</p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                {data.timeDistribution.map((slot) => (
                  <div key={slot.hour} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-gray-900 w-20">
                        {formatGSTTime(slot.hour)}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: slot.progressWidth }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {slot.bookings} bookings
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Performance Insights
            </h3>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Peak Hours */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-sm font-medium text-blue-900">Peak Hours (GST)</h4>
                </div>
                <p className="mt-2 text-2xl font-bold text-blue-600">
                  {formatGSTTime(data.insights.peakHours)}
                </p>
                <p className="text-sm text-blue-700">
                  Most bookings occur during these hours
                </p>
              </div>

              {/* Best Performing Service */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="text-sm font-medium text-green-900">Top Service</h4>
                </div>
                <p className="mt-2 text-lg font-bold text-green-600">{data.insights.topService}</p>
                <p className="text-sm text-green-700">
                  {data.topServices[0]?.percentage}% of total bookings
                </p>
              </div>

              {/* Revenue Growth */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="text-sm font-medium text-purple-900">Growth Rate</h4>
                </div>
                <p className="mt-2 text-2xl font-bold text-purple-600">{data.insights.growthRate}</p>
                <p className="text-sm text-purple-700">
                  Monthly revenue growth (AED)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="px-6 py-4">
            <h3 className="text-lg leading-6 font-medium text-yellow-900 mb-4">
              💡 Business Insights & Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Revenue Opportunities</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Consider raising prices for high-demand services (in AED)</li>
                  <li>• Promote less popular services during peak hours</li>
                  <li>• Offer package deals to increase average order value</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Operational Improvements</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Add more availability during {formatGSTTime(data.insights.peakHours)} peak hours</li>
                  <li>• Send reminders to reduce no-show rate</li>
                  <li>• Focus marketing on bringing back former clients</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Export Reports
            </h3>
            <p className="text-xs text-gray-500">All exported data will show revenue in AED and times in GST</p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleExportData()}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Revenue Report (AED)
              </button>
              <button
                type="button"
                onClick={() => handleExportData()}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Client Report
              </button>
              <button
                type="button"
                onClick={() => handleExportData()}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Service Report (GST)
              </button>
            </div>
          </div>
        </div>

        {/* Regional Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Regional Settings
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • All revenue figures are displayed in UAE Dirhams (AED)<br/>
                  • All times are shown in Gulf Standard Time (GST, UTC+4)<br/>
                  • Export files will maintain AED and GST formatting for consistency
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}