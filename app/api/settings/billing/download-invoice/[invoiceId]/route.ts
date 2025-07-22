import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { invoiceId: string } }
  ) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: params.invoiceId }
      })
  
      if (!invoice || !invoice.downloadUrl) {
        return NextResponse.json(
          { success: false, error: 'Invoice not found' },
          { status: 404 }
        )
      }
  
      // Return the download URL or redirect to it
      return NextResponse.json({ 
        success: true, 
        data: { downloadUrl: invoice.downloadUrl } 
      })
    } catch (error) {
      console.error('Invoice download error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to get invoice download link' },
        { status: 500 }
      )
    }
  }