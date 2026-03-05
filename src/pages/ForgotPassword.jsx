import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, ArrowLeft, ShieldCheck, KeyRound, Eye, EyeOff, CheckCircle2, RefreshCw } from 'lucide-react'
import { showToast } from '../utils/toast'
import api from '../api'

// ─── Step indicator ────────────────────────────────────────────────────────────
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { id: 1, label: 'Email' },
    { id: 2, label: 'Verify OTP' },
    { id: 3, label: 'New Password' },
  ]
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
            >
              {currentStep > step.id ? <CheckCircle2 size={18} /> : step.id}
            </div>
            <span
              className={`text-xs mt-1 font-medium ${currentStep >= step.id ? 'text-blue-700' : 'text-gray-400'
                }`}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mb-4 mx-1 transition-all duration-500 ${currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'
                }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── OTP digit input ────────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputsRef = useRef([])
  const digits = value.split('')

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits]
        next[idx] = ''
        onChange(next.join(''))
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus()
      }
    }
  }

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = val
    onChange(next.join(''))
    if (val && idx < 5) {
      inputsRef.current[idx + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
  }

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all duration-200
            ${digits[idx]
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm shadow-blue-100'
              : 'border-gray-200 bg-gray-50 text-gray-800 focus:border-blue-400 focus:bg-white'
            }`}
        />
      ))}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────────
const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=email, 2=OTP, 3=new password, 4=success

  // Step 1
  const [email, setEmail] = useState('')
  const [sendingOtp, setSendingOtp] = useState(false)
  const [countdown, setCountdown] = useState(0)

  // Step 2
  const [otp, setOtp] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)

  // Step 3
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  // Countdown for resend
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault()
    if (!email.trim()) return showToast.error('Please enter your email address')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return showToast.error('Please enter a valid email address')

    setSendingOtp(true)
    try {
      await api.post('/auth/send-otp', { email })
      showToast.success('OTP sent! Check your inbox.')
      setOtp('')
      setStep(2)
      setCountdown(60)
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault()
    if (otp.length !== 6) return showToast.error('Please enter the 6-digit OTP')

    setVerifyingOtp(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      showToast.success('OTP verified!')
      setStep(3)
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // ── Step 3: Reset Password ────────────────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return showToast.error('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return showToast.error('Passwords do not match')

    setResettingPassword(true)
    try {
      await api.post('/auth/forgot-password', { email, newPassword, confirmPassword })
      showToast.success('Password updated successfully!')
      setStep(4)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setResettingPassword(false)
    }
  }

  // ── Password strength ──────────────────────────────────────────────────────────
  const getStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }
  const strength = getStrength(newPassword)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strength]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back button */}
        {step < 4 && (
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : navigate('/login'))}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200 font-medium"
          >
            <ArrowLeft size={18} />
            {step > 1 ? 'Back' : 'Back to Login'}
          </button>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

          {/* Gradient header bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />

          <div className="p-8">
            {step < 4 && <StepIndicator currentStep={step} />}

            {/* ── Step 1: Enter Email ── */}
            {step === 1 && (
              <div>
                <div className="text-center mb-7">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="text-blue-600" size={30} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
                  <p className="text-gray-500 text-sm">
                    Enter your registered email. We'll send you a one-time password.
                  </p>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm bg-gray-50 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingOtp}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-blue-200 text-sm"
                  >
                    {sendingOtp ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Sending OTP…
                      </span>
                    ) : (
                      'Send OTP'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── Step 2: Verify OTP ── */}
            {step === 2 && (
              <div>
                <div className="text-center mb-7">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="text-indigo-600" size={30} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Enter OTP</h1>
                  <p className="text-gray-500 text-sm">
                    We sent a 6-digit code to{' '}
                    <strong className="text-indigo-600">{email}</strong>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <OtpInput value={otp} onChange={setOtp} />

                  <button
                    type="submit"
                    disabled={verifyingOtp || otp.length !== 6}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-200 text-sm"
                  >
                    {verifyingOtp ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Verifying…
                      </span>
                    ) : (
                      'Verify OTP'
                    )}
                  </button>
                </form>

                {/* Resend */}
                <div className="mt-5 text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in{' '}
                      <span className="font-semibold text-indigo-600">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="flex items-center gap-1.5 mx-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      <RefreshCw size={14} />
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs text-amber-700">
                    💡 The OTP is valid for <strong>10 minutes</strong>. Check your spam folder if you don't see it.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 3: New Password ── */}
            {step === 3 && (
              <div>
                <div className="text-center mb-7">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="text-emerald-600" size={30} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Password</h1>
                  <p className="text-gray-500 text-sm">Your OTP was verified. Set a strong new password.</p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* New password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm bg-gray-50 focus:bg-white"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {newPassword && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-200'
                                }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : strength === 3 ? 'text-blue-600' : 'text-green-600'
                          }`}>
                          {strengthLabel}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className={`w-full px-4 py-2.5 pr-10 border rounded-xl focus:outline-none focus:ring-2 transition text-sm bg-gray-50 focus:bg-white ${confirmPassword && confirmPassword !== newPassword
                            ? 'border-red-300 focus:ring-red-300'
                            : 'border-gray-200 focus:ring-emerald-500 focus:border-transparent'
                          }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={resettingPassword || newPassword !== confirmPassword || newPassword.length < 6}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-emerald-200 text-sm mt-2"
                  >
                    {resettingPassword ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Updating…
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── Step 4: Success ── */}
            {step === 4 && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                  <CheckCircle2 className="text-green-500" size={42} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Updated!</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <div className="inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-full">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Redirecting to login…
                </div>
                <div className="mt-5">
                  <Link
                    to="/login"
                    className="text-sm text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                  >
                    Go to Login now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {step < 4 && (
          <p className="text-center text-gray-500 text-sm mt-5">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
