import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { withAuth } from '@/lib/auth-middleware'
import { UserData } from '@/types/auth' 

export const GET = withAuth(async (request: NextRequest, user: UserData) => {
  try {
    const userId = user.userId
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    const { pathname } = new URL(request.url)
    const appointmentId = pathname.split('/').pop()
    const body = await request.json()
    const { status, modificationNote } = body

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
    console.error('Appointment update error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
})