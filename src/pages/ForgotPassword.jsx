import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { showToast } from '../utils/toast'
import api from '../api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!email.trim()) {
      showToast.error('Please enter your email address')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/forgot-password', { email })

      if (response.data) {
        setSubmitted(true)
        showToast.success('Password reset link sent to your email!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send reset link'
      showToast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          to="/login"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition"
        >
          <ArrowLeft size={20} />
          Back to Login
        </Link>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-blue-600" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-600">
                  No problem! We'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    We'll send a password reset link to this email address
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Help Text */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Check your spam or junk folder if you don't see the email in your inbox.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to:
                </p>
                <p className="font-semibold text-blue-600 mb-6">{email}</p>
                <p className="text-sm text-gray-600 mb-4">
                  The link will expire in 24 hours. If you don't receive it, check your spam folder.
                </p>
                <p className="text-xs text-gray-500">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
