'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, CheckCircle, Rocket, Phone, MapPin, Map, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuthContext } from '@/contexts/AuthContext'

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+971',
    phoneNumber: '',
    businessName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '00000',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
  })
  const router = useRouter()
  
  const { signup, error, isAuthenticated, loading } = useAuthContext()

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (localError) setLocalError('')

    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
      })
    }
  }

  const getPhonePlaceholder = (countryCode: string) => {
    switch (countryCode) {
      case '+971': return '50 123 4567'   // UAE
      case '+1': return '555 123 4567'    // US/Canada
      case '+44': return '7700 900123'    // UK
      case '+33': return '6 12 34 56 78'  // France
      case '+49': return '30 12345678'    // Germany
      default: return '123456789'        // Default
    }
  }

  const formatPhoneNumber = (value: string, countryCode: string) => {
    // Remove all non-numeric characters
    let cleaned = value.replace(/\D/g, '')
    
    // Get expected length based on country code
    const getExpectedLength = (code: string) => {
      switch (code) {
        case '+971': return 9 // UAE
        case '+1': return 10   // US/Canada
        case '+44': return 10  // UK
        case '+33': return 9   // France
        case '+49': return 11  // Germany
        default: return 10     // Default fallback
      }
    }
    
    const expectedLength = getExpectedLength(countryCode)
    
    // Limit to expected length for the country
    if (cleaned.length > expectedLength) {
      cleaned = cleaned.substring(0, expectedLength)
    }
    
    return cleaned
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value, formData.countryCode || '+971')
    setFormData(prev => ({
      ...prev,
      phoneNumber: formatted
    }))
    if (localError) setLocalError('')
  }

  const validateStep = (step: number) => {
    setLocalError('')
    
    if (step === 1) {
      if (!formData.firstName.trim()) {
        setLocalError('First name is required')
        return false
      }
      if (!formData.lastName.trim()) {
        setLocalError('Last name is required')
        return false
      }
      if (!formData.email.trim()) {
        setLocalError('Email is required')
        return false
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        setLocalError('Please enter a valid email address')
        return false
      }
      if (!formData.phoneNumber.trim()) {
        setLocalError('Phone number is required')
        return false
      }
      // Validate phone format
      const fullPhoneNumber = (formData.countryCode || '+971') + formData.phoneNumber
      const e164Regex = /^\+[1-9]\d{6,14}$/
      if (!e164Regex.test(fullPhoneNumber)) {
        setLocalError('Please enter a valid phone number')
        return false
      }
    }
    
    if (step === 2) {
      if (!formData.businessName.trim()) {
        setLocalError('Business name is required')
        return false
      }
      if (!formData.address.trim()) {
        setLocalError('Business address is required')
        return false
      }
      if (!formData.city.trim()) {
        setLocalError('City is required')
        return false
      }
      if (!formData.state.trim()) {
        setLocalError('State is required')
        return false
      }
      if (!formData.zipCode.trim()) {
        setLocalError('Zip code is required')
        return false
      }
    }
    
    if (step === 3) {
      if (!formData.password) {
        setLocalError('Password is required')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('Passwords do not match')
        return false
      }
      const isPasswordStrong = Object.values(passwordStrength).every(Boolean)
      if (!isPasswordStrong) {
        setLocalError('Password does not meet requirements')
        return false
      }
    }
    
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
    setLocalError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return

    setIsLoading(true)

    const success = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: (formData.countryCode || '+971') + formData.phoneNumber,
      businessName: formData.businessName,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      password: formData.password,
    })
    
    if (success) {
      router.push('/dashboard')
    }
    
    setIsLoading(false)
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center text-xs">
      <div className={`w-2 h-2 rounded-full mr-3 transition-all duration-300 ${met ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-white/20'}`}></div>
      <span className={`transition-colors duration-300 ${met ? 'text-green-300' : 'text-white/60'}`}>{text}</span>
    </div>
  )

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            step === currentStep 
              ? 'bg-gradient-to-r from-white to-blue-400 text-blue-800 scale-110' 
              : step < currentStep 
                ? 'bg-green-400 text-white' 
                : 'bg-white/20 text-white/60'
          }`}>
            {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
          </div>
          {step < 3 && (
            <div className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
              step < currentStep ? 'bg-green-400' : 'bg-white/20'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0"></div>
        <div className="flex justify-center items-center h-32 relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-purple-400"></div>
            <div className="absolute inset-0 animate-pulse">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400/20 to-cyan-500/20 rounded-full blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayError = localError || error

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Personal Information"
      case 2: return "Business Details"
      case 3: return "Secure Your Account"
      default: return ""
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Let's start with your basic information"
      case 2: return "Tell us about your business"
      case 3: return "Create a secure password to protect your account"
      default: return ""
    }
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 lg:p-8 relative overflow-hidden group hover:bg-white/15 transition-all duration-500">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-white/5 group-hover:from-blue-500/10 transition-all duration-500"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-white to-blue-500 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
              <Rocket className="h-8 w-8 text-slate-900" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">
              Launch Your Success
            </h1>
            <p className="text-white/70 mb-6">
              Transform your business in minutes
            </p>
          </div> */}

          <StepIndicator />

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-2">{getStepTitle()}</h2>
            <p className="text-white/70 text-sm">{getStepDescription()}</p>
          </div>

          {displayError && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-2xl flex items-center">
              <AlertCircle className="h-5 w-5 text-red-300 mr-3" />
              <span className="text-red-200 text-sm">{displayError}</span>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Name fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-white/90 mb-3">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                      placeholder="Sarah"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-white/90 mb-3">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="Johnson"
                  />
                </div>
              </div>

              {/* Email */}
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
                    placeholder="sarah@beautysalon.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-semibold text-white/90 mb-3">
                  Phone Number
                </label>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={formData.countryCode || '+971'}
                      onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                      className="appearance-none bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 hover:bg-white/15 pr-10"
                    >
                      <option value="+971" className="bg-slate-800 text-white">🇦🇪 +971</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="phone"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber || ''}
                      onChange={handlePhoneNumberChange}
                      className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                      placeholder={getPhonePlaceholder(formData.countryCode || '+971')}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-white/60">For SMS notifications</p>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="group w-full flex justify-center items-center py-4 px-6 bg-gradient-to-r from-white to-blue-400 text-blue-800 rounded-2xl shadow-lg font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Next
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Step 2: Business Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Business Name */}
              <div className="group">
                <label htmlFor="businessName" className="block text-sm font-semibold text-white/90 mb-3">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="Sarah's Beauty Studio"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="group">
                <label htmlFor="address" className="block text-sm font-semibold text-white/90 mb-3">
                  Business Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="123 Main Street"
                  />
                </div>
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="city" className="block text-sm font-semibold text-white/90 mb-3">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Map className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                      placeholder="Abu Dhabi"
                    />
                  </div>
                </div>

                <div className="group">
                  <label htmlFor="state" className="block text-sm font-semibold text-white/90 mb-3">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="block w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="Abu Dhabi"
                  />
                </div>

                {/* <div className="group">
                  <label htmlFor="zipCode" className="block text-sm font-semibold text-white/90 mb-3">
                    Zip Code
                  </label>
                  <input
                    id="zipCode"
                    name="zipCode"
                    type="text"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="block w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="00000"
                  />
                </div> */}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex justify-center items-center py-4 px-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-semibold transition-all duration-300 hover:bg-white/15"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="group flex justify-center items-center py-4 px-6 bg-gradient-to-r from-white to-blue-400 text-blue-800 rounded-2xl shadow-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  Next
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Password & Submit */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
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
                    placeholder="Create a secure password"
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

              {/* Confirm Password */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white/90 mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/50 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 text-white placeholder-white/50 transition-all duration-300 hover:bg-white/15"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:scale-110 transition-transform"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-white/60 hover:text-white" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/60 hover:text-white" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-xs text-red-300 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              {formData.password && (
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
                    <PasswordRequirement met={passwordStrength.uppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordStrength.lowercase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordStrength.number} text="One number" />
                  </div>
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-purple-400 focus:ring-purple-400/50 border-white/30 rounded bg-white/10 backdrop-blur-sm mt-1"
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-white/80">
                  I agree to the{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex justify-center items-center py-4 px-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-2xl font-semibold transition-all duration-300 hover:bg-white/15"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex justify-center items-center py-4 px-6 bg-gradient-to-r from-white to-blue-400 text-blue-800 rounded-2xl shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                      Creating account...
                    </div>
                  ) : (
                    <>
                      Launch
                      <Rocket className="ml-2 h-5 w-5 group-hover:translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-white/70">
              Already transforming businesses?{' '}
              <Link 
                href="/login" 
                className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-400 hover:from-blue-100 hover:to-blue-500 transition-all duration-300"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Premium features showcase - only show on step 1 */}
          {/* {currentStep === 1 && (
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/20 rounded-2xl">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                <h3 className="text-white font-bold">What you get instantly</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: CheckCircle, text: "Professional booking page in 5 minutes", color: "text-green-400" },
                  { icon: Sparkles, text: "Smart appointment management", color: "text-cyan-400" },
                  { icon: Crown, text: "Automated reminders & no-show prevention", color: "text-purple-400" },
                  { icon: Rocket, text: "Mobile-responsive design", color: "text-pink-400" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <feature.icon className={`h-4 w-4 ${feature.color} mr-3 flex-shrink-0`} />
                    <span className="text-white/80 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Forever free badge - only show on step 1 */}
          {currentStep === 1 && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center bg-gradient-to-r from-green-400/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-full px-6 py-3">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <div>
                  <p className="text-green-300 font-bold text-sm">Forever Free</p>
                  <p className="text-green-400/80 text-xs">No credit card • No hidden fees</p>
                </div>
              </div>
            </div>
          )}

          {/* Progress summary - show on steps 2 & 3 */}
          {currentStep > 1 && (
            <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Progress:</span>
                <span className="text-white font-semibold">{currentStep}/3 steps completed</span>
              </div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}