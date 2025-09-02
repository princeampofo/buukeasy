import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth-middleware'
import { UserData } from '@/types/auth'

export const PUT = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Extract appointment ID from URL path
    const { pathname } = new URL(request.url)
    const appointmentId = pathname.split('/').pop()

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID not found' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status, modificationNote } = body

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    // Verify the appointment belongs to this user's entrepreneur profile
    const entrepreneurProfile = await prisma.entrepreneurProfile.findFirst({
      where: { userId: userId }
    })

    if (!entrepreneurProfile) {
      return NextResponse.json(
        { success: false, error: 'Entrepreneur profile not found' },
        { status: 404 }
      )
    }

    // Check if the appointment belongs to this entrepreneur
    const existingAppointment = await prisma.booking.findFirst({
      where: {
        id: appointmentId,
        entrepreneurId: entrepreneurProfile.id
      }
    })

    if (!existingAppointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found or access denied' },
        { status: 404 }
      )
    }

    // Update the appointment
    const appointment = await prisma.booking.update({
      where: { id: appointmentId },
      data: {
        status: status.toUpperCase(),
        ...(status === 'confirmed' && { confirmedAt: new Date() }),
        ...(status === 'completed' && { completedAt: new Date() }),
        ...(status === 'cancelled' && { cancelledAt: new Date() }),
        ...(status === 'modified' && {
          modifiedAt: new Date(),
          modificationNote
        })
      },
      include: {
        service: true
      }
    })

    return NextResponse.json({ success: true, data: appointment })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
})