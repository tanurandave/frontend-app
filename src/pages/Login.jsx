import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { showToast } from '../utils/toast'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [adminKey, setAdminKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || 'ADMIN_SECRET'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // If user selected ADMIN require an admin access key (extra gate)
    if (role === 'ADMIN') {
      if (!adminKey || adminKey !== ADMIN_KEY) {
        const msg = 'Invalid admin access key'
        setError(msg)
        showToast.error(msg)
        setLoading(false)
        return
      }
    }

    try {
      const user = await login(email, password)
      showToast.success(`Welcome back, ${user.name}!`)
      // Ensure selected role matches the account role returned by backend
      if (role !== user.role) {
        const msg = `Selected role (${role}) does not match account role (${user.role}).` 
        setError(msg)
        showToast.error(msg)
        setLoading(false)
        return
      }

      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else if (user.role === 'TRAINER') {
        navigate('/trainer')
      } else if (user.role === 'STUDENT') {
        navigate('/student')
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid credentials'
      setError(errorMsg)
      showToast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <ToastContainer />
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Training Hub</h1>
            <p className="text-xl text-white/80 mb-8">Your complete training management solution</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-white/70">Students</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm text-white/70">Courses</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <p className="text-2xl font-bold">20+</p>
                <p className="text-sm text-white/70">Trainers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gradient">Training Hub</h1>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Login As</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="TRAINER">Trainer</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="Enter your password"
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Admin access key - only visible when ADMIN selected */}
              {role === 'ADMIN' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Access Key</label>
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="input-field"
                    placeholder="Enter admin access key"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center mt-6 text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
