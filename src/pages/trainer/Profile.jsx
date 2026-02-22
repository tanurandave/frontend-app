import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api, { userAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'
import { ArrowLeft, User, Mail, Phone, MapPin, AlertCircle, Loader, CheckCircle } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TrainerProfile = () => {
  const { user, isTrainer } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    specialization: '',
    bio: '',
    qualification: ''
  })
  const [originalData, setOriginalData] = useState({})

  const showToast = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast.info(msg)
  }

  useEffect(() => {
    if (!isTrainer) {
      showToast.error('Unauthorized access')
      navigate('/login')
      return
    }
    fetchTrainerProfile()
  }, [isTrainer, user])

  const fetchTrainerProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.id) return;

      const response = await userAPI.getById(user.id)
      const data = {
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        experience: response.data.experience || '',
        specialization: response.data.specialization || '',
        bio: response.data.bio || '',
        qualification: response.data.qualification || ''
      }
      setFormData(data)
      setOriginalData(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError(err.response?.data?.message || 'Failed to load profile')
      showToast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      showToast.error('Name is required')
      return
    }

    if (!formData.email.trim()) {
      showToast.error('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showToast.error('Invalid email format')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (!user?.id) {
        showToast.error('User session expired. Please login again.')
        return
      }

      // Update user profile
      await userAPI.update(user.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        experience: formData.experience,
        specialization: formData.specialization,
        bio: formData.bio,
        qualification: formData.qualification
      })

      setSuccess(true)
      setOriginalData(formData)
      showToast.success('Profile updated successfully!')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error updating profile:', err)
      const errorMsg = err.response?.data?.message || 'Failed to update profile'
      setError(errorMsg)
      showToast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin" size={48} color="#3b82f6" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="TRAINER" />

      <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} overflow-hidden transition-all duration-300`}>
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/trainer')}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-500 mt-1">Manage your profile information</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl">
            {/* Success Alert */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="text-green-600" size={20} />
                <span className="text-green-800">Profile updated successfully!</span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User size={24} className="text-blue-600" />
                    Basic Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail size={16} className="inline mr-2" />
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 5"
                        min="0"
                        max="70"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Information</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization
                      </label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Web Development, Python"
                      />
                    </div>

                    {/* Qualification */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., M.Tech, B.Sc"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write a short bio about yourself..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={!hasChanges || saving}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader className="animate-spin" size={18} />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(originalData)}
                    disabled={!hasChanges}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default TrainerProfile
