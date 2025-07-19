import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, modificationNote } = body

    const appointment = await prisma.booking.update({
      where: { id: params.id },
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
        customer: true,
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
}