import {NextResponse, NextRequest } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file provided' },
          { status: 400 }
        )
      }
  
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { success: false, error: 'File must be an image' },
          { status: 400 }
        )
      }
  
      // Validate file size (5MB max as shown in your UI)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: 'File size must be less than 5MB' },
          { status: 400 }
        )
      }
  
      // Here you would typically upload to cloud storage (AWS S3, Cloudinary, etc.)
      // For now, returning a mock URL
      const imageUrl = `/uploads/services/${Date.now()}-${file.name}`
  
      return NextResponse.json({ 
        success: true, 
        data: { imageUrl } 
      })
    } catch (error) {
      console.error('File upload error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to upload file' },
        { status: 500 }
      )
    }
  }