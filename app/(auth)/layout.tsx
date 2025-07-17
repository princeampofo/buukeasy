import { Zap } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-blue-500/10 to-cyan-500/10 animate-pulse"></div>
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-white/15 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-400/15 to-white/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full px-6 py-3">
        <Link href="/" className="flex items-center">
          <div className="bg-gradient-to-r from-white to-blue-400 p-2 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="ml-3 text-xl font-bold text-white">bookmyslot</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full">
          {children}
        </div>
      </div>
    </div>
  )
}