import { NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getUserFromRequest } from '@/lib/auth-middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const search = searchParams.get('search')

    // Get the authenticated user
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: user.userId }
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
        { customerName: { contains: search, mode: 'insensitive' } },
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
            price: true
          }
        },
        payment: {
          select: {
            amount: true,
            status: true
          }
        }
      },
      orderBy: {
        appointmentDate: 'desc'
      }
    })

    const transformedAppointments = appointments.map((appointment: { id: any; customerName: any; customerEmail: any; customerPhone: any; service: { name: any; duration: any; price: string | number | bigint }; appointmentDate: string | number | Date; appointmentTime: any; status: string; specialRequests: any }) => ({
      id: appointment.id,
      clientName: appointment.customerName,
      clientEmail: appointment.customerEmail,
      clientPhone: appointment.customerPhone || '',
      service: appointment.service.name,
      date: appointment.appointmentDate.toString().split('T')[0],
      time: appointment.appointmentTime,
      duration: appointment.service.duration,
      price: appointment.service.price,
      status: appointment.status.toLowerCase(),
      notes: appointment.specialRequests || '',
      formattedDate: new Date(appointment.appointmentDate).toLocaleDateString(),
      formattedPrice: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(typeof appointment.service.price === 'string' ? parseFloat(appointment.service.price) : Number(appointment.service.price))
    }))

    return NextResponse.json({ success: true, appointments: transformedAppointments })
  } catch (error) {
    console.error('Appointments fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    )
  }
}

