'use client'

import { useState, useEffect } from 'react'
import {  
  Bell, 
  Lock,
  Building2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface BusinessSettings {
  businessName: string
  ownerFirstName: string
  ownerLastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  website: string
  businessDescription: string
  timezone: string
  currency: string
}

interface NotificationSettings {
  emailBookings: boolean
  emailCancellations: boolean
  emailReminders: boolean
  smsBookings: boolean
  smsCancellations: boolean
  smsReminders: boolean
  marketingEmails: boolean
  weeklyReports: boolean
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const settingsTabs = [
  { id: 'business', name: 'Business', icon: Building2 },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Lock }
]

const SETTINGS_TAB_KEY = 'settings-active-tab'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Business settings state - Updated with GST/AED defaults
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: '',
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    businessDescription: '',
    timezone: 'Asia/Dubai',
    currency: 'AED'
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailBookings: true,
    emailCancellations: true,
    emailReminders: true,
    smsBookings: false,
    smsCancellations: false,
    smsReminders: false,
    marketingEmails: true,
    weeklyReports: true
  })

  // Password settings state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Initialize component and load saved tab preference
  useEffect(() => {
    setMounted(true)
    
    // Get saved tab from localStorage
    const savedTab = localStorage.getItem(SETTINGS_TAB_KEY)
    const tabToLoad = savedTab && settingsTabs.some(tab => tab.id === savedTab) 
      ? savedTab 
      : 'business'
    
    setActiveTab(tabToLoad)
    fetchTabData(tabToLoad)
  }, [])

  // Fetch data for specific tab
  const fetchTabData = async (tabId: string) => {
    setLoading(true)
    
    try {
      let endpoint = ''
      
      switch (tabId) {
        case 'business':
          endpoint = '/api/dashboard/settings/business'
          break
        case 'notifications':
          endpoint = '/api/dashboard/settings/notifications'
          break
        case 'security':
          // Don't fetch password data for security reasons
          setLoading(false)
          return
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        const data = await response.json()
        
        switch (tabId) {
          case 'business':
            setBusinessSettings(prevSettings => ({
              ...prevSettings,
              ...data,
              // Ensure Asia/Dubai defaults are maintained
              timezone: data.timezone || 'Asia/Dubai',
              currency: data.currency || 'AED'
            }))
            break
          case 'notifications':
            setNotificationSettings(prevSettings => ({
              ...prevSettings,
              ...data
            }))
            break
        }
      } else {
        toast.error('Failed to load settings data')
      }
    } catch (error) {
      toast.error('Failed to load settings data')
    } finally {
      setLoading(false)
    }
  }

  // Handle tab change with localStorage persistence and data fetching
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    
    // Save tab preference to localStorage
    if (mounted) {
      localStorage.setItem(SETTINGS_TAB_KEY, tabId)
    }
    
    // Fetch data for the new tab
    fetchTabData(tabId)
  }

  const handleBusinessSettingsChange = (field: keyof BusinessSettings, value: string) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validatePassword = () => {
    return (
      passwordData.newPassword.length >= 8 &&
      /[A-Z]/.test(passwordData.newPassword) &&
      /[a-z]/.test(passwordData.newPassword) &&
      /\d/.test(passwordData.newPassword) &&
      passwordData.newPassword === passwordData.confirmPassword
    )
  }

  const handleSave = async (settingsType: string) => {
    try {
      let endpoint = ''
      let data = {}

      switch (settingsType) {
        case 'business':
          endpoint = '/api/dashboard/settings/business'
          data = businessSettings
          break
        case 'notifications':
          endpoint = '/api/dashboard/settings/notifications'
          data = notificationSettings
          break
        case 'password':
          endpoint = '/api/dashboard/settings/security'
          data = passwordData
          break
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        if (settingsType === 'password') {
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        }
        toast.success('Settings saved successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to save settings. Please try again.')
      }
    } catch (error) {
      toast.error('Failed to save settings. Please try again.')
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your business settings and preferences
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your business settings and preferences
          </p>
        </div>

        {/* Settings Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList>
            {settingsTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="business">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your business details and preferences
                </p>

                {loading ? (
                  <div className="mt-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                     <div className="sm:col-span-4">
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          type="text"
                          id="businessName"
                          value={businessSettings.businessName}
                          disabled
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <Label htmlFor="ownerFirstName">Owner's First Name</Label>
                        <Input
                          type="text"
                          id="ownerFirstName"
                          value={businessSettings.ownerFirstName}
                          onChange={(e) => handleBusinessSettingsChange('ownerFirstName', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <Label htmlFor="ownerLastName">Owner's Last Name</Label>
                        <Input
                          type="text"
                          id="ownerLastName"
                          value={businessSettings.ownerLastName}
                          onChange={(e) => handleBusinessSettingsChange('ownerLastName', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          type="email"
                          id="email"
                          value={businessSettings.email}
                          onChange={(e) => handleBusinessSettingsChange('email', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          type="tel"
                          id="phone"
                          value={businessSettings.phone}
                          onChange={(e) => handleBusinessSettingsChange('phone', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <Label htmlFor="description">Description</Label>
                        <Input
                          type="text"
                          id="description"
                          value={businessSettings.businessDescription}
                          onChange={(e) => handleBusinessSettingsChange('businessDescription', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-6">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          type="text"
                          id="address"
                          value={businessSettings.address}
                          onChange={(e) => handleBusinessSettingsChange('address', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          type="text"
                          id="city"
                          value={businessSettings.city}
                          onChange={(e) => handleBusinessSettingsChange('city', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="state">State/Emirate</Label>
                        <Input
                          type="text"
                          id="state"
                          value={businessSettings.state}
                          onChange={(e) => handleBusinessSettingsChange('state', e.target.value)}
                          placeholder="e.g., Dubai, Abu Dhabi"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor="zipCode">Postal Code</Label>
                        <Input
                          type="text"
                          id="zipCode"
                          value={businessSettings.zipCode}
                          onChange={(e) => handleBusinessSettingsChange('zipCode', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          type="url"
                          id="website"
                          value={businessSettings.website}
                          onChange={(e) => handleBusinessSettingsChange('website', e.target.value)}
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          value={businessSettings.timezone}
                          onChange={(e) => handleBusinessSettingsChange('timezone', e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="Asia/Dubai">Asia/Dubai</option>
                          {/* Keeping only Asia/Dubai as default */}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          value={businessSettings.currency}
                          onChange={(e) => handleBusinessSettingsChange('currency', e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="AED">AED</option>
                          {/* Keeping only AED as default */}
                        </select>
                      </div>
                    </div>

                    <div className="mt-6">
                      <Button onClick={() => handleSave('business')}>
                        Save Changes
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose how you want to receive notifications
                </p>

                {loading ? (
                  <div className="mt-6 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="mt-6">
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="emailBookings">New Bookings</Label>
                              <Switch
                                id="emailBookings"
                                checked={notificationSettings.emailBookings}
                                onCheckedChange={(checked) => handleNotificationChange('emailBookings', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="emailCancellations">Cancellations</Label>
                              <Switch
                                id="emailCancellations"
                                checked={notificationSettings.emailCancellations}
                                onCheckedChange={(checked) => handleNotificationChange('emailCancellations', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="emailReminders">Reminders</Label>
                              <Switch
                                id="emailReminders"
                                checked={notificationSettings.emailReminders}
                                onCheckedChange={(checked) => handleNotificationChange('emailReminders', checked)}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="smsBookings">New Bookings</Label>
                              <Switch
                                id="smsBookings"
                                checked={notificationSettings.smsBookings}
                                onCheckedChange={(checked) => handleNotificationChange('smsBookings', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="smsCancellations">Cancellations</Label>
                              <Switch
                                id="smsCancellations"
                                checked={notificationSettings.smsCancellations}
                                onCheckedChange={(checked) => handleNotificationChange('smsCancellations', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="smsReminders">Reminders</Label>
                              <Switch
                                id="smsReminders"
                                checked={notificationSettings.smsReminders}
                                onCheckedChange={(checked) => handleNotificationChange('smsReminders', checked)}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Other Notifications</h4>
                          <div className="mt-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="marketingEmails">Marketing Emails</Label>
                              <Switch
                                id="marketingEmails"
                                checked={notificationSettings.marketingEmails}
                                onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="weeklyReports">Weekly Reports</Label>
                              <Switch
                                id="weeklyReports"
                                checked={notificationSettings.weeklyReports}
                                onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button onClick={() => handleSave('notifications')}>
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Update your password and security preferences
                </p>

                <div className="mt-6">
                  <div className="space-y-6 max-w-md">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      />
                    </div>

                    {passwordData.newPassword && (
                      <div className="rounded-md bg-gray-50 p-4">
                        <div className="text-sm">
                          <h4 className="font-medium text-gray-900">Password Requirements</h4>
                          <ul className="mt-2 space-y-1 text-gray-500">
                            <li className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                              At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                              One uppercase letter
                            </li>
                            <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                              One lowercase letter
                            </li>
                            <li className={/\d/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                              One number
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => handleSave('password')}
                      disabled={!validatePassword()}
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}