export interface ZiinaConfig {
  apiKey: string
  merchantId: string
  environment: 'sandbox' | 'production'
  currency: string
  webhookSecret?: string
}

export interface ZiinaPaymentRequest {
  amount: number
  currency: string
  description: string
  customer: {
    name: string
    email: string
    phone: string
  }
  metadata: {
    bookingId: string
    serviceId: string
    businessSlug: string
    [key: string]: any
  }
  successUrl: string
  cancelUrl: string
  webhookUrl?: string
}

export interface ZiinaPaymentResponse {
  id: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  amount: number
  currency: string
  paymentUrl?: string
  qrCode?: string
  transactionId?: string
  createdAt: string
  expiresAt?: string
}

export class ZiinaPaymentService {
  private config: ZiinaConfig
  private baseURL: string

  constructor(config: ZiinaConfig) {
    this.config = config
    this.baseURL = config.environment === 'production' 
      ? 'https://api.ziina.com/v1' 
      : 'https://sandbox-api.ziina.com/v1'
  }

  async createPayment(request: ZiinaPaymentRequest): Promise<ZiinaPaymentResponse> {
    try {
      const response = await fetch(`${this.baseURL}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Merchant-ID': this.config.merchantId
        },
        body: JSON.stringify({
          ...request,
          currency: request.currency || this.config.currency,
          merchant_id: this.config.merchantId
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Payment creation failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Ziina payment creation error:', error)
      throw error
    }
  }

  async getPaymentStatus(paymentId: string): Promise<ZiinaPaymentResponse> {
    try {
      const response = await fetch(`${this.baseURL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-ID': this.config.merchantId
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch payment status')
      }

      return await response.json()
    } catch (error) {
      console.error('Ziina payment status error:', error)
      throw error
    }
  }

  async cancelPayment(paymentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Merchant-ID': this.config.merchantId
        }
      })

      return response.ok
    } catch (error) {
      console.error('Ziina payment cancellation error:', error)
      return false
    }
  }

  // Generate QR code URL for mobile payments
  generateQRCodeUrl(paymentId: string): string {
    return `${this.baseURL}/payments/${paymentId}/qr`
  }

  // Verify webhook signature for security
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.config.webhookSecret) return false
    
    try {
      // Implementation depends on Ziina's webhook signature method
      // This is a placeholder - replace with actual verification logic
      const crypto = require('crypto')
      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload)
        .digest('hex')
      
      return signature === expectedSignature
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }
}
