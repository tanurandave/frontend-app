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
  <div className="min-h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
    <ToastContainer />

    {/* Left Branding Section */}
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col justify-center items-center w-full text-white p-12">
        <h1 className="text-5xl font-bold mb-6 tracking-wide">
          Trainer<span className="text-yellow-300">Hub</span>
        </h1>
        <p className="text-lg text-white/80 mb-10 text-center max-w-md">
          Smart Training Institute Management System for Admin, Trainers & Students.
        </p>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-2xl font-bold">500+</p>
            <p className="text-sm text-white/70">Students</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-2xl font-bold">50+</p>
            <p className="text-sm text-white/70">Courses</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg">
            <p className="text-2xl font-bold">20+</p>
            <p className="text-sm text-white/70">Trainers</p>
          </div>
        </div>
      </div>
    </div>

    {/* Right Login Section */}
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl p-8 border border-gray-100">

        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back 👋</h2>
          <p className="text-gray-500 mt-2">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ROLE TABS */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {['ADMIN', 'TRAINER', 'STUDENT'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                role === r
                  ? 'bg-white shadow-md text-indigo-600'
                  : 'text-gray-500 hover:text-indigo-500'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Admin Key */}
          {role === 'ADMIN' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Access Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                placeholder="Enter admin key"
                required
              />
            </div>
          )}

          {/* Remember + Forgot */}
            {role !== 'ADMIN' && (
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="mr-2 rounded" />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
            )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
             {role !== 'ADMIN' && (
        <p className="text-center mt-6 text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-600 font-semibold hover:underline"
          >
            Register
          </Link>
        </p>
              )}
      </div>
    </div>
  </div>
)

}

export default Login
