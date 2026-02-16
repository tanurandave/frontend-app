import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { schedulingAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import { ArrowLeft, Calendar, Clock, MapPin, Users, AlertCircle, Loader } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TrainerSchedule = () => {
  const { user, isTrainer, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState('all')

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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
      fetchSchedule()
    } else {
      setLoading(false)
    }
  }, [isTrainer, user, authLoading])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user?.id) {
        setLoading(false)
        return
      }

      const res = await schedulingAPI.getSlotsByTrainer(user.id)
      const slots = res.data || []

      // Sort slots by day and time
      const sorted = slots.sort((a, b) => {
        const dayOrder = days.indexOf(a.dayOfWeek) - days.indexOf(b.dayOfWeek)
        if (dayOrder !== 0) return dayOrder
        return a.startTime.localeCompare(b.startTime)
      })
      setSchedule(sorted)
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setError(err.response?.data?.message || 'Failed to load schedule')
      showToast.error('Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  const filteredSchedule = selectedDay === 'all'
    ? schedule
    : schedule.filter(slot => slot.dayOfWeek === selectedDay)

  const getDayColor = (day) => {
    const colors = {
      'Monday': 'bg-blue-100 text-blue-700',
      'Tuesday': 'bg-green-100 text-green-700',
      'Wednesday': 'bg-purple-100 text-purple-700',
      'Thursday': 'bg-yellow-100 text-yellow-700',
      'Friday': 'bg-red-100 text-red-700',
      'Saturday': 'bg-pink-100 text-pink-700',
      'Sunday': 'bg-gray-100 text-gray-700'
    }
    return colors[day] || 'bg-gray-100 text-gray-700'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin" size={48} color="#3b82f6" />
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/trainer')}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Teaching Schedule</h1>
                <p className="text-gray-500 mt-1">Weekly class schedule</p>
              </div>
            </div>
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

          {/* Day Filter */}
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Filter by day:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDay('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${selectedDay === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  All Days
                </button>
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${selectedDay === day
                      ? `${getDayColor(day)} border-2 border-blue-400`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Cards */}
          {filteredSchedule.length > 0 ? (
            <div className="space-y-4">
              {filteredSchedule.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDayColor(slot.dayOfWeek)}`}>
                          {slot.dayOfWeek}
                        </span>
                        <span className="text-sm text-gray-500">{slot.startTime} - {slot.endTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{slot.moduleName || 'Module Name Not Set'}</h3>
                      <p className="text-sm text-blue-600 font-medium">{slot.courseName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3 text-gray-600">
                      <Clock size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Slot Type</p>
                        <p className="font-medium">Slot #{slot.slotNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Users size={18} className="text-green-600" />
                      <div>
                        <p className="text-xs text-gray-500">Trainer</p>
                        <p className="font-medium">{slot.trainerName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No classes scheduled</h3>
              <p className="text-gray-500">
                {selectedDay === 'all'
                  ? 'You have no classes scheduled.'
                  : `You have no classes scheduled for ${selectedDay}.`}
              </p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default TrainerSchedule
