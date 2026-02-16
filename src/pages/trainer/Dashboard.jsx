import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { enrollmentAPI, courseAPI, schedulingAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import { LogOut, Users, BookOpen, Calendar, Clock, AlertCircle } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TrainerDashboard = () => {
  const { user, logout, isTrainer, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    assignedSlots: 0,
    students: 0,
    courses: 0,
    modules: 0
  })
  const [teaching, setTeaching] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const showToast = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast.info(msg)
  }

  useEffect(() => {
    if (authLoading) return

    if (!isTrainer) {
      showToast.error('Unauthorized access')
      navigate('/login')
      return
    }

    if (user?.id) {
      fetchTrainerStats()
    } else {
      setLoading(false)
    }
  }, [isTrainer, user, authLoading])

  const fetchTrainerStats = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.id) {
        setLoading(false)
        return
      }

      // Fetch all data in parallel using correct API wrappers
      const [enrollmentsRes, coursesRes, slotsRes] = await Promise.all([
        enrollmentAPI.getAll(),
        courseAPI.getAll(),
        schedulingAPI.getSlotsByTrainer(user.id)
      ])

      const enrollments = enrollmentsRes.data || []
      const courses = coursesRes.data || []
      const slots = slotsRes.data || []

      // Count unique students across all enrollments
      const uniqueStudents = new Set(enrollments.map(e => e.studentId)).size

      // Modules count - count unique moduleIds in assigned slots
      const trainerModules = new Set(slots.filter(s => s.moduleId).map(s => s.moduleId)).size

      setStats({
        assignedSlots: slots.length,
        students: uniqueStudents,
        courses: courses.length,
        modules: trainerModules
      })

      setTeaching(slots.slice(0, 5))
    } catch (err) {
      console.error('Error fetching trainer stats:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard')
      showToast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    showToast.info('Logged out successfully')
    navigate('/login')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="TRAINER" />

      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trainer Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Assigned Slots */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Assigned Slots</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.assignedSlots}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            {/* Students */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Students Teaching</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.students}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Courses</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.courses}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <BookOpen className="text-purple-600" size={24} />
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Modules</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.modules}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Clock className="text-orange-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Teaching Schedule</h2>
              <button
                onClick={() => navigate('/trainer/schedule')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View All →
              </button>
            </div>
            {teaching.length > 0 ? (
              <div className="space-y-3">
                {teaching.map((slot, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <Calendar className="text-blue-600" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">{slot.dayOfWeek || 'Schedule'}</p>
                        <p className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {slot.moduleName || 'Module'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">No scheduled classes at the moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default TrainerDashboard
