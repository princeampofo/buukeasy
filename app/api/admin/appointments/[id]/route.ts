import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // await the params getter, then extract id
    const { id: appointmentId } = await context.params

    // parse the incoming JSON
    const { status } = await request.json()
    
    // TODO: Update appointment status in database
    const updatedAppointment = {
      id: parseInt(appointmentId, 10),
      status,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedAppointment)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    )
  }
}