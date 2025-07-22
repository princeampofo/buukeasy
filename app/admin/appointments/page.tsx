'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { cn } from "@/lib/utils"
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
  id: number
  clientName: string
  clientEmail: string
  clientPhone: string
  service: string
  date: string
  time: string
  duration: number
  price?: number
  status: 'confirmed' | 'modified' | 'cancelled' | 'completed'
  notes?: string
  formattedDate?: string
  formattedPrice?: string
}

const statusOptions = ['all', 'confirmed', 'modified', 'cancelled']

const statusConfig = {
  confirmed: { variant: 'success' as const, icon: CheckCircle },
  modified: { variant: 'warning' as const, icon: Edit3 },
  cancelled: { variant: 'destructive' as const, icon: XCircle },
  completed: { variant: 'default' as const, icon: CheckCircle },
} as const

const AppointmentsPage = () => {
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedStatus, setSelectedStatus] = React.useState('all')
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0])
  const [currentWeek, setCurrentWeek] = React.useState(new Date())
  const [viewMode, setViewMode] = React.useState<'list' | 'calendar'>('list')
  const [openDropdown, setOpenDropdown] = React.useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = React.useState<{ type: 'complete' | 'cancel', id: number } | null>(null)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (selectedDate) params.append('date', selectedDate)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/appointments?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch appointments')
      }
      
      const data = await response.json()
      setAppointments(data.appointments)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [selectedStatus, selectedDate, searchTerm])

  const handleMarkComplete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
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

  const handleCancelAppointment = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
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

  const getWeekDays = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDays = getWeekDays(currentWeek)

  if (loading) {
    return (
      <div className="container px-6 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full h-[200px] animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container px-6 py-6">
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

  return (
    <div className="container px-6 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="text-muted-foreground">
              Manage your upcoming and past appointments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? new Date(selectedDate).toLocaleDateString() : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date(selectedDate)}
                onSelect={(date) => date && setSelectedDate(date.toISOString().split('T')[0])}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader className="relative pb-2">
                    <div className="absolute right-6 top-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setConfirmDialog({ type: 'complete', id: appointment.id })}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Complete
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setConfirmDialog({ type: 'cancel', id: appointment.id })}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Appointment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>{appointment.clientName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{appointment.clientName}</CardTitle>
                        <CardDescription>{appointment.service}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          {appointment.time} ({appointment.duration} min)
                        </div>
                        <div>
                          {appointment.formattedPrice || `$${appointment.price}` || 'Free'}
                        </div>
                      </div>
                      <Badge variant={statusConfig[appointment.status].variant}>
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        {appointment.clientEmail}
                      </div>
                      <div className="flex items-center">
                        <Phone className="mr-1 h-3 w-3" />
                        {appointment.clientPhone}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No appointments found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm || selectedStatus !== 'all' || selectedDate ? 
                      'Try adjusting your search or filter criteria.' :
                      'No appointments scheduled yet.'
                    }
                  </p>
                </div>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Week of {weekDays[0].toLocaleDateString()}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const prevWeek = new Date(currentWeek)
                      prevWeek.setDate(currentWeek.getDate() - 7)
                      setCurrentWeek(prevWeek)
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentWeek(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const nextWeek = new Date(currentWeek)
                      nextWeek.setDate(currentWeek.getDate() + 7)
                      setCurrentWeek(nextWeek)
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-7 divide-x divide-border">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                  <div key={day} className="p-4 min-h-[200px]">
                    <div className="font-medium text-sm mb-2">
                      {day} {weekDays[index].getDate()}
                    </div>
                    <div className="space-y-1">
                      {appointments
                        .filter(apt => apt.date === weekDays[index].toISOString().split('T')[0])
                        .map(appointment => (
                          <div
                            key={appointment.id}
                            className="group relative rounded-md p-2 hover:bg-accent cursor-pointer"
                          >
                            <div className="font-medium text-xs">{appointment.time}</div>
                            <div className="text-xs truncate">{appointment.clientName}</div>
                            <div className="text-xs truncate text-muted-foreground">{appointment.service}</div>
                            <Badge 
                              variant={statusConfig[appointment.status].variant}
                              className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialogs */}
        <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
          <DialogContent>
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