import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, CheckCircle, ArrowLeft } from 'lucide-react'
import { showToast } from '../utils/toast'
import api from '../api'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password strength calculation
  const getPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']

  useEffect(() => {
    if (!token) {
      showToast.error('Invalid reset link')
      setTimeout(() => navigate('/login'), 2000)
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.password || !formData.confirmPassword) {
      showToast.error('Please fill in all fields')
      return
    }

    if (formData.password.length < 8) {
      showToast.error('Password must be at least 8 characters long')
      return
    }

    if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password)) {
      showToast.error('Password must contain both uppercase and lowercase letters')
      return
    }

    if (!/\d/.test(formData.password)) {
      showToast.error('Password must contain at least one number')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showToast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await api.put('/auth/reset-password', {
        token,
        password: formData.password,
      })

      if (response.data) {
        setSubmitted(true)
        showToast.success('Password reset successful!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reset password'
      showToast.error(errorMsg)
      
      // If token invalid/expired, redirect
      if (error.response?.status === 401) {
        setTimeout(() => navigate('/forgot-password'), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return null
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
                  <Lock className="text-blue-600" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
                <p className="text-gray-600">
                  Enter your new password below
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        Strength: <span className="font-semibold">{strengthLabels[Math.max(0, passwordStrength - 1)]}</span>
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-2">
                    Must contain 8+ characters, uppercase, lowercase, and numbers
                  </p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <p className={`text-xs mt-2 ${
                      formData.password === formData.confirmPassword
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    }`}>
                      {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              {/* Password Requirements */}
              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ At least 8 characters</li>
                  <li>✓ Mix of uppercase and lowercase letters</li>
                  <li>✓ At least one number</li>
                  <li>✓ Special characters recommended (!@#$%^&*)</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully reset. You can now login with your new password.
                </p>
                <p className="text-xs text-gray-500">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
