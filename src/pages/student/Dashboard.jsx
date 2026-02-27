import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import {
  BookOpen, Clock, Calendar, Award, Bell, CheckCircle, XCircle,
  User, Layers, Play, Search, TrendingUp, ArrowRight, Settings,
  BarChart3, GraduationCap
} from 'lucide-react'
import { enrollmentAPI, timetableAPI, notificationAPI, courseAPI } from '../../api'
import { toast } from 'react-toastify'

const StudentDashboard = () => {
  const { user } = useAuth()
  const { isPinned, isHovering } = useSidebar()
  const navigate = useNavigate()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [availableCourses, setAvailableCourses] = useState([])
  const [timetable, setTimetable] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestingCourse, setRequestingCourse] = useState(null)

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
        courseAPI.getAll()
      ])

      setEnrolledCourses(enrollmentsRes.data)
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
    // Check if already enrolled (APPROVED) before calling API
    const existingStatus = getEnrollmentStatus(courseId)
    if (existingStatus === 'APPROVED') {
      toast.warning('You are already enrolled in this course!')
      return
    }
    if (existingStatus === 'PENDING') {
      toast.info('Your enrollment request is already pending.')
      return
    }

    try {
      setRequestingCourse(courseId)
      await enrollmentAPI.request({ studentId: user.id, courseId })
      toast.success('Enrollment request sent successfully!')
      const enrollmentsRes = await enrollmentAPI.getByStudent(user.id)
      setEnrolledCourses(enrollmentsRes.data)
    } catch (error) {
      console.error("Failed to request enrollment", error)
      const errorMsg = error.response?.data?.message || error.message
      if (errorMsg?.toLowerCase().includes('already enrolled') || errorMsg?.toLowerCase().includes('request pending')) {
        toast.warning('You are already enrolled in this course!')
      } else {
        toast.error('Failed to request enrollment: ' + errorMsg)
      }
    } finally {
      setRequestingCourse(null)
    }
  }

  const getEnrollmentStatus = (courseId) => {
    const enrollment = enrolledCourses.find(e => e.courseId === courseId)
    return enrollment ? enrollment.status : null
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

  const getCurrentDay = () => {
    const d = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return d[new Date().getDay()]
  }
  const currentDay = getCurrentDay()

  const getTimetableModule = (slotIndex, day) => {
    // slotIndex is 0-3, slotNumber is 1-4
    const slotNumber = slotIndex + 1
    const slot = timetable.find(t =>
      t.slotNumber === slotNumber && t.dayOfWeek?.toLowerCase() === day.toLowerCase()
    )
    return slot?.moduleName || ''
  }

  const slotColors = [
    'bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-pink-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500'
  ]
  const getSlotColor = (module) => {
    if (!module) return ''
    let hash = 0
    for (let i = 0; i < module.length; i++) hash = module.charCodeAt(i) + ((hash << 5) - hash)
    return slotColors[Math.abs(hash) % slotColors.length]
  }

  // Computed stats
  const approvedCount = enrolledCourses.filter(e => e.status === 'APPROVED').length
  const pendingCount = enrolledCourses.filter(e => e.status === 'PENDING').length
  const unreadNotifs = notifications.filter(n => !n.isRead).length
  const totalModules = enrolledCourses.reduce((acc, e) => {
    const course = availableCourses.find(c => c.id === e.courseId)
    return acc + (course?.modules?.length || 0)
  }, 0)

  const statCards = [
    {
      label: 'Enrolled Courses',
      value: loading ? '—' : approvedCount,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      description: `${availableCourses.length} available`,
      trend: '+' + approvedCount
    },
    {
      label: 'Pending Requests',
      value: loading ? '—' : pendingCount,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      description: 'Awaiting approval',
      trend: pendingCount > 0 ? pendingCount + ' active' : 'None'
    },
    {
      label: 'Total Modules',
      value: loading ? '—' : totalModules,
      icon: Layers,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-100',
      description: 'Across all courses',
      trend: totalModules + ' total'
    },
    {
      label: 'Notifications',
      value: loading ? '—' : unreadNotifs,
      icon: Bell,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      iconBg: 'bg-violet-100',
      description: `${notifications.length} total`,
      trend: unreadNotifs > 0 ? unreadNotifs + ' new' : 'All read'
    }
  ]

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />
      <main className={`flex-1 ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} transition-all duration-300`}>

        {/* Top Header Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all"
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/student/notifications')}
                className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadNotifs > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {unreadNotifs}
                  </span>
                )}
              </button>
              <button className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                <Settings size={20} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3 bg-gray-50 pl-1 pr-4 py-1 rounded-full border border-gray-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-[11px] text-gray-400">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Dashboard Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm">Welcome back! Here's what's happening with your learning.</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      <span className={`text-xs font-semibold ${stat.color} ${stat.bgColor} px-2 py-0.5 rounded-full`}>
                        {stat.trend}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={stat.color} size={22} />
                  </div>
                </div>
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
            ))}
          </div>

          {/* Middle Section - Enrolled Courses & Notifications */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Enrolled Courses - 2 cols */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="text-orange-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">My Enrollments</h2>
                </div>
                <Link
                  to="/student/requests"
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                  </div>
                ) : enrolledCourses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                      <BookOpen className="text-gray-300" size={28} />
                    </div>
                    <h3 className="text-gray-500 font-medium">No enrollments yet</h3>
                    <p className="text-gray-400 text-sm mt-1">Browse courses to get started</p>
                    <Link
                      to="/student/view-courses"
                      className="mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                    {enrolledCourses.map((enrollment) => {
                      const status = enrollment.status || 'APPROVED'
                      const courseDetails = availableCourses.find(c => c.id === enrollment.courseId)
                      const statusStyles = {
                        'APPROVED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        'PENDING': 'bg-amber-50 text-amber-700 border-amber-200',
                        'REJECTED': 'bg-red-50 text-red-700 border-red-200'
                      }

                      return (
                        <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all group cursor-pointer">
                          <div className="w-11 h-11 bg-gradient-to-br from-orange-100 to-amber-50 rounded-xl flex items-center justify-center shrink-0">
                            <BookOpen className="text-orange-600" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">{enrollment.courseName}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[status] || 'bg-gray-50 text-gray-600'}`}>
                                {status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={11} />
                                {new Date(enrollment.enrolledAt).toLocaleDateString()}
                              </span>
                              {courseDetails && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Layers size={11} />
                                  {courseDetails.modules?.length || 0} Modules
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {status === 'APPROVED' ? (
                              <Link
                                to={`/student/courses/${enrollment.courseId}`}
                                className="p-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors inline-flex"
                              >
                                <Play size={16} />
                              </Link>
                            ) : status === 'PENDING' ? (
                              <div className="p-2.5 bg-amber-100 text-amber-600 rounded-xl">
                                <Clock size={16} />
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRequestEnrollment(enrollment.courseId)}
                                disabled={requestingCourse === enrollment.courseId}
                                className="px-3 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-xs font-semibold"
                                title="Re-request enrollment"
                              >
                                {requestingCourse === enrollment.courseId ? (
                                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                  'Re-request'
                                )}
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

            {/* Notifications - 1 col */}
            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Bell className="text-violet-600" size={18} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                </div>
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="p-4 space-y-2 max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-7 h-7 border-3 border-violet-200 border-t-violet-500 rounded-full animate-spin"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                      <Bell className="text-gray-300" size={24} />
                    </div>
                    <p className="text-gray-400 text-sm">No notifications yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all ${notif.isRead
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-violet-50 border border-violet-100 hover:bg-violet-100'
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-violet-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                            {notif.message}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Browse Courses */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-blue-600" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Browse Courses</h2>
              </div>
              <Link
                to="/student/view-courses"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
              >
                See All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              ) : availableCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BookOpen className="text-gray-200 mb-3" size={48} />
                  <p className="text-gray-400">No courses available right now</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {availableCourses.slice(0, 6).map(course => {
                    const status = getEnrollmentStatus(course.id)
                    const isEnrolled = status === 'APPROVED'
                    const isPending = status === 'PENDING'
                    const isRejected = status === 'REJECTED'

                    return (
                      <div key={course.id} className="rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-md transition-all group flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <BookOpen className="text-blue-600" size={20} />
                          </div>
                          {status && (
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                              }`}>
                              {status}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mb-1.5">{course.name}</h3>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 flex-1">{course.description}</p>

                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                          <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}h</span>
                          <span className="flex items-center gap-1"><Layers size={12} /> {course.modules?.length || 0} Modules</span>
                        </div>

                        <button
                          onClick={() => isEnrolled ? navigate(`/student/courses/${course.id}`) : handleRequestEnrollment(course.id)}
                          disabled={isPending || requestingCourse === course.id}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
                            ${isEnrolled
                              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : isPending
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
                            }`}
                        >
                          {requestingCourse === course.id ? (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              {isEnrolled ? 'View Course' : isPending ? 'Pending' : isRejected ? 'Re-request' : 'Enroll Now'}
                              {isEnrolled && <Play size={14} />}
                              {(!status || isRejected) && <CheckCircle size={14} />}
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
              }
            </div>
          </div>

          {/* Weekly Timetable */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Calendar className="text-emerald-600" size={18} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Weekly Timetable</h2>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                {currentDay}
              </span>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-3.5 px-4 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-28 border-r border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            Time
                          </div>
                        </th>
                        {days.map((day) => (
                          <th
                            key={day}
                            className={`py-3.5 px-4 text-center text-[11px] font-semibold uppercase tracking-wider min-w-[110px] ${day === currentDay
                              ? 'bg-orange-50 text-orange-600'
                              : 'text-gray-500'
                              }`}
                          >
                            {day.slice(0, 3)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {timeSlots.map((timeSlot, index) => (
                        <tr key={timeSlot} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-3.5 px-4 sticky left-0 bg-white z-10 border-r border-gray-100">
                            <span className="text-[11px] font-bold text-gray-500">{timeSlot}</span>
                          </td>
                          {days.map((day) => {
                            const module = getTimetableModule(index, day)
                            return (
                              <td key={day} className={`py-2.5 px-2.5 ${day === currentDay ? 'bg-orange-50/30' : ''}`}>
                                {module ? (
                                  <div className={`py-2.5 px-3 rounded-lg ${getSlotColor(module)} text-white text-center shadow-sm hover:scale-105 transition-transform cursor-pointer`}>
                                    <span className="font-bold text-[11px] block truncate">{module}</span>
                                  </div>
                                ) : (
                                  <div className="min-h-[40px]"></div>
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
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard
