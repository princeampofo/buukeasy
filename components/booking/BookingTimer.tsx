// components/BookingTimer.tsx
'use client'

import { Clock, AlertTriangle } from 'lucide-react'

interface BookingTimerProps {
  timeRemaining: number
  isActive: boolean
  isExpired: boolean
  isCritical: boolean
  formatTimeRemaining: (ms: number) => string
  onExpired?: () => void
  showExpiredMessage?: boolean
}

export default function BookingTimer({
  timeRemaining,
  isActive,
  isExpired,
  isCritical,
  formatTimeRemaining,
  onExpired,
  showExpiredMessage = true
}: BookingTimerProps) {
  // Don't show anything if timer isn't active and not expired
  if (!isActive && !isExpired) {
    return null
  }

  // Timer expired message
  if (isExpired && showExpiredMessage) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Booking Time Expired</h3>
            <p className="text-red-800 text-sm">
              Your 15-minute booking window has expired. Your selected time slot has been released.
            </p>
            {onExpired && (
              <button
                onClick={onExpired}
                className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
              >
                Start New Booking
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Active timer display
  if (isActive && !isExpired) {
    return (
      <div className={`border rounded-xl p-4 ${
        isCritical 
          ? 'bg-red-50 border-red-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          <Clock className={`h-6 w-6 ${
            isCritical ? 'text-red-600' : 'text-yellow-600'
          }`} />
          <div className="flex-1">
            <h3 className={`font-semibold ${
              isCritical ? 'text-red-900' : 'text-yellow-900'
            }`}>
              Time Remaining to Complete Booking
            </h3>
            <p className={`text-sm ${
              isCritical ? 'text-red-800' : 'text-yellow-800'
            }`}>
              Complete your booking within <strong>{formatTimeRemaining(timeRemaining)}</strong> or your selected time will be released
            </p>
            {isCritical && (
              <p className="text-red-700 text-xs mt-1 font-medium">
                ⚠️ Less than 5 minutes remaining!
              </p>
            )}
          </div>
          <div className={`text-2xl font-bold tabular-nums ${
            isCritical ? 'text-red-600' : 'text-yellow-600'
          }`}>
            {formatTimeRemaining(timeRemaining)}
          </div>
        </div>
      </div>
    )
  }

  return null
}