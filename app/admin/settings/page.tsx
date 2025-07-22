'use client'

import { useState } from 'react'
import { 
  Settings, 
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
import { useToast } from '@/components/ui/use-toast'

interface BusinessSettings {
  businessName: string
  ownerName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  website: string
  description: string
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business')
  const { toast } = useToast()

  // Business settings state
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    website: '',
    description: '',
    timezone: '',
    currency: ''
  })

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailBookings: false,
    emailCancellations: false,
    emailReminders: false,
    smsBookings: false,
    smsCancellations: false,
    smsReminders: false,
    marketingEmails: false,
    weeklyReports: false
  })

  // Password change state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Load initial data
  // useEffect(() => {
  //   loadSettings()
  // }, [])

  // const loadSettings = async () => {
  //   setIsLoading(true)
  //   try {
  //     // Load business settings
  //     const businessResponse = await fetch('/api/admin/settings/business')
  //     if (businessResponse.ok) {
  //       const businessData = await businessResponse.json()
  //       setBusinessSettings(businessData)
  //     }

  //     // Load notification settings
  //     const notificationResponse = await fetch('/api/admin/settings/notifications')
  //     if (notificationResponse.ok) {
  //       const notificationData = await notificationResponse.json()
  //       setNotificationSettings(notificationData)
  //     }
  //   } catch (error) {
  //     console.error('Failed to load settings:', error)
  //     setSaveStatus('error')
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const handleBusinessSettingsChange = (field: keyof BusinessSettings, value: string) => {
    setBusinessSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNotificationChange = (field: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePasswordChange = (field: keyof PasswordData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async (settingsType: string) => {
    // setIsSaving(true)
    // setSaveStatus('idle')

    try {
      let endpoint = ''
      let data = {}

      switch (settingsType) {
        case 'business':
          endpoint = '/api/admin/settings/business'
          data = businessSettings
          break
        case 'notifications':
          endpoint = '/api/admin/settings/notifications'
          data = notificationSettings
          break
        case 'password':
          endpoint = '/api/admin/settings/password'
          data = passwordData
          break
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        // setSaveStatus('success')
        if (settingsType === 'password') {
          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        }
        // setTimeout(() => setSaveStatus('idle'), 3000)
        toast({
          title: 'Settings saved',
          description: 'Your settings have been saved.',
        })
      } else {
        const errorData = await response.json()
        console.error('Save error:', errorData)
        // setSaveStatus('error')
        toast({
          title: 'Error saving settings',
          description: errorData.message || 'Failed to save settings. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Save error:', error)
      // setSaveStatus('error')
      toast({
        title: 'Error saving settings',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    } finally {
      // setIsSaving(false)
    }
  }

  const validatePassword = (): boolean => {
    return passwordData.newPassword.length >= 8 && 
           passwordData.newPassword === passwordData.confirmPassword &&
           passwordData.currentPassword.length > 0 &&
           /[A-Z]/.test(passwordData.newPassword) &&
           /[a-z]/.test(passwordData.newPassword) &&
           /\d/.test(passwordData.newPassword)
  }

  const copyBookingUrl = async () => {
    // const url = `${window.location.origin}/book/${user?.businessSlug}`
    // await navigator.clipboard.writeText(url)
    // setShowCopiedMessage(true)
    // setTimeout(() => setShowCopiedMessage(false), 2000)
  }

  // const tabs = [
  //   { id: 'business', name: 'Business Info', icon: Building },
  //   { id: 'notifications', name: 'Notifications', icon: Bell },
  //   { id: 'security', name: 'Security', icon: Shield },
  //   { id: 'billing', name: 'Billing', icon: CreditCard }
  // ]

  // if (isLoading) {
  //   return (
  //     <div className="py-6">
  //       <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
  //         <div className="flex items-center justify-center h-64">
  //           <div className="flex items-center">
  //             <Loader2 className="h-6 w-6 animate-spin mr-2" />
  //             <span className="text-gray-600">Loading settings...</span>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your business settings and preferences
          </p>
        </div>

        {/* Booking URL Card */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-100">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Your Booking Page</h3>
                <p className="mt-1 text-sm text-gray-500">Share this link with your clients to let them book appointments</p>
              </div>
              {/* <Link
                href={`/book/${user?.businessSlug}`}
                target="_blank"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Link> */}
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <div className="flex-1 flex items-center px-3 py-2 bg-white rounded-md border border-gray-300">
                {/* <Globe className="h-4 w-4 text-gray-400 mr-2" /> */}
                <span className="text-gray-600">Booking URL will be displayed here</span>
              </div>
              <button
                onClick={copyBookingUrl}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {/* {showCopiedMessage ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Clipboard className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )} */}
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {/* {saveStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-md ${
            saveStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              {saveStatus === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
              <div className="ml-3">
                <p className={`text-sm ${
                  saveStatus === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {saveStatus === 'success' 
                    ? 'Settings saved successfully!' 
                    : 'There was an error saving your settings. Please try again.'
                  }
                </p>
              </div>
            </div>
          </div>
        )} */}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'business' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Business Information
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your business details and contact information
              </p>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <div className="relative">
                    {/* <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    <Input
                      type="text"
                      value={businessSettings.businessName}
                      onChange={(e) => handleBusinessSettingsChange('businessName', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner Name
                  </label>
                  <div className="relative">
                    {/* <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    <Input
                      type="text"
                      value={businessSettings.ownerName}
                      onChange={(e) => handleBusinessSettingsChange('ownerName', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter owner name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    {/* <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    <Input
                      type="email"
                      value={businessSettings.email}
                      onChange={(e) => handleBusinessSettingsChange('email', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    {/* <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    <Input
                      type="tel"
                      value={businessSettings.phone}
                      onChange={(e) => handleBusinessSettingsChange('phone', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  {/* <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                  <Input
                    type="text"
                    value={businessSettings.address}
                    onChange={(e) => handleBusinessSettingsChange('address', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter street address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    type="text"
                    value={businessSettings.city}
                    onChange={(e) => handleBusinessSettingsChange('city', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    type="text"
                    value={businessSettings.state}
                    onChange={(e) => handleBusinessSettingsChange('state', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code
                  </label>
                  <Input
                    type="text"
                    value={businessSettings.zipCode}
                    onChange={(e) => handleBusinessSettingsChange('zipCode', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="relative">
                  {/* <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                  <Input
                    type="url"
                    value={businessSettings.website}
                    onChange={(e) => handleBusinessSettingsChange('website', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourbusiness.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description
                </label>
                <textarea
                  rows={4}
                  value={businessSettings.description}
                  onChange={(e) => handleBusinessSettingsChange('description', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your business and services..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <div className="relative">
                    {/* <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    <select
                      value={businessSettings.timezone}
                      onChange={(e) => handleBusinessSettingsChange('timezone', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select timezone</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <div className="relative">
                    {/* <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    <select
                      value={businessSettings.currency}
                      onChange={(e) => handleBusinessSettingsChange('currency', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select currency</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => handleSave('business')}
                  // disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )} */}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Notification Preferences
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Choose how you want to be notified about appointments and business activities
              </p>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  {/* <Mail className="h-4 w-4 mr-2" /> */}
                  Email Notifications
                </h4>
                <div className="space-y-3">
                  {Object.entries({
                    emailBookings: 'New appointment bookings',
                    emailCancellations: 'Appointment cancellations',
                    emailReminders: 'Daily appointment reminders',
                    marketingEmails: 'Marketing and promotional emails',
                    weeklyReports: 'Weekly business reports'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <Switch
                        checked={notificationSettings[key as keyof NotificationSettings] as boolean}
                        onCheckedChange={(checked) => handleNotificationChange(key as keyof NotificationSettings, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                  {/* <Smartphone className="h-4 w-4 mr-2" /> */}
                  SMS Notifications
                </h4>
                <div className="space-y-3">
                  {Object.entries({
                    smsBookings: 'New appointment bookings',
                    smsCancellations: 'Appointment cancellations',
                    smsReminders: 'Appointment reminders'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{label}</span>
                      <Switch
                        checked={notificationSettings[key as keyof NotificationSettings] as boolean}
                        onCheckedChange={(checked) => handleNotificationChange(key as keyof NotificationSettings, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={() => handleSave('notifications')}
                  // disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )} */}
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Security Settings
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Update your password and manage security preferences
              </p>
            </div>
            <div className="px-6 py-4 space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Change Password
                </h4>
                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        type="password"
                        id="current-password"
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                      {/* <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button> */}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type="password"
                        id="new-password"
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                      {/* <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button> */}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        type="password"
                        id="confirm-new-password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                      {/* <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button> */}
                    </div>
                    {passwordData.newPassword && passwordData.confirmPassword && 
                     passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className={`flex items-center ${passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                        {/* <CheckCircle className={`h-3 w-3 mr-2 ${passwordData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-300'}`} /> */}
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                        {/* <CheckCircle className={`h-3 w-3 mr-2 ${/[A-Z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-300'}`} /> */}
                        One uppercase letter
                      </li>
                      <li className={`flex items-center ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                        {/* <CheckCircle className={`h-3 w-3 mr-2 ${/[a-z]/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-300'}`} /> */}
                        One lowercase letter
                      </li>
                      <li className={`flex items-center ${/\d/.test(passwordData.newPassword) ? 'text-green-600' : ''}`}>
                        {/* <CheckCircle className={`h-3 w-3 mr-2 ${/\d/.test(passwordData.newPassword) ? 'text-green-500' : 'text-gray-300'}`} /> */}
                        One number
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleSave('password')}
                    // disabled={isSaving || !validatePassword()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {/* {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )} */}
                    Update Password
                  </Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Account Security
                </h4>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    {/* <Shield className="h-5 w-5 text-blue-400" /> */}
                    <div className="ml-3">
                      <h5 className="text-sm font-medium text-blue-800">
                        Two-Factor Authentication
                      </h5>
                      <p className="mt-1 text-sm text-blue-700">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <button
                        type="button"
                        className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        Enable 2FA (Coming Soon)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* {activeTab === 'billing' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Billing & Subscription
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your subscription and billing information
              </p>
            </div>
            <div className="px-6 py-4 space-y-6">
              {billingError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{billingError}</p>
                    </div>
                  </div>
                </div>
              )}

              {isBillingLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-gray-600">Loading billing information...</span>
                  </div>
                </div>
              ) : billingInfo && (
                <>
                  {/* Current Plan */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Current Plan
                    </h4>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-lg font-semibold text-blue-900">{billingInfo.currentPlan.name}</h5>
                          <p className="text-blue-700">{billingInfo.currentPlan.description}</p>
                          <p className="text-sm text-blue-600 mt-2">
                            Next billing date: {billingInfo.currentPlan.nextBillingDate}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-900">
                            {billingInfo.currentPlan.currency} {billingInfo.currentPlan.price}
                          </div>
                          <div className="text-sm text-blue-700">
                            per {billingInfo.currentPlan.interval}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Plan Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {billingInfo.currentPlan.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Payment Method
                    </h4>
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">•••• •••• •••• {billingInfo.paymentMethod.last4}</p>
                            <p className="text-xs text-gray-500">Expires {billingInfo.paymentMethod.expiryDate}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                          onClick={() => {/* TODO: Implement payment method update */}}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Billing History */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">
                      Recent Invoices
                    </h4>
                    <div className="space-y-3">
                      {billingInfo.recentInvoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{invoice.date}</p>
                            <p className="text-xs text-gray-500">{billingInfo.currentPlan.name}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-900">
                              {billingInfo.currentPlan.currency} {invoice.amount}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </span>
                            <button 
                              className="text-sm text-blue-600 hover:text-blue-500"
                              onClick={() => downloadInvoice(invoice.id)}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Change Plan
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Update Payment Method
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )} */}
      </div>
    </div>
  )
}