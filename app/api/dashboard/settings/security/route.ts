import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'
import { withAuth } from '@/lib/auth-middleware'
import type { UserData } from '@/types/auth'


export const PUT = withAuth(async (request: NextRequest, user: UserData) => {
  try {
      const userId = user.userId
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID not found' },
          { status: 400 }
        )
      }

      const body = await request.json()
      const {currentPassword, newPassword } = body
  
      if (!userId || !currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        )
      }
  
      // Get current user
      const userData = await prisma.user.findUnique({
        where: { id: userId }
      })
  
      if (!userData) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        )
      }
  
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.password)
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
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      )
    }
  })

