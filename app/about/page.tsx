import Link from 'next/link'
import { Calendar, Users, Heart, Target, Zap, Award } from 'lucide-react'

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Slotly
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Empowering individual beauty and wellness professionals with simple, free scheduling solutions
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
          <div className="prose prose-lg mx-auto text-gray-600">
            <p className="mb-6">
              Slotly was born from a simple observation: individual beauty and wellness professionals needed a scheduling solution that was as mobile and flexible as they were. While big salons had expensive booking systems, independent professionals were left juggling phone calls, text messages, and handwritten appointment books.
            </p>
            <p className="mb-6">
              We realized that the best professionals often work across multiple locations, serve clients in their homes, or operate from shared spaces. They needed a scheduling system that could move with them, not tie them down to a single location or expensive monthly subscription.
            </p>
            <p>
              That's why we built Slotly to be completely free, incredibly simple, and designed specifically for individual professionals who value freedom and flexibility in how they run their business.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Mission & Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To empower individual beauty and wellness professionals with the tools they need to focus on what they do best - serving their clients.
              </p>
            </div>
            
            <div className="text-center">
              <Heart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Always Free</h3>
              <p className="text-gray-600">
                We believe every professional deserves access to quality scheduling tools, regardless of their budget. That's why Slotly is and always will be free.
              </p>
            </div>
            
            <div className="text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Simplicity First</h3>
              <p className="text-gray-600">
                We prioritize ease of use over complex features. Our platform is designed to be intuitive for both professionals and their clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Growing Community</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,200+</div>
              <div className="text-gray-600">Active Professionals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">15,000+</div>
              <div className="text-gray-600">Appointments Booked</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9★</div>
              <div className="text-gray-600">User Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Free Forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built by Professionals, for Professionals</h2>
          <div className="text-center">
            <Award className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <p className="text-lg text-gray-600 mb-8">
              Our team includes former beauty and wellness professionals who understand the unique challenges of running an independent business. We're committed to building tools that actually solve real problems.
            </p>
            <p className="text-gray-600">
              Every feature in Slotly has been tested and refined based on feedback from real professionals in the field. We're not just building software - we're building solutions for a community we're proud to be part of.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Join Our Community
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Become part of a growing community of independent beauty and wellness professionals
          </p>
          <Link href="/signup" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200">
            Get Started Free
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