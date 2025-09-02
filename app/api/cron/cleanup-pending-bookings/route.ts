// app/api/cron/cleanup-pending-bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Verify cron job authorization (optional)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (process.env.CRON_SECRET && authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🧹 Starting pending bookings cleanup job...')
    
    // Find bookings that are PENDING and older than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - (15 * 60 * 1000))
    
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: fifteenMinutesAgo
        }
      },
      include: {
        service: true,
        entrepreneur: true
      }
    })

    console.log(`🔍 Found ${expiredBookings.length} expired pending bookings`)

    let cleanedBookings = 0
    let errors = 0

    // Process each expired booking (much simpler - just delete the booking)
    for (const booking of expiredBookings) {
      try {
        console.log(`🗑️ Cleaning up expired booking: ${booking.id} (created at: ${booking.createdAt})`)

        // Simply delete the booking (no payment record exists yet)
        await prisma.booking.delete({
          where: { id: booking.id }
        })
        cleanedBookings++
        
        console.log(`   ✅ Deleted booking: ${booking.id}`)
        console.log(`   📋 Cleaned up: ${booking.customerFirstName} ${booking.customerLastName} - ${booking.service.name} at ${booking.appointmentTime} on ${booking.appointmentDate.toLocaleDateString()}`)

      } catch (error) {
        errors++
        console.error(`   ❌ Failed to cleanup booking ${booking.id}:`, error)
        
        // Try to mark as cancelled instead of deleting if deletion fails
        try {
          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: 'CANCELLED',
              cancelReason: 'Payment timeout - automatically cancelled',
              cancelledAt: new Date(),
              updatedAt: new Date()
            }
          })
          console.log(`   ⚠️ Marked booking as cancelled instead: ${booking.id}`)
        } catch (fallbackError) {
          console.error(`   ❌ Failed to mark booking as cancelled: ${booking.id}`, fallbackError)
        }
      }
    }

    const summary = {
      success: true,
      message: `Cleanup completed. Processed ${expiredBookings.length} expired bookings.`,
      details: {
        expiredBookingsFound: expiredBookings.length,
        bookingsCleaned: cleanedBookings,
        errors: errors,
        timeThreshold: sixMinutesAgo.toISOString()
      },
      timestamp: new Date().toISOString()
    }

    console.log(`✅ Cleanup completed:`, summary.details)
    
    return NextResponse.json(summary)

  } catch (error) {
    console.error('❌ Pending bookings cleanup job failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// For Vercel cron jobs, also export as POST
export const POST = GET

// Helper function to manually trigger cleanup (useful for testing)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🧪 Manual cleanup triggered')
    
    // Find all PENDING bookings (regardless of age) for manual cleanup
    const pendingBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING'
      }
    })

    let cleaned = 0
    for (const booking of pendingBookings) {
      try {
        await prisma.booking.delete({ where: { id: booking.id } })
        cleaned++
      } catch (error) {
        console.error(`Failed to cleanup booking ${booking.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Manual cleanup completed. Cleaned ${cleaned} pending bookings.`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Manual cleanup failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Manual cleanup failed',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// GET endpoint to check current pending bookings (useful for monitoring)
export async function PUT(request: NextRequest) {
  try {
    const pendingBookings = await prisma.booking.findMany({
      where: { status: 'PENDING' },
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    })

    const fifteenMinutesAgo = new Date(Date.now() - (15 * 60 * 1000))
    const expiredBookings = pendingBookings.filter(b => b.createdAt < fifteenMinutesAgo)

    return NextResponse.json({
      success: true,
      data: {
        totalPendingBookings: pendingBookings.length,
        expiredPendingBookings: expiredBookings.length,
        pendingBookings: pendingBookings.map(b => ({
          id: b.id,
          customerName: `${b.customerFirstName} ${b.customerLastName}`,
          serviceName: b.service.name,
          appointmentDate: b.appointmentDate,
          appointmentTime: b.appointmentTime,
          createdAt: b.createdAt,
          ageMinutes: Math.floor((Date.now() - b.createdAt.getTime()) / 60000),
          isExpired: b.createdAt < fifteenMinutesAgo
        })),
        expiredBookings: expiredBookings.map(b => ({
          id: b.id,
          customerName: `${b.customerFirstName} ${b.customerLastName}`,
          serviceName: b.service.name,
          appointmentTime: b.appointmentTime,
          createdAt: b.createdAt,
          ageMinutes: Math.floor((Date.now() - b.createdAt.getTime()) / 60000)
        }))
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Failed to fetch pending bookings:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch pending bookings',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}