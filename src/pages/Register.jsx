import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../utils/toast'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match'
      setError(errorMsg)
      showToast.error(errorMsg)
      return
    }

    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters'
      setError(errorMsg)
      showToast.error(errorMsg)
      return
    }

    setLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      })
      showToast.success('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed'
      setError(errorMsg)
      showToast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (formData.password.length === 0) return 0
    let strength = 0
    if (formData.password.length >= 6) strength += 25
    if (formData.password.match(/[a-z]/)) strength += 25
    if (formData.password.match(/[A-Z]/)) strength += 25
    if (formData.password.match(/[0-9]/)) strength += 25
    return strength
  }

  const getStrengthColor = () => {
    const strength = passwordStrength()
    if (strength <= 25) return 'bg-red-500'
    if (strength <= 50) return 'bg-orange-500'
    if (strength <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen flex">
      <ToastContainer />
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-secondary-600 via-secondary-700 to-primary-700 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Join Training Hub</h1>
            <p className="text-xl text-white/80 mb-8">Start your learning journey today</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <Check className="text-green-400" size={24} />
                <span>Expert Trainers</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <Check className="text-green-400" size={24} />
                <span>Comprehensive Courses</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <Check className="text-green-400" size={24} />
                <span>Flexible Scheduling</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gradient">Training Hub</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
              <p className="text-gray-500 mt-2">Join our training community</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TRAINER">Trainer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pr-12"
                    placeholder="Create a password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStrengthColor()} transition-all duration-300`}
                        style={{ width: `${passwordStrength()}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {passwordStrength() <= 25 && 'Weak'}
                      {passwordStrength() > 25 && passwordStrength() <= 50 && 'Fair'}
                      {passwordStrength() > 50 && passwordStrength() <= 75 && 'Good'}
                      {passwordStrength() > 75 && 'Strong'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Confirm your password"
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
