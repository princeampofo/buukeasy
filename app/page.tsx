import Link from 'next/link'
import { Calendar, Clock, Users, Star, ArrowRight, Scissors, Sparkles, Heart } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Slotly</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How It Works</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="nav-link">Sign In</Link>
              <Link href="/signup" className="btn-primary">Join Free</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Let Clients Book You
              <span className="block text-blue-600">Anytime. Anywhere.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
             A free scheduling platform built for individual beauty and wellness professionals. 
              Manage appointments seamlessly and streamline your booking process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2 whitespace-nowrap">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="#demo" className="btn-outline text-lg px-8 py-3">
                See How It Works
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">100% Free • No Credit Card Required</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for Individual Professionals on the go
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need as a professional to manage appointments and serve your existing clients
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center">
              <Scissors className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">For All Beauty Services</h3>
              <p className="text-gray-600">
                Perfect for individual professionals: barbers, hair stylists, nail technicians, massage therapists, and more
              </p>
            </div>
            
            <div className="card text-center">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Portable Scheduling</h3>
              <p className="text-gray-600">
                Take your booking system anywhere - perfect for individuals on the go
              </p>
            </div>
            
            <div className="card text-center">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Client Management</h3>
              <p className="text-gray-600">
                Keep track of client information, appointment history, and preferences in one organized place
              </p>
            </div>

            <div className="card text-center">
              <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart Reminders</h3>
              <p className="text-gray-600">
                Automatic notifications to reduce no-shows and keep your schedule full
              </p>
            </div>
            
            <div className="card text-center">
              <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Professional Booking</h3>
              <p className="text-gray-600">
                Give your clients a professional booking experience with your personalized scheduling page
              </p>
            </div>
            
            <div className="card text-center">
              <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Client Relationships</h3>
              <p className="text-gray-600">
                Keep track of client preferences, history, and build lasting relationships
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Slotly Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to set up your scheduling system and manage appointments
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Set up your professional profile with services, pricing, and availability
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
              <p className="text-gray-600">
                Share your personalized booking link with existing clients via social media, website, or business cards
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage & Focus</h3>
              <p className="text-gray-600">
                Accept bookings, manage your schedule, and focus on what you do best
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Loved by Beauty & Wellness Professionals
            </h2>
            <div className="flex items-center justify-center mb-8">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="ml-2 text-gray-600">4.9/5 from 1,200+ professionals</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                "Slotly helped me organize my hair styling business. My clients love how easy it is to book!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-pink-600 font-semibold">WE</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Wisdom Esil</p>
                  <p className="text-sm text-gray-500">Hair Stylist</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                "Free and powerful! My existing clients love the convenience of online booking. The scheduling is so much smoother now!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">JD</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">John Davis</p>
                  <p className="text-sm text-gray-500">Massage Therapist</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">
                "Perfect for my nail salon. Clients can book online and I can manage everything from my phone."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">AL</span>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Amy Lopez</p>
                  <p className="text-sm text-gray-500">Nail Technician</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Streamline Your Scheduling?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of beauty and wellness professionals already using Slotly to manage their appointments
          </p>
          <Link href="/signup" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200">
            Start Free Today
          </Link>
          <p className="text-blue-100 text-sm mt-4">Always free • No subscriptions</p>
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