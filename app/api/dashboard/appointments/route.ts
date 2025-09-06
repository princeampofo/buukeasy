import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth-middleware'
import { UserData } from '@/types/auth'
import { DateTime } from 'luxon'

export const GET = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    // Get user ID from the user data
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    const whereClause: any = {
      entrepreneurId: entrepreneurProfile.id
    }

    // Apply filters
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase()
    }
    else{
      whereClause.status = {
        in: ['CONFIRMED', 'MODIFIED', 'CANCELLED', 'COMPLETED']
      }
    }

    if (date) {
      // Use the entrepreneur's timezone for date filtering
      const selectedDate = DateTime.fromISO(date, { zone: entrepreneurProfile.timezone }).startOf('day')
      whereClause.appointmentDate = selectedDate.toISODate()
    }

    if (search) {
      whereClause.OR = [
        { customerFirstName: { contains: search, mode: 'insensitive' } },
        { customerLastName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const appointments = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: {
          select: {
            name: true,
            duration: true,
            offersHomeService: true,
            offersInStoreService: true,
            homeServicePrice: true,
            inStoreServicePrice: true,
            homeServiceDeposit: true,
            inStoreServiceDeposit: true
          }
        },
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    const transformedAppointments = appointments.map((appointment: any) => {
      // Determine the price based on service type
      let servicePrice = 0
      let depositAmount = 0

      // Check if booking has serviceLocation field to determine which pricing to use
      if (appointment.serviceLocation === 'home') {
        servicePrice = appointment.service.homeServicePrice || 0
        depositAmount = appointment.service.homeServiceDeposit || 0
      } else if (appointment.serviceLocation === 'in-store') {
        servicePrice = appointment.service.inStoreServicePrice || 0
        depositAmount = appointment.service.inStoreServiceDeposit || 0
      }

      return {
        id: appointment.id,
        customerFirstName: appointment.customerFirstName,
        customerLastName: appointment.customerLastName,
        clientName: `${appointment.customerFirstName} ${appointment.customerLastName}`, // For frontend compatibility
        customerEmail: appointment.customerEmail,
        clientEmail: appointment.customerEmail, // For frontend compatibility
        customerPhone: appointment.customerPhone || '',
        clientPhone: appointment.customerPhone || '', // For frontend compatibility
        service: appointment.service.name,
        serviceLocation: appointment.serviceLocation,
        serviceType: appointment.serviceLocation, // For frontend compatibility
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        duration: appointment.service.duration,
        price: servicePrice,
        depositAmount: depositAmount,
        status: appointment.status.toLowerCase(),
        notes: appointment.specialRequests || '',
        timezone: entrepreneurProfile.timezone, // Include timezone for frontend
        formattedDate: DateTime.fromISO(appointment.appointmentDate, { zone: entrepreneurProfile.timezone }).toISO(),
        formattedPrice: servicePrice > 0 ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'AED'
        }).format(servicePrice) : 'Free',
        formattedDeposit: depositAmount > 0 ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'AED'
        }).format(depositAmount) : null
      }
    })

    return NextResponse.json({ 
      success: true, 
      appointments: transformedAppointments,
      timezone: entrepreneurProfile.timezone // Include timezone in response
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
})