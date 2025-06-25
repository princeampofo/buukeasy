// src/app/(dashboard)/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Calendar, 
  Home, 
  Settings, 
  Users, 
  Clock, 
  BarChart3, 
  Menu, 
  X, 
  Bell,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },                    // Main admin page
  { name: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { name: 'Services', href: '/admin/services', icon: Users },
  { name: 'Availability', href: '/admin/availability', icon: Clock },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // Get auth context
  const { user, loading, isAuthenticated, logout } = useAuthContext()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  // Handle logout
  const handleLogout = async () => {
    setUserMenuOpen(false)
    await logout()
    // logout() already redirects to login, but we can be explicit
    router.push('/login')
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated || !user) {
    return null
  }

  // Calculate trial days remaining
  const trialDaysRemaining = user.trialEndsAt 
    ? Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              {/* Search can be added here later */}
            </div>
            
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Trial notification */}
              {trialDaysRemaining !== null && trialDaysRemaining <= 7 && (
                <div className="hidden sm:block bg-yellow-50 border border-yellow-200 rounded-md px-3 py-1">
                  <span className="text-xs font-medium text-yellow-800">
                    {trialDaysRemaining > 0 
                      ? `${trialDaysRemaining} days left in trial`
                      : 'Trial expired'
                    }
                  </span>
                </div>
              )}

              {/* Notifications */}
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="ml-2 text-gray-700 font-medium hidden sm:block">
                      {user.firstName} {user.lastName}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400 hidden sm:block" />
                  </button>
                </div>

                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      <div className="flex items-center">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )

  function SidebarContent() {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-2xl font-bold text-gray-900">BookEasy</span>
          </div>
          
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 border-r-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Business info with trial status */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.businessName ?? ''}</p>
                <div className="flex items-center">
                  {trialDaysRemaining !== null && trialDaysRemaining > 0 ? (
                    <span className="text-xs text-yellow-600">
                      Trial ({trialDaysRemaining} days left)
                    </span>
                  ) : trialDaysRemaining === 0 ? (
                    <span className="text-xs text-red-600">Trial Expired</span>
                  ) : (
                    <span className="text-xs text-green-600">Premium Plan</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}