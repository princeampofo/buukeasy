import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('userId')
      
      if (!userId) {
        return NextResponse.json(
          { success: false, error: 'User ID required' },
          { status: 400 }
        )
      }
  
      // Get user's active subscription
      const subscription = await prisma.subscription.findFirst({
        where: { 
          userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true,
          invoices: {
            orderBy: { invoiceDate: 'desc' },
            take: 10
          }
        }
      })
  
      if (!subscription) {
        return NextResponse.json(
          { success: false, error: 'No active subscription found' },
          { status: 404 }
        )
      }
  
      const billingInfo = {
        currentPlan: {
          name: subscription.plan.name,
          description: subscription.plan.description,
          price: subscription.plan.price,
          currency: subscription.plan.currency,
          interval: subscription.plan.interval,
          nextBillingDate: subscription.nextBillingDate?.toISOString().split('T')[0] || '',
          features: subscription.plan.features as string[]
        },
        paymentMethod: {
          last4: "4242", // This would come from Stripe
          expiryDate: "12/27", // This would come from Stripe
          brand: "visa" // This would come from Stripe
        },
        recentInvoices: subscription.invoices.map((invoice: { id: any; invoiceDate: { toISOString: () => string }; amount: any; status: string; downloadUrl: any }) => ({
          id: invoice.id,
          date: invoice.invoiceDate.toISOString().split('T')[0],
          amount: invoice.amount,
          status: invoice.status.toLowerCase(),
          downloadUrl: invoice.downloadUrl
        }))
      }
  
      return NextResponse.json({ success: true, data: billingInfo })
    } catch (error) {
      console.error('Billing info fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch billing information' },
        { status: 500 }
      )
    }
  }