import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
    try {
      const body = await request.json()
      const { userId, currentPassword, newPassword } = body
  
      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        )
      }
  
      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })
  
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
  
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 }
        )
      }
  
      // Validate new password requirements
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(newPassword)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
          },
          { status: 400 }
        )
      }
  
      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      })
  
      return NextResponse.json({ 
        success: true, 
        message: 'Password updated successfully' 
      })
    } catch (error) {
      console.error('Password update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      )
    }
  }

