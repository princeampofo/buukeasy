'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Zap, Sparkles, ArrowRight } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  const { login, error, isAuthenticated, loading } = useAuthContext()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const success = await login(formData.email, formData.password, formData.rememberMe)
    
    if (success) {
      router.push('/dashboard')
    }
    
    setIsLoading(false)
  }

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0"></div>
        <div className="flex justify-center items-center h-32 relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-cyan-400"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-blue-500/5 group-hover:from-white/10 transition-all duration-500"></div>
        
        {/* Content */}
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-white to-blue-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8 text-slate-900" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-white/70">
              Continue your booking journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl flex items-center">
              <AlertCircle className="h-5 w-5 text-red-300 mr-3" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="email" className="block text-sm font-semibold text-white/90 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-white/90 mb-3">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/60 hover:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/60 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-400 focus:ring-blue-400/50 border-white/30 rounded bg-white/10 backdrop-blur-sm"
                />
                <label htmlFor="rememberMe" className="ml-3 block text-sm text-white/80">
                  Remember me
                </label>
              </div>

              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-white to-blue-500 hover:from-blue-50 hover:to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25 text-slate-900 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-900/30 border-t-slate-900 mr-3"></div>
                  Signing you in...
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              New to BuukMe?{' '}
              <Link 
                href="/signup" 
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400 hover:from-blue-100 hover:to-blue-500 transition-all duration-300"
              >
                Create your free account
              </Link>
            </p>
          </div>

          {/* Demo credentials with glassmorphism */}
          <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <div className="flex items-center mb-3">
              <Sparkles className="h-4 w-4 text-blue-400 mr-2" />
              <p className="text-xs text-white/80 font-semibold">Demo Access</p>
            </div>
            <div className="text-xs text-white/70 space-y-1">
              <p><span className="text-white/90 font-medium">Email:</span> demo@BuukMe.app</p>
              <p><span className="text-white/90 font-medium">Password:</span> demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}