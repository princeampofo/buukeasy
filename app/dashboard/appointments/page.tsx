'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Calendar as CalendarIcon, 
  Search, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle,
  XCircle,
  Edit3,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Home,
  Store,
  DollarSign,
  User
} from 'lucide-react'

import { DateTime } from 'luxon'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Appointment {
  id: string
  customerFirstName: string
  customerLastName: string
  clientName: string
  customerEmail: string
  clientEmail: string
  customerPhone: string
  clientPhone: string
  service: string
  serviceLocation: string
  serviceType: string
  date: string
  time: string
  duration: number
  price?: number
  status: 'confirmed' | 'modified' | 'cancelled' | 'completed'
  notes?: string
  timezone?: string
  formattedDate?: string
  formattedPrice?: string
}

const statusOptions = ['all', 'confirmed', 'modified', 'cancelled', 'completed']

const statusConfig = {
  confirmed: { variant: 'success' as const, icon: CheckCircle },
  modified: { variant: 'warning' as const, icon: Edit3 },
  cancelled: { variant: 'destructive' as const, icon: XCircle },
  completed: { variant: 'default' as const, icon: CheckCircle },
} as const

const serviceLocationConfig = {
  home: { icon: Home, label: 'Home Service', color: 'text-blue-600' },
  'in-store': { icon: Store, label: 'In-Store', color: 'text-green-600' },
  unknown: { icon: Store, label: 'Service', color: 'text-gray-600' }
}

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeSearchTerm, setActiveSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedDate, setSelectedDate] = useState<string | null>(DateTime.now().setZone('Asia/Dubai').toISODate())
  const [currentWeek, setCurrentWeek] = useState<DateTime | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'complete' | 'cancel', id: string } | null>(null)
  const [timezone, setTimezone] = useState<string>('UTC')

  // Helper functions that use the dynamic timezone
  const getCurrentDateTime = useCallback(() => {
    return DateTime.now().setZone(timezone)
  }, [timezone])

  const createDateTimeFromString = useCallback((dateString: string) => {
    // Ensure we parse the date correctly in the specified timezone
    return DateTime.fromISO(dateString, { zone: timezone })
  }, [timezone])

  const getWeekDays = useCallback((currentDate: DateTime) => {
    // Start week on Sunday (0) - Luxon uses 1-7 where 1=Monday, 7=Sunday
    const dayOfWeek = currentDate.weekday === 7 ? 0 : currentDate.weekday
    const startOfWeek = currentDate.minus({ days: dayOfWeek })
    
    const week = []
    for (let i = 0; i < 7; i++) {
      week.push(startOfWeek.plus({ days: i }))
    }
    return week
  }, [])

  const formatDateDisplay = useCallback((dateTime: DateTime) => {
    return dateTime.toLocaleString({
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })
  }, [])

  const toCalendarDate = useCallback((dateTime: DateTime) => {
    // Convert to local date for the calendar component
    return new Date(dateTime.year, dateTime.month - 1, dateTime.day)
  }, [])

  const fromCalendarDate = useCallback((date: Date) => {
    // Create DateTime from calendar date in the correct timezone
    return DateTime.fromObject({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    }, { zone: timezone })
  }, [timezone])

  // Initialize dates after timezone is loaded
  useEffect(() => {
    if (timezone && timezone !== 'UTC') {
      const now = getCurrentDateTime()
      if (!selectedDate) {
        setSelectedDate(now.toISODate())
      }
      if (!currentWeek) {
        setCurrentWeek(now)
      }
    }
  }, [timezone, getCurrentDateTime, selectedDate, currentWeek])

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedDate) params.append('date', selectedDate)
      if (activeSearchTerm) params.append('search', activeSearchTerm)

      const response = await fetch(`/api/dashboard/appointments?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      
      const data = await response.json()
      setAppointments(data.appointments)
      
      // Set timezone from response
      if (data.timezone && data.timezone !== timezone) {
        setTimezone(data.timezone)
      }
      
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedStatus, selectedDate, activeSearchTerm, timezone])

  const handleSearch = () => {
    setActiveSearchTerm(searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setActiveSearchTerm('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleMarkComplete = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark appointment as complete')
      }

      await fetchAppointments()
      setConfirmDialog(null)
    } catch (err) {
      console.error('Error marking appointment as complete:', err)
    }
  }

  const handleCancelAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel appointment')
      }

      await fetchAppointments()
      setConfirmDialog(null)
    } catch (err) {
      console.error('Error cancelling appointment:', err)
    }
  }

  const handlePrevWeek = () => {
    if (currentWeek) {
      setCurrentWeek(currentWeek.minus({ weeks: 1 }))
    }
  }

  const handleNextWeek = () => {
    if (currentWeek) {
      setCurrentWeek(currentWeek.plus({ weeks: 1 }))
    }
  }

  const handleToday = () => {
    const now = getCurrentDateTime()
    setCurrentWeek(now)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    const luxonDate = fromCalendarDate(date)
    setSelectedDate(luxonDate.toISODate())
  }

  // Helper function to determine available actions for an appointment
  const getAvailableActions = (appointment: Appointment) => {
    const actions = []
    
    // Can only mark as complete if not already completed or cancelled
    if (appointment.status !== 'completed' && appointment.status !== 'cancelled') {
      actions.push({
        type: 'complete' as const,
        label: 'Complete',
        icon: CheckCircle,
        className: ''
      })
    }
    
    // Can only cancel if not already cancelled or completed
    if (appointment.status !== 'cancelled' && appointment.status !== 'completed') {
      actions.push({
        type: 'cancel' as const,
        label: 'Cancel',
        icon: XCircle,
        className: 'text-destructive'
      })
    }
    
    return actions
  }

  if (loading) {
    return (
      <div className="container px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full h-[120px] sm:h-[200px] animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-4 sm:px-6 py-4 sm:py-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading appointments</CardTitle>
            <CardDescription className="text-destructive">{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={fetchAppointments}>
              Try again
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Don't render until we have timezone
  if (!currentWeek || !selectedDate) {
    return (
      <div className="container px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full h-[120px] sm:h-[200px] animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  const weekDays = getWeekDays(currentWeek)

  return (
    <div className="container px-4 sm:px-6 py-4 sm:py-6">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="text-sm text-muted-foreground">
              <span className="hidden sm:inline">Manage your upcoming and past appointments</span>
              <span className="sm:hidden">Manage appointments</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
              size="sm"
              className="hidden sm:inline-flex"
            >
              Calendar
            </Button>
          </div>
        </div>

        <Separator className="hidden sm:block" />

        {/* Filters */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-4 sm:gap-4">
          <div className="lg:col-span-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-9"
                  size="sm"
                />
              </div>
              <Button onClick={handleSearch} variant="default" size="sm">
                <span className="hidden sm:inline">Search</span>
                <Search className="h-4 w-4 sm:hidden" />
              </Button>
              {activeSearchTerm && (
                <Button onClick={handleClearSearch} variant="outline" size="sm">
                  Clear
                </Button>
              )}
            </div>
            {activeSearchTerm && (
              <p className="text-xs text-muted-foreground mt-1">
                Searching: "{activeSearchTerm}"
              </p>
            )}
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger size="sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {selectedDate ? 
                    createDateTimeFromString(selectedDate).toLocaleString(DateTime.DATE_MED) : 
                    "Pick a date"
                  }
                </span>
                <span className="sm:hidden">
                  {selectedDate ? 
                    createDateTimeFromString(selectedDate).toLocaleString({month: 'short', day: 'numeric'}) : 
                    "Date"
                  }
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate ? toCalendarDate(createDateTimeFromString(selectedDate)) : undefined}
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="space-y-3 sm:space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => {
                const ServiceTypeIcon = serviceLocationConfig[appointment.serviceType]?.icon || Store
                const appointmentDateTime = createDateTimeFromString(appointment.date)
                const availableActions = getAvailableActions(appointment)
                
                return (
                  <Card key={appointment.id} className="relative">
                    <CardHeader className="pb-2 sm:pb-2">
                      {availableActions.length > 0 && (
                        <div className="absolute right-3 top-3 sm:right-6 sm:top-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {availableActions.map((action) => (
                                <DropdownMenuItem
                                  key={action.type}
                                  className={action.className}
                                  onClick={() => setConfirmDialog({ type: action.type, id: appointment.id })}
                                >
                                  <action.icon className="mr-2 h-4 w-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-3 pr-8">
                        <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                          <AvatarFallback className="text-xs sm:text-sm">
                            {appointment.clientName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg truncate">
                            {appointment.clientName}
                          </CardTitle>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                            <CardDescription className="truncate text-sm">
                              {appointment.service}
                            </CardDescription>
                            <div className={`flex items-center text-xs ${serviceLocationConfig[appointment.serviceType]?.color || 'text-gray-600'}`}>
                              <ServiceTypeIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                              <span className="hidden sm:inline">
                                {serviceLocationConfig[appointment.serviceType]?.label || 'Service'}
                              </span>
                              <span className="sm:hidden">
                                {serviceLocationConfig[appointment.serviceType]?.label === 'Home Service' ? 'Home' : 'Store'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Mobile: Show date and time prominently */}
                          <div className="sm:hidden mt-1 space-y-1">
                            <div className="text-sm font-medium">
                              {appointmentDateTime.toLocaleString({weekday: 'short', month: 'short', day: 'numeric'})}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {appointment.time}
                            </div>
                          </div>
                          
                          {/* Desktop: Show full date */}
                          <CardDescription className="text-xs hidden sm:block">
                            {appointmentDateTime.toLocaleString(DateTime.DATE_FULL)}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="py-2 sm:pb-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          {/* Desktop: Show all info */}
                          <div className="hidden sm:flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            {appointment.time} ({appointment.duration} min)
                          </div>
                          
                          {/* Mobile: Show duration only */}
                          <div className="flex items-center sm:hidden">
                            <span>{appointment.duration} min</span>
                          </div>
                          
                          <div className="flex items-center">
                            <DollarSign className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                            {appointment.formattedPrice || 'Free'}
                          </div>
                        </div>
                        
                        <Badge variant={statusConfig[appointment.status].variant} className="text-xs">
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      {appointment.notes && (
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                    </CardContent>
                    
                    {/* Contact info - hidden on mobile, shown on desktop */}
                    <CardFooter className="hidden sm:block">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center truncate">
                          <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{appointment.clientEmail}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-1 h-3 w-3" />
                          {appointment.clientPhone}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })
            ) : (
              <Card className="p-8 sm:p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <CalendarIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                  <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold">No appointments found</h3>
                  <p className="mt-1 sm:mt-2 text-sm text-muted-foreground">
                    {searchTerm || selectedStatus !== 'all' || selectedDate ? 
                      'Try adjusting your filters.' :
                      'No appointments scheduled.'
                    }
                  </p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card className="hidden sm:block">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>
                  Week of {weekDays[0].toLocaleString(DateTime.DATE_MED)}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevWeek}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToday}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextWeek}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 divide-x divide-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                  const dayDateTime = weekDays[index]
                  const isToday = dayDateTime.hasSame(getCurrentDateTime(), 'day')
                  
                  return (
                    <div key={day} className="p-4 min-h-[200px]">
                      <div className={`font-medium text-sm mb-2 ${isToday ? 'text-primary' : ''}`}>
                        {day} {dayDateTime.day}
                        {isToday && <span className="text-xs ml-1">(Today)</span>}
                      </div>
                      <div className="space-y-1">
                        {appointments
                          .filter(apt => apt.date === dayDateTime.toISODate())
                          .sort((a, b) => {
                            const timeA = DateTime.fromFormat(a.time, 'HH:mm', { zone: timezone })
                            const timeB = DateTime.fromFormat(b.time, 'HH:mm', { zone: timezone })
                            return timeA < timeB ? -1 : 1
                          })
                          .map(appointment => {
                            const ServiceTypeIcon = serviceLocationConfig[appointment.serviceType]?.icon || Store
                            const appointmentTime = DateTime.fromFormat(appointment.time, 'HH:mm', { zone: timezone })
                            
                            return (
                              <div
                                key={appointment.id}
                                className="group relative rounded-md p-2 hover:bg-accent cursor-pointer"
                              >
                                <div className="font-medium text-xs">
                                  {appointmentTime.toLocaleString(DateTime.TIME_SIMPLE)}
                                </div>
                                <div className="text-xs truncate">{appointment.clientName}</div>
                                <div className="flex items-center text-xs truncate text-muted-foreground">
                                  <ServiceTypeIcon className="h-3 w-3 mr-1" />
                                  {appointment.service}
                                </div>
                                <Badge 
                                  variant={statusConfig[appointment.status].variant}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                >
                                  {appointment.status}
                                </Badge>
                              </div>
                            )
                          })
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialogs */}
        <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
          <DialogContent className="mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>
                {confirmDialog?.type === 'complete' ? 'Mark as Complete' : 'Cancel Appointment'}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog?.type === 'complete'
                  ? 'Are you sure you want to mark this appointment as complete?'
                  : 'Are you sure you want to cancel this appointment? This action cannot be undone.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                No, go back
              </Button>
              <Button
                variant={confirmDialog?.type === 'complete' ? 'default' : 'destructive'}
                onClick={() => {
                  if (!confirmDialog) return
                  if (confirmDialog.type === 'complete') {
                    handleMarkComplete(confirmDialog.id)
                  } else {
                    handleCancelAppointment(confirmDialog.id)
                  }
                }}
              >
                Yes, {confirmDialog?.type === 'complete' ? 'complete' : 'cancel'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default AppointmentsPage