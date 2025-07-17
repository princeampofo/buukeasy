import { useState, useCallback } from 'react'
import { ZiinaPaymentService, ZiinaPaymentRequest, ZiinaPaymentResponse } from '../lib/ziina'
import { ziinaConfig } from '../utils/ziinaConfig'

export function useZiinaPayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentData, setPaymentData] = useState<ZiinaPaymentResponse | null>(null)

  const ziinaService = new ZiinaPaymentService(ziinaConfig)

  const createPayment = useCallback(async (request: ZiinaPaymentRequest) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ziinaService.createPayment(request)
      setPaymentData(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment creation failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [ziinaService])

  const checkPaymentStatus = useCallback(async (paymentId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await ziinaService.getPaymentStatus(paymentId)
      setPaymentData(response)
      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Status check failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [ziinaService])

  const cancelPayment = useCallback(async (paymentId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const success = await ziinaService.cancelPayment(paymentId)
      if (!success) {
        throw new Error('Payment cancellation failed')
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Cancellation failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [ziinaService])

  return {
    createPayment,
    checkPaymentStatus,
    cancelPayment,
    loading,
    error,
    paymentData,
    clearError: () => setError(null)
  }
}