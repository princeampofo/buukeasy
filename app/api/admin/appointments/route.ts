import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entrepreneurId = searchParams.get('entrepreneurId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    if (!entrepreneurId) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur ID required' },
        { status: 400 }
      )
    }

    const whereClause: any = {
      provider: {
        entrepreneurProfile: {
          id: entrepreneurId
        }
      }
    }

    // Apply filters
    if (status && status !== 'All Status') {
      whereClause.status = status.toUpperCase()
    }

    if (date) {
      const selectedDate = new Date(date)
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)

      whereClause.appointmentDate = {
        gte: selectedDate,
        lt: nextDay
      }
    }

    if (search) {
      whereClause.OR = [
        {
          customer: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          service: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    const appointments = await prisma.booking.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        service: {
          select: {
            name: true,
            duration: true,
            price: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    const transformedAppointments = appointments.map((appointment: { id: any; customer: { name: any; email: any; phone: any }; service: { name: any; duration: any; price: any }; appointmentDate: { toISOString: () => string }; appointmentTime: any; status: string; specialRequests: any; modificationNote: any }) => ({
      id: appointment.id,
      customerName: appointment.customer.name,
      customerEmail: appointment.customer.email,
      customerPhone: appointment.customer.phone || '',
      serviceName: appointment.service.name,
      appointmentDate: appointment.appointmentDate.toISOString().split('T')[0],
      appointmentTime: appointment.appointmentTime,
      duration: appointment.service.duration,
      price: appointment.service.price,
      status: appointment.status.toLowerCase(),
      notes: appointment.specialRequests || appointment.modificationNote || ''
    }))

    return NextResponse.json({ success: true, data: transformedAppointments })
  } catch (error) {
    console.error('Appointments fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

