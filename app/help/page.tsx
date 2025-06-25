import Link from 'next/link'
import { Calendar, HelpCircle, Clock, Users, CheckCircle } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Slotly</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="nav-link">Sign In</Link>
              <Link href="/signup" className="btn-primary">Join Free</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Help & FAQs
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions about using Slotly
          </p>
        </div>
      </section>

      {/* Quick Help */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Getting Started
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            <div className="card text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Professionals</h3>
              <p className="text-gray-600 mb-4">
                Set up your profile, add services, and start accepting bookings
              </p>
              {/* <button className="text-blue-600 hover:text-blue-800 font-medium">
                Setup Guide →
              </button> */}
            </div>
            
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">For Clients</h3>
              <p className="text-gray-600 mb-4">
                Learn how to book appointments with your favorite professionals
              </p>
              {/* <button className="text-green-600 hover:text-green-800 font-medium">
                Booking Guide →
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-8">
            {/* General Questions */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">General Questions</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    How much does Slotly cost?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Slotly is free to join with no subscriptions. To reduce no-shows, clients pay a small booking deposit when they book online. We take a small service fee from each deposit to maintain the platform.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Who can use Slotly?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Slotly is designed for individual beauty and wellness professionals like hair stylists, barbers, nail technicians, massage therapists, estheticians, and more.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Do I need to download an app?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    No app needed! Slotly works perfectly in any web browser on your phone, tablet, or computer. It's designed to be mobile-friendly from the start.
                  </p>
                </div>
              </div>
            </div>

            {/* For Professionals */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">For Professionals</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    How do I get started?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Simply sign up, add your services and availability, then share your booking link with clients. Setup takes less than 5 minutes!
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    Can I work from multiple locations?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Absolutely! Slotly is perfect for mobile professionals. You can update your location and availability from anywhere.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    How do clients book with me?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Share your personalized booking link through social media, business cards, or anywhere you promote your services. Clients can book 24/7 without calling.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    What about no-shows?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Slotly automatically sends email reminders to clients before their appointments, which significantly reduces no-shows. You can also set your own cancellation policy.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                    How does the booking deposit work?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    You set your own booking deposit amount when you sign up. Clients pay this deposit to secure their appointment, which dramatically reduces no-shows. We take a small service fee from each deposit, and you receive the rest. Clients pay their remaining balance directly to you.
                  </p>
                </div>
              </div>
            </div>

            {/* For Clients */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">For Clients</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Do I need to pay to book?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Yes, you'll pay a small booking deposit to secure your appointment. This helps reduce no-shows and ensures your professional reserves your time slot. You'll pay the remaining balance directly to your professional.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    How do I book an appointment?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Click your professional's booking link, choose your service and preferred time, enter your contact information, and pay the booking deposit. You'll get instant confirmation!
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Do I need to create an account?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    No account needed! Just provide your contact info and pay the booking deposit. You'll receive confirmation and reminder emails automatically.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Can I reschedule or cancel?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Yes! Your confirmation email includes links to reschedule or cancel. Cancellation and refund policies are set by each professional and will be shown during booking.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Questions</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    What if I have special requests?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    When booking, there's a notes section where you can mention allergies, preferences, or any special requests for your professional.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    What devices does Slotly work on?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Slotly works on any device with a web browser - iPhones, Android phones, tablets, laptops, and desktop computers.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    What if I need help?
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Contact our support team anytime! We're here to help you succeed with your scheduling needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 mb-8">
            Our support team is here to help you get the most out of Slotly
          </p>
          <Link href="/contact" className="btn-primary">
            Contact Support
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-2xl font-bold">Slotly</span>
              </div>
              <p className="text-gray-400 max-w-md">
                A free scheduling platform built for individual beauty and wellness professionals.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="flex gap-8">
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">
                  About
                </Link>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Help & FAQs
                </Link>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Slotly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}