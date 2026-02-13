import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Clock, Calendar, Award } from 'lucide-react'
import { enrollmentAPI, timetableAPI } from '../../api'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [timetable, setTimetable] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchStudentData()
    }
  }, [user?.id])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      // Fetch enrolled courses
      const enrollmentsResponse = await enrollmentAPI.getByStudent(user.id)
      setEnrolledCourses(enrollmentsResponse.data)

      // Fetch timetable
      const timetableResponse = await timetableAPI.getStudentTimetable(user.id)
      setTimetable(timetableResponse.data || [])
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const timeSlots = ['8:00 - 11:00', '11:00 - 14:00', '14:00 - 17:00', '17:00 - 20:00']

  const getSlotColor = (module) => {
    if (!module) return 'bg-gray-50'
    const colors = {
      'React': 'bg-blue-500',
      'Node.js': 'bg-green-500',
      'Python': 'bg-yellow-500',
      'AWS': 'bg-orange-500',
    }
    return colors[module] || 'bg-gray-500'
  }

  const getSlotTextColor = (module) => {
    if (!module) return 'text-gray-400'
    return 'text-white'
  }

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const currentDay = getCurrentDay()

  // Transform timetable data into a usable format
  const getTimetableModule = (timeSlot, day) => {
    const slot = timetable.find(t => 
      t.timeSlot === timeSlot && t.dayOfWeek?.toLowerCase() === day.toLowerCase()
    )
    return slot?.moduleName || ''
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-500 mt-1">Here's your learning progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : enrolledCourses.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Award className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Hours Learned</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">48</p>
              </div>
              <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="text-white" size={28} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">12h</p>
              </div>
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="text-primary-600" size={20} />
                Weekly Timetable
              </h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-primary-600 to-secondary-600">
                        <th className="py-3 px-3 text-left text-white font-semibold text-sm">
                          <div className="flex items-center gap-1">Time</div>
                        </th>
                        {days.map((day) => (
                          <th key={day} className={`py-3 px-3 text-center text-white font-semibold text-sm ${day === currentDay ? 'bg-white/20' : ''}`}>
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timeSlots.map((timeSlot) => (
                        <tr key={timeSlot} className="border-b border-gray-100">
                          <td className="py-3 px-3">
                            <span className="text-xs font-medium text-gray-600">{timeSlot}</span>
                          </td>
                          {days.map((day) => {
                            const module = getTimetableModule(timeSlot, day)
                            return (
                              <td key={day} className={`py-2 px-2 ${day === currentDay ? 'bg-primary-50' : ''}`}>
                                {module && (
                                  <div className={`w-full h-12 rounded-lg ${getSlotColor(module)} ${getSlotTextColor(module)} flex items-center justify-center`}>
                                    <span className="font-semibold text-xs">{module}</span>
                                  </div>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-primary-600" size={20} />
                My Courses
              </h2>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : enrolledCourses.length === 0 ? (
                <p className="text-gray-500">No enrolled courses</p>
              ) : (
                <div className="space-y-4">
                  {enrolledCourses.map((enrollment) => (
                    <div key={enrollment.id} className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-semibold text-gray-900">{enrollment.courseName}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Enrolled: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard
