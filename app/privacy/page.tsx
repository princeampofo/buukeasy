import Link from 'next/link'
import { Calendar, Shield, Lock, Eye, UserCheck } from 'lucide-react'

export default function PrivacyPage() {
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
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Your privacy is important to us. Here's how we protect and handle your data.
          </p>
          <p className="text-sm text-gray-500">
            Last updated: January 1, 2025
          </p>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Privacy at a Glance</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Lock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Data Security</h3>
              <p className="text-sm text-gray-600">Your data is encrypted and stored securely</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Eye className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">No Ads</h3>
              <p className="text-sm text-gray-600">We don't sell your data to advertisers</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <UserCheck className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Your Control</h3>
              <p className="text-sm text-gray-600">You control your data and can delete it anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="prose prose-lg max-w-none">
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                <p className="text-gray-600 mb-4">
                  When you create a Slotly account, we collect your name, email address, phone number, and business details (business name, services offered).
                </p>
                
                <h3 className="text-lg font-semibold mb-3">Appointment Data</h3>
                <p className="text-gray-600 mb-4">
                  We store appointment information including client names, contact details, appointment times, and services booked. This data is essential for providing our scheduling service.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <div className="mb-8">
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li>Provide and maintain our appointment booking service</li>
                  <li>Send appointment confirmations and reminders</li>
                  <li>Communicate with you about your account</li>
                  <li>Improve our platform</li>
                  <li>Ensure security and prevent fraud</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              <div className="mb-8">
                <p className="text-gray-600 mb-4">
                  <strong>We do not sell your personal information.</strong> We only share information when:
                </p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li><strong>With your clients:</strong> Appointment details are shared with clients who book with you</li>
                  <li><strong>Service providers:</strong> Trusted third parties who help operate our service (hosting, email delivery)</li>
                  <li><strong>Legal requirements:</strong> When required by applicable law or to protect users' safety</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <div className="mb-8">
                <p className="text-gray-600 mb-4">
                  We protect your information with industry-standard security measures:
                </p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li>Encryption of data in transit and storage</li>
                  <li>Secured hosting infrastructure</li>
                  <li>Access controls and authentication</li>
                  <li>Regular security monitoring</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <div className="mb-8">
                <p className="text-gray-600 mb-4">You can:</p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Update:</strong> Correct inaccurate information</li>
                  <li><strong>Delete:</strong> Request deletion of your account and data</li>
                  <li><strong>Export:</strong> Download your data</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  To exercise these rights, contact us at <a href="mailto:support@sloty.com" className="text-blue-600 hover:text-blue-800">support@slotly.com</a>
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
              <div className="mb-8">
                <p className="text-gray-600 mb-4">
                  We keep your information only as long as needed:
                </p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li>Account information: Until you delete your account</li>
                  <li>Appointment data: 2 years after the appointment date</li>
                  <li>Usage logs: 6 months for security purposes</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <div className="mb-8">
                <p className="text-gray-600 mb-4">
                  We use cookies to enhance your experience:
                </p>
                <ul className="text-gray-600 space-y-2 list-disc pl-6">
                  <li><strong>Essential cookies:</strong> Required for the platform to work</li>
                  <li><strong>Analytics cookies:</strong> Help us improve our service</li>
                  <li><strong>Preference cookies:</strong> Remember your settings</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Updates to This Policy</h2>
              <div className="mb-8">
                <p className="text-gray-600">
                  We may update this privacy policy from time to time. We'll notify you of changes by email or through our platform. The "Last updated" date shows when the policy was last revised.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
              <div className="mb-8">
                <p className="text-gray-600 mb-4">
                  If you have questions about this privacy policy, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-2"><strong>Email:</strong> <a href="mailto:support@slotly.com" className="text-blue-600 hover:text-blue-800">support@slotly.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Data, Your Control</h2>
          <p className="text-gray-600 mb-8">
            We believe in transparency and giving you full control over your information. If you have any questions or concerns, we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary">
              Get Started Securely
            </Link>
          </div>
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