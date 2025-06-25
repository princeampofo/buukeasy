'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CreditCard, Lock, Calendar, User, Mail, Phone, Apple, MapPin } from 'lucide-react'

interface PaymentData {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  billingAddress: string
  city: string
  zipCode: string
  paymentMethod: 'card' | 'applepay' | 'googlepay' | 'paypal' | 'alipay' | 'wechatpay'
  paymentType: 'full' | 'deposit'
}

export default function PaymentPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')
  const date = searchParams.get('date')
  const time = searchParams.get('time')
  const firstName = searchParams.get('firstName')
  const lastName = searchParams.get('lastName')
  const email = searchParams.get('email')
  const phone = searchParams.get('phone')
  const serviceLocation = searchParams.get('location') || 'in-store'
  const serviceAddress = searchParams.get('address') || ''


  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    paymentMethod: 'card',
    paymentType: 'full'
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Partial<PaymentData>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
      if (formatted.replace(/\s/g, '').length <= 16) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }))
      }
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2')
      if (formatted.length <= 5) {
        setPaymentData(prev => ({ ...prev, [name]: formatted }))
      }
    }
    // Format CVV
    else if (name === 'cvv') {
      if (value.length <= 4) {
        setPaymentData(prev => ({ ...prev, [name]: value }))
      }
    }
    else {
      setPaymentData(prev => ({ ...prev, [name]: value }))
    }

    // Clear errors
    if (errors[name as keyof PaymentData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: Partial<PaymentData> = {}

    if (paymentData.paymentMethod === 'card') {
      if (!paymentData.cardNumber.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required'
      } else if (paymentData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Card number must be 16 digits'
      }

      if (!paymentData.expiryDate) {
        newErrors.expiryDate = 'Expiry date is required'
      } else if (!/^\d{2}\/\d{2}$/.test(paymentData.expiryDate)) {
        newErrors.expiryDate = 'Invalid expiry date format'
      }

      if (!paymentData.cvv) {
        newErrors.cvv = 'CVV is required'
      } else if (paymentData.cvv.length < 3) {
        newErrors.cvv = 'CVV must be at least 3 digits'
      }

      if (!paymentData.cardholderName.trim()) {
        newErrors.cardholderName = 'Cardholder name is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Redirect to confirmation
    window.location.href = `/book/${slug}/confirmation?booking=success&paymentType=${paymentData.paymentType}&location=${serviceLocation}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

   // Update service fee based on location
  const serviceFee = serviceLocation === 'home' ? 150.00 : 120.00
  const bookingFee = 5.00 // Small service fee
  const taxes = 12.00
  const subtotal = serviceFee + bookingFee + taxes 
  const depositAmount = bookingFee + (serviceFee * 0.20) // Booking fee + 20% of service fee
  const remainingAmount = serviceFee - (serviceFee * 0.20) + taxes // Remaining 80% + taxes

  const getTotalAmount = () => {
    return paymentData.paymentType === 'full' ? subtotal : depositAmount
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
      case 'applepay':
        return <Apple className="h-5 w-5 mr-2 text-gray-600" />
      case 'googlepay':
        return (
          <div className="w-5 h-5 mr-2 rounded text-xs flex items-center justify-center bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold">
            G
          </div>
        )
      case 'paypal':
        return <div className="w-5 h-5 mr-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center">P</div>
      case 'alipay':
        return <div className="w-5 h-5 mr-2 bg-blue-500 rounded text-white text-xs flex items-center justify-center">A</div>
      case 'wechatpay':
        return <div className="w-5 h-5 mr-2 bg-green-500 rounded text-white text-xs flex items-center justify-center">W</div>
      default:
        return null
    }
  }

  const renderThirdPartyPayment = (method: string, name: string) => (
    <div className="card text-center py-8">
      <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
        {method === 'applepay' && <Apple className="h-12 w-12 text-gray-600" />}
        {method === 'googlepay' && (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white text-xl font-bold flex items-center justify-center">
            G
          </div>
        )}
        {method === 'paypal' && (
          <div className="w-12 h-12 bg-blue-600 rounded-full text-white text-xl font-bold flex items-center justify-center">
            P
          </div>
        )}
        {method === 'alipay' && (
          <div className="w-12 h-12 bg-blue-500 rounded-full text-white text-xl font-bold flex items-center justify-center">
            A
          </div>
        )}
        {method === 'wechatpay' && (
          <div className="w-12 h-12 bg-green-500 rounded-full text-white text-xl font-bold flex items-center justify-center">
            W
          </div>
        )}
      </div>
      <h3 className="text-lg font-semibold mb-2">Pay with {name}</h3>
      <p className="text-gray-600 mb-4">
        You'll be redirected to {name} to complete your payment securely.
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Type Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Payment Option</h2>
            <div className="space-y-3">
              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="full"
                  checked={paymentData.paymentType === 'full'}
                  onChange={handleInputChange}
                  className="mr-3 mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Pay in Full</div>
                  <div className="text-sm text-gray-600">
                    Complete payment now - ${subtotal.toFixed(2)}
                  </div>
                </div>
              </label>

              <label className="flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentType"
                  value="deposit"
                  checked={paymentData.paymentType === 'deposit'}
                  onChange={handleInputChange}
                  className="mr-3 mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Pay Booking Deposit</div>
                  <div className="text-sm text-gray-600">
                    Secure your appointment with ${depositAmount.toFixed(2)} now
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Pay remaining ${remainingAmount.toFixed(2)} in cash at appointment
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentData.paymentMethod === 'card'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                {getPaymentMethodIcon('card')}
                <span>Credit/Debit Card</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="applepay"
                  checked={paymentData.paymentMethod === 'applepay'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                {getPaymentMethodIcon('applepay')}
                <span>Apple Pay</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="googlepay"
                  checked={paymentData.paymentMethod === 'googlepay'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                {getPaymentMethodIcon('googlepay')}
                <span>Google Pay</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={paymentData.paymentMethod === 'paypal'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                {getPaymentMethodIcon('paypal')}
                <span>PayPal</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="alipay"
                  checked={paymentData.paymentMethod === 'alipay'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                {getPaymentMethodIcon('alipay')}
                <span>Alipay</span>
              </label>

              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wechatpay"
                  checked={paymentData.paymentMethod === 'wechatpay'}
                  onChange={handleInputChange}
                  className="mr-3"
                />
                {getPaymentMethodIcon('wechatpay')}
                <span>WeChat Pay</span>
              </label>
            </div>
          </div>

          {/* Card Details */}
          {paymentData.paymentMethod === 'card' && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Card Details</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    className={`input-field ${errors.cardNumber ? 'border-red-500' : ''}`}
                    placeholder="1234 5678 9012 3456"
                  />
                  {errors.cardNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleInputChange}
                      className={`input-field ${errors.expiryDate ? 'border-red-500' : ''}`}
                      placeholder="MM/YY"
                    />
                    {errors.expiryDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="form-label">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleInputChange}
                      className={`input-field ${errors.cvv ? 'border-red-500' : ''}`}
                      placeholder="123"
                    />
                    {errors.cvv && (
                      <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardholderName"
                    value={paymentData.cardholderName}
                    onChange={handleInputChange}
                    className={`input-field ${errors.cardholderName ? 'border-red-500' : ''}`}
                    placeholder="John Doe"
                  />
                  {errors.cardholderName && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardholderName}</p>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Third-party Payment Methods */}
          {paymentData.paymentMethod === 'applepay' && renderThirdPartyPayment('applepay', 'Apple Pay')}
          {paymentData.paymentMethod === 'googlepay' && renderThirdPartyPayment('googlepay', 'Google Pay')}
          {paymentData.paymentMethod === 'paypal' && renderThirdPartyPayment('paypal', 'PayPal')}
          {paymentData.paymentMethod === 'alipay' && renderThirdPartyPayment('alipay', 'Alipay')}
          {paymentData.paymentMethod === 'wechatpay' && renderThirdPartyPayment('wechatpay', 'WeChat Pay')}

          {/* Security Notice */}
          <div className="flex items-center justify-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <Lock className="h-4 w-4 mr-2" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
            
            {/* Appointment Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <span>{date && formatDate(date)} at {time}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                <span>{serviceLocation === 'home' ? `Home Service: ${decodeURIComponent(serviceAddress)}` : 'In-Store Service'}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <span>{firstName} {lastName}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                <span>{email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                <span>{phone}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Service</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Deep Tissue Massage (60 min)</span>
                  <span>${(serviceLocation === 'home' ? 120.00 : serviceFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Booking Fee</span>
                  <span>${bookingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-gray-600 text-xs">
                    <span>Total Service Cost</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">
                {paymentData.paymentType === 'full' ? 'Full Payment' : 'Deposit Payment'}
              </h4>
              <div className="space-y-2 text-sm">
                {paymentData.paymentType === 'deposit' ? (
                  <>
                    <div className="flex justify-between">
                      <span>Booking Fee</span>
                      <span>${bookingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Deposit (20%)</span>
                      <span>${(serviceFee * 0.20).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold text-blue-600">
                      <span>Pay Now</span>
                      <span>${depositAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-xs pt-2 border-t">
                      <span>Pay at Appointment (Cash)</span>
                      <span>${remainingAmount.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Pay Now</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Complete Payment Button */}
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full btn-primary mt-6 py-3 text-lg disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Complete Payment - $${getTotalAmount().toFixed(2)}`
              )}
            </button>

            {paymentData.paymentType === 'deposit' && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Remaining balance to be paid in cash at your appointment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Link
          href={`/book/${slug}/details?service=${serviceId}&date=${date}&time=${time}&location=${serviceLocation}`}
          className="btn-secondary"
        >
          Back to Details
        </Link>
      </div>
    </div>
  )
}