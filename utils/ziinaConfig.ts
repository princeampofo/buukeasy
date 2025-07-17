
import { ZiinaConfig } from '../lib/ziina';

export const ziinaConfig: ZiinaConfig = {
  apiKey: process.env.NEXT_PUBLIC_ZIINA_API_KEY || '',
  merchantId: process.env.NEXT_PUBLIC_ZIINA_MERCHANT_ID || '',
  environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production',
  currency: 'AED', // UAE Dirham
  webhookSecret: process.env.ZIINA_WEBHOOK_SECRET
}