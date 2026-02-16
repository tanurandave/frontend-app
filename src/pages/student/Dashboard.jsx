import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Clock, Calendar, Award, Bell, CheckCircle, XCircle, User, Layers } from 'lucide-react'
import { enrollmentAPI, timetableAPI, notificationAPI, courseAPI } from '../../api'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([]) // New state
  const [timetable, setTimetable] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestingCourse, setRequestingCourse] = useState(null) // Track requesting state

  useEffect(() => {
    if (user?.id) {
      fetchStudentData()
    }
  }, [user?.id])

  const fetchStudentData = async () => {
    try {
      setLoading(true)
      const [enrollmentsRes, timetableRes, notificationsRes, coursesRes] = await Promise.all([
        enrollmentAPI.getByStudent(user.id),
        timetableAPI.getStudentTimetable(user.id),
        notificationAPI.getUserNotifications(user.id),
        courseAPI.getAll() // Fetch all courses
      ])

      const enrollments = enrollmentsRes.data
      setEnrolledCourses(enrollments)
      setTimetable(timetableRes.data || [])
      setNotifications(notificationsRes.data)
      setAvailableCourses(coursesRes.data)
    } catch (error) {
      console.error('Error fetching student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestEnrollment = async (courseId) => {
    try {
      setRequestingCourse(courseId)
      await enrollmentAPI.request({ studentId: user.id, courseId })
      // Refresh data to show Pending status
      const enrollmentsRes = await enrollmentAPI.getByStudent(user.id)
      setEnrolledCourses(enrollmentsRes.data)
      // Also maybe add a local notification or update notifications
      setNotifications(prev => [
        ...prev,
        { id: Date.now(), message: 'Enrollment request sent successfully', isRead: false, createdAt: new Date() }
      ])
    } catch (error) {
      console.error("Failed to request enrollment", error)
      alert("Failed to request enrollment: " + (error.response?.data?.message || error.message))
    } finally {
      setRequestingCourse(null)
    }
  }

  // Helper to check enrollment status for a course
  const getEnrollmentStatus = (courseId) => {
    const enrollment = enrolledCourses.find(e => e.courseId === courseId)
    return enrollment ? enrollment.status : null
  }

  // Helper to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-50 text-green-700 border-green-100'
      case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-100'
      case 'REJECTED': return 'bg-red-50 text-red-700 border-red-100'
      default: return 'bg-gray-50 text-gray-700 border-gray-100'
    }
  }

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
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

  const getTimetableModule = (timeSlot, day) => {
    const slot = timetable.find(t =>
      t.timeSlot === timeSlot && t.dayOfWeek?.toLowerCase() === day.toLowerCase()
    )
    return slot?.moduleName || ''
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-500 mt-1">Here's your learning progress</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow">
                <Bell size={20} className="text-gray-600 group-hover:text-primary-600 transition-colors" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </div>

              {/* Notification Dropdown Preview on Hover could be implemented here */}
            </div>
            <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {user?.name?.charAt(0)}
              </div>
              <span className="font-medium text-gray-700 text-sm hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Enrolled Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : enrolledCourses.filter(e => e.status === 'APPROVED').length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <BookOpen className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Award className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : enrolledCourses.filter(e => e.status === 'PENDING').length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Notifications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{notifications.filter(n => !n.isRead).length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Bell className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Browse Courses Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={20} />
              Browse Courses
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="lg:col-span-3 text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Loading available courses...</p>
              </div>
            ) : availableCourses.length === 0 ? (
              <div className="lg:col-span-3 flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium text-lg">No courses available</h3>
                <p className="text-gray-500 text-sm mt-1">Check back later for new courses</p>
              </div>
            ) : (
              availableCourses.map(course => {
                const status = getEnrollmentStatus(course.id)
                const isEnrolled = status === 'APPROVED'
                const isPending = status === 'PENDING'
                const isRejected = status === 'REJECTED'

                return (
                  <div key={course.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                        <BookOpen size={24} />
                      </div>
                      {status && (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{course.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{course.description}</p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock size={14} className="text-gray-400" /> {course.duration} Hours</span>
                        <span className="flex items-center gap-1"><Layers size={14} className="text-gray-400" /> {course.modules ? course.modules.length : 0} Modules</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User size={14} className="text-gray-400" />
                        <span>Trainer: <span className="font-medium text-gray-700">{course.primaryTrainerName || 'Not Assigned'}</span></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequestEnrollment(course.id)}
                      disabled={!!status || requestingCourse === course.id}
                      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2
                                        ${!status
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-indigo-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}
                                    `}
                    >
                      {requestingCourse === course.id ? (
                        <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {isEnrolled ? 'Enrolled' : isPending ? 'Request Pending' : isRejected ? 'Rejected' : 'Request to Join'}
                          {!status && <CheckCircle size={16} />}
                        </>
                      )}
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Notifications Section */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Bell className="text-orange-600" size={20} />
                  Notifications
                </h2>
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[400px]">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Bell size={32} className="mb-2 opacity-20" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all cursor-pointer group ${notification.isRead
                        ? 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        : 'bg-blue-50 border-blue-100 shadow-sm hover:bg-blue-100'
                        }`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {notification.message}
                        </p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* My Enrolled Courses Section */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 h-full flex flex-col">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="text-primary-600" size={20} />
                My Enrollments
              </h2>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm">Loading courses...</p>
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium text-lg">No enrolled courses yet</h3>
                  <p className="text-gray-500 text-sm mt-1">Courses you enroll in will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
                  {enrolledCourses.map((enrollment) => {
                    const status = enrollment.status || 'APPROVED'
                    const courseDetails = availableCourses.find(c => c.id === enrollment.courseId)

                    return (
                      <div key={enrollment.id} className="flex p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600 rounded-xl flex items-center justify-center shrink-0 mr-4 group-hover:scale-110 transition-transform">
                          <BookOpen size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-lg">{enrollment.courseName}</h3>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {enrollment.courseDescription || 'No description available for this course.'}
                          </p>
                          <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                              <Calendar size={12} />
                              <span>{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                              <Clock size={12} />
                              <span>{enrollment.courseDuration ? `${enrollment.courseDuration} Hours` : 'N/A'}</span>
                            </div>
                            {courseDetails && (
                              <>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                  <User size={12} />
                                  <span>{courseDetails.primaryTrainerName || 'No Trainer'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                  <Layers size={12} />
                                  <span>{courseDetails.modules ? courseDetails.modules.length : 0} Mods</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center pl-4 border-l border-gray-50 ml-4">
                          {status === 'APPROVED' ? (
                            <button className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all" title="Enrolled">
                              <CheckCircle size={20} />
                            </button>
                          ) : status === 'PENDING' ? (
                            <button className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-all" title="Pending Approval">
                              <Clock size={20} />
                            </button>
                          ) : (
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Rejected">
                              <XCircle size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-primary-600" size={20} />
              Weekly Timetable
            </h2>
            <div className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {currentDay}
            </div>
          </div>
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading timetable...</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-4 text-left font-semibold text-xs text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-32">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        Time
                      </div>
                    </th>
                    {days.map((day) => (
                      <th key={day} className={`py-4 px-4 text-center font-semibold text-xs text-gray-500 uppercase tracking-wider min-w-[120px] ${day === currentDay ? 'bg-blue-50/50 text-blue-600' : ''}`}>
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-4 px-4 sticky left-0 bg-white z-10 border-r border-gray-50">
                        <span className="text-xs font-bold text-gray-600 block">{timeSlot}</span>
                      </td>
                      {days.map((day) => {
                        const module = getTimetableModule(timeSlot, day)
                        return (
                          <td key={day} className={`py-3 px-3 ${day === currentDay ? 'bg-blue-50/10' : ''}`}>
                            {module ? (
                              <div className={`w-full py-3 rounded-lg ${getSlotColor(module)} ${getSlotTextColor(module)} flex flex-col items-center justify-center shadow-sm transform hover:scale-105 transition-all cursor-pointer group relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="font-bold text-xs px-2 text-center z-10">{module}</span>
                              </div>
                            ) : (
                              <div className="h-full min-h-[48px]"></div>
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
      </main>
    </div>
  )
}

export default StudentDashboard
