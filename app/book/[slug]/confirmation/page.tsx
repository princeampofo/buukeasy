'use client'

import { useSearchParams } from 'next/navigation'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Download, 
  Share2,
  CreditCard,
  Receipt,
  Copy,
  Check
} from 'lucide-react'

export default function ConfirmationPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const bookingStatus = searchParams.get('booking')
  const paymentType = searchParams.get('paymentType')
  const serviceLocation = searchParams.get('location') || 'in-store'
  const [copied, setCopied] = useState(false)

  // Mock booking data - in real app, fetch from API based on booking ID
  const bookingData = {
    id: 'BK-BOMX41871',
    businessName: "Elite Wellness Spa",
    businessAddress: "123 Main St, City, State 12345",
    businessPhone: "(555) 123-4567",
    businessEmail: "info@elitewellnessspa.com",
    service: {
      name: "Deep Tissue Massage",
      duration: 60,
      price: serviceLocation === 'home' ? 150.00 : 120.00,
      location: serviceLocation,
    },
    appointment: {
      date: "2025-06-25",
      time: "2:00 PM",
      timezone: "EST",
      location: serviceLocation,
      serviceAddress: serviceLocation === 'home' ? "456 Home St, City, State 12345" : null
    },
    client: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "(555) 987-6543"
    },
    payment: {
      type: paymentType || 'full',
      amountPaid: paymentType === 'deposit' ? 29.00 : 137.00,
      remainingBalance: paymentType === 'deposit' ? 108.00 : 0,
      method: 'Credit Card',
      last4: '4242',
      fees: {
        service: 120.00,
        booking: 5.00,
        taxes: 12.00,
        total: 137.00
      }
    },
    status: 'confirmed',
    confirmationNumber: 'CONF-NZZFZHYW',
    createdAt: new Date().toISOString()
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    const receiptData = `
BOOKING CONFIRMATION
${bookingData.businessName}
${bookingData.businessAddress}

Booking ID: ${bookingData.id}
Confirmation: ${bookingData.confirmationNumber}

CLIENT INFORMATION
${bookingData.client.firstName} ${bookingData.client.lastName}
${bookingData.client.email}
${bookingData.client.phone}

APPOINTMENT DETAILS
Service: ${bookingData.service.name}
Duration: ${bookingData.service.duration} minutes
Date: ${formatDate(bookingData.appointment.date)}
Time: ${bookingData.appointment.time} ${bookingData.appointment.timezone}

PAYMENT SUMMARY
Service: $${bookingData.payment.fees.service.toFixed(2)}
Booking Fee: $${bookingData.payment.fees.booking.toFixed(2)}
Taxes: $${bookingData.payment.fees.taxes.toFixed(2)}
Total: $${bookingData.payment.fees.total.toFixed(2)}

Amount Paid: $${bookingData.payment.amountPaid.toFixed(2)}
${bookingData.payment.remainingBalance > 0 ? `Remaining Balance: $${bookingData.payment.remainingBalance.toFixed(2)}` : ''}

Payment Method: ${bookingData.payment.method} ending in ${bookingData.payment.last4}
    `
    
    const blob = new Blob([receiptData], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booking-receipt-${bookingData.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareBooking = async () => {
    const shareData = {
      title: 'Appointment Confirmation',
      text: `Appointment confirmed at ${bookingData.businessName} on ${formatDate(bookingData.appointment.date)} at ${bookingData.appointment.time}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(`${shareData.text} - Booking ID: ${bookingData.id}`)
      }
    } else {
      copyToClipboard(`${shareData.text} - Booking ID: ${bookingData.id}`)
    }
  }

  if (bookingStatus !== 'success') {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-900 mb-2">Booking Failed</h1>
          <p className="text-red-700 mb-6">
            There was an issue processing your booking. Please try again or contact support.
          </p>
          <Link href={`/book/${slug}`} className="btn-primary">
            Try Again
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
        <p className="text-lg text-gray-600">
          Your appointment has been successfully booked
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Details */}
        <div className="space-y-6">
          {/* Confirmation Details */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Confirmation Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Booking ID:</span>
                <div className="flex items-center">
                  <span className="font-mono font-medium">{bookingData.id}</span>
                  <button
                    onClick={() => copyToClipboard(bookingData.id)}
                    className="ml-2 p-1 hover:bg-gray-100 rounded"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Confirmation Number:</span>
                <span className="font-medium">{bookingData.confirmationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  Confirmed
                </span>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                <div>
                  <div className="font-medium">{formatDate(bookingData.appointment.date)}</div>
                  <div className="text-sm text-gray-600">{bookingData.appointment.time} {bookingData.appointment.timezone}</div>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                <div>
                  <div className="font-medium">{bookingData.service.name}</div>
                  <div className="text-sm text-gray-600">{bookingData.service.duration} minutes</div>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-blue-600 mt-1 mr-3" />
                <div>
                  {bookingData.appointment.location === 'home' ? (
                    <>
                      <div className="font-medium">Home Service</div>
                      <div className="text-sm text-gray-600">{bookingData.appointment.serviceAddress}</div>
                      <div className="text-xs text-gray-500 mt-1">The therapist will arrive 10 minutes before your appointment</div>
                    </>
                  ) : (
                    <>
                      <div className="font-medium">{bookingData.businessName}</div>
                      <div className="text-sm text-gray-600">{bookingData.businessAddress}</div>
                      <div className="text-sm text-gray-600">{bookingData.businessPhone}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Your Information</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <span>{bookingData.client.firstName} {bookingData.client.lastName}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span>{bookingData.client.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <span>{bookingData.client.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span>{bookingData.service.name}</span>
                <span>${(bookingData.service.location === 'home' ? 150.00 : bookingData.service.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Booking Fee</span>
                <span>${bookingData.payment.fees.booking.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes</span>
                <span>${bookingData.payment.fees.taxes.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${bookingData.payment.fees.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium">Payment Information</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount Paid</span>
                  <span className="font-medium text-green-600">${bookingData.payment.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method</span>
                  <span>{bookingData.payment.method} ending in {bookingData.payment.last4}</span>
                </div>
                
                {bookingData.payment.remainingBalance > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-800 font-medium">Remaining Balance</span>
                      <span className="text-yellow-800 font-bold">${bookingData.payment.remainingBalance.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      To be paid in cash at your appointment
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-medium">Confirmation Email Sent</div>
                  <div className="text-gray-600">Check your email for booking details and calendar invite</div>
                </div>
              </div>
              
              {bookingData.appointment.location === 'home' ? (
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Prepare Your Space</div>
                      <div className="text-gray-600">Ensure you have a quiet, clean area ready for your service</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Prepare for Your Visit</div>
                      <div className="text-gray-600">Arrive 10 minutes early and bring a valid ID</div>
                    </div>
                  </div>
                )}
              
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-medium">Need to Reschedule?</div>
                  <div className="text-gray-600">Contact us at least 24 hours in advance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={downloadReceipt}
              className="w-full btn-secondary flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </button>
            
            <button
              onClick={shareBooking}
              className="w-full btn-secondary flex items-center justify-center"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Booking
            </button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="text-center pt-6 border-t">
        <p className="text-gray-600 mb-4">
          Need to make changes or have questions about your appointment?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a 
            href={`tel:${bookingData.businessPhone}`}
            className="btn-secondary"
          >
            Call {bookingData.businessPhone}
          </a>
          <a 
            href={`mailto:${bookingData.businessEmail}`}
            className="btn-secondary"
          >
            Email Support
          </a>
          <Link href={`/book/${slug}`} className="btn-primary"> 
            Book Another Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}