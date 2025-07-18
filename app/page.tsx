import Link from 'next/link'
import { Zap, Timer, Palette, Gem, Rocket, Shield, Wand2, Target, CheckCircle, Play, ArrowUpRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3">
        <div className="flex items-center justify-between min-w-[320px]">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-white to-blue-400 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-blue-800" />
            </div>
            <span className="ml-3 text-xl font-bold text-white">BuukMe</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-white/80 hover:text-white transition-colors text-sm">
              Sign In
            </Link>
            <Link href="/signup" className="bg-gradient-to-r from-white to-blue-400 text-blue-800 px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-transform">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Diagonal Layout */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-sky-500/20 to-cyan-500/20 animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
                <Gem className="h-4 w-4 text-blue-400 mr-2" />
                <span className="text-white/90 text-sm">100% Free</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight">
                Your Clients
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-400">
                  Book You Instantly
                </span>
              </h1>
              
              <p className="text-xl text-white/70 max-w-lg leading-relaxed">
                The most intuitive scheduling platform for beauty & wellness professionals who want to look professional and stay organized.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="group bg-gradient-to-r from-white to-blue-400 text-blue-800 px-8 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 flex items-center justify-center">
                  Launch Your Booking Page
                  <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                  <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-white/60">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span>No Setup Fees</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                  <span>No Subscriptions</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-lg border border-white/20 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full ml-2"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full ml-2"></div>
                    </div>
                    <span className="text-white/60 text-sm">buukme.app/book/sarah</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                    <h3 className="text-white font-bold text-lg mb-4">Book with Sarah</h3>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {['Mon 15', 'Tue 16', 'Wed 17'].map((day) => (
                        <div key={day} className="bg-white/20 rounded-lg p-3 text-center text-white text-sm">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {['Hair Cut - $45', 'Color - $85', 'Styling - $35'].map((service) => (
                        <div key={service} className="bg-gradient-to-r from-white/20 to-blue-400/20 rounded-lg p-3 text-white text-sm">
                          {service}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid with Cards */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
              Built for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400"> Modern </span>
              Professionals
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to manage your beauty business like a pro, without the complexity
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                title: "All Beauty Services",
                description: "Hair, nails, massage, skincare, lashes - we've got every beauty professional covered",
                gradient: "from-white to-blue-300"
              },
              {
                icon: Timer,
                title: "Lightning Setup",
                description: "Get your booking page live in under 5 minutes. No technical skills needed",
                gradient: "from-blue-100 to-blue-400"
              },
              {
                icon: Target,
                title: "Smart Scheduling",
                description: "Intelligent calendar system that prevents double bookings and keeps you organized",
                gradient: "from-white to-sky-400"
              },
              {
                icon: Wand2,
                title: "Magic Reminders",
                description: "Automated SMS and email reminders that reduce no-shows by 85%",
                gradient: "from-sky-100 to-blue-500"
              },
              {
                icon: Shield,
                title: "Client Management",
                description: "Keep detailed notes, track appointment history, and remember client preferences",
                gradient: "from-white to-cyan-400"
              },
              {
                icon: Rocket,
                title: "Mobile Responsive",
                description: "Fully responsive website that works perfectly on any device - desktop, tablet, or phone",
                gradient: "from-blue-200 to-blue-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-blue-800" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-cyan-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">
              Loved by Beauty Professionals
            </h2>
            <p className="text-white/70 text-lg">
              See what professionals are saying about their bookmyslot experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                text: "Game changer! My clients love the sleek booking experience and I save 3 hours a week on scheduling.",
                name: "Maya Chen",
                role: "Hair Artist",
                avatar: "MC",
                color: "from-white to-blue-300"
              },
              {
                text: "The mobile-responsive design is perfect! I can manage bookings from my laptop at home or my phone between clients.",
                name: "Alex Rivera",
                role: "Mobile Barber",
                avatar: "AR",
                color: "from-blue-100 to-blue-400"
              },
              {
                text: "My no-show rate dropped significantly with the smart reminders. Plus it's completely free - amazing value!",
                name: "Sophie Kim",
                role: "Nail Artist",
                avatar: "SK",
                color: "from-sky-200 to-blue-500"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <p className="text-white/90 text-lg leading-relaxed mb-6">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.color} rounded-full flex items-center justify-center`}>
                    <span className="text-blue-800 font-bold">{testimonial.avatar}</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-sky-500/20 to-cyan-500/20"></div>
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">
            Ready to Transform Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400">
              Booking Experience?
            </span>
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join beauty professionals who've already transformed their scheduling experience
          </p>
          <Link href="/signup" className="group bg-gradient-to-r from-white to-blue-400 text-blue-800 px-12 py-5 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 inline-flex items-center">
            Create Your Free Booking Page
            <Rocket className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Link>
          <p className="text-white/60 text-sm mt-6">Setup takes less than 5 minutes • Always free • No credit card needed</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-lg border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-r from-white to-blue-400 p-3 rounded-2xl">
                  <Zap className="h-6 w-6 text-blue-800" />
                </div>
                <span className="ml-3 text-2xl font-bold text-white">BuukMe</span>
              </div>
              <p className="text-white/70 max-w-md mb-6">
                The future of appointment booking for beauty and wellness professionals. Simple, powerful, and always free.
              </p>

            </div>
            
            <div className="flex space-x-8">
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                About
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Support
              </Link>
              <Link href="#" className="text-white/70 hover:text-white transition-colors">
                Privacy
              </Link>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/60">&copy; 2025 BuukMe. Built with ❤️ for beauty professionals everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}