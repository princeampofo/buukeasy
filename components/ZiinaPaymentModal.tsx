import { useState, useEffect } from 'react'
import { X, CreditCard, Smartphone, QrCode, ExternalLink, Loader2 } from 'lucide-react'
import { useZiinaPayment } from '@/hooks/useZiinaPayment'
import { ZiinaPaymentRequest } from '@/lib/ziina'

interface ZiinaPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentRequest: ZiinaPaymentRequest
  onSuccess: (paymentData: any) => void
  onError: (error: string) => void
}

export function ZiinaPaymentModal({ 
  isOpen, 
  onClose, 
  paymentRequest, 
  onSuccess, 
  onError 
}: ZiinaPaymentModalProps) {
  const { createPayment, checkPaymentStatus, loading, error } = useZiinaPayment()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'qr'>('card')
  const [statusChecking, setStatusChecking] = useState(false)

  useEffect(() => {
    if (error) {
      onError(error)
    }
  }, [error, onError])

  const handleCreatePayment = async () => {
    try {
      const response = await createPayment(paymentRequest)
      setPaymentData(response)
      
      // Start status checking
      startStatusPolling(response.id)
    } catch (err) {
      console.error('Payment creation failed:', err)
    }
  }

  const startStatusPolling = (paymentId: string) => {
    setStatusChecking(true)
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(paymentId)
        
        if (status.status === 'completed') {
          clearInterval(interval)
          setStatusChecking(false)
          onSuccess(status)
        } else if (status.status === 'failed' || status.status === 'cancelled') {
          clearInterval(interval)
          setStatusChecking(false)
          onError(`Payment ${status.status}`)
        }
      } catch (err) {
        console.error('Status check failed:', err)
      }
    }, 3000) // Check every 3 seconds

    // Stop checking after 10 minutes
    setTimeout(() => {
      clearInterval(interval)
      setStatusChecking(false)
    }, 600000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {!paymentData ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Amount to pay: <span className="font-semibold">{paymentRequest.amount} {paymentRequest.currency}</span>
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'card')}
                  className="mr-3"
                />
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                <span>Credit/Debit Card</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mobile"
                  checked={paymentMethod === 'mobile'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'mobile')}
                  className="mr-3"
                />
                <Smartphone className="h-5 w-5 mr-2 text-green-600" />
                <span>Mobile Wallet</span>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="qr"
                  checked={paymentMethod === 'qr'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'qr')}
                  className="mr-3"
                />
                <QrCode className="h-5 w-5 mr-2 text-purple-600" />
                <span>QR Code</span>
              </label>
            </div>

            <button
              onClick={handleCreatePayment}
              disabled={loading}
              className="w-full btn-primary py-3 mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Payment...
                </div>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethod === 'qr' && paymentData.qrCode && (
              <div className="text-center">
                <img 
                  src={paymentData.qrCode} 
                  alt="Payment QR Code" 
                  className="mx-auto mb-4 w-48 h-48"
                />
                <p className="text-sm text-gray-600">Scan with your mobile banking app</p>
              </div>
            )}

            {paymentData.paymentUrl && (
              <div className="text-center">
                <a
                  href={paymentData.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center btn-primary"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Ziina Payment
                </a>
                <p className="text-xs text-gray-500 mt-2">
                  You will be redirected to Ziina to complete your payment
                </p>
              </div>
            )}

            {statusChecking && (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Waiting for payment confirmation...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}