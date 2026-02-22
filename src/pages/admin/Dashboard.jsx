import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'
import api from '../../api'
import {
  Users, GraduationCap, BookOpen, Calendar, TrendingUp, AlertCircle, Loader,
  ArrowUpRight, MapPin
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
  const { isCollapsed } = useSidebar()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTrainers: 0,
    totalCourses: 0,
    totalEnrollments: 0
  })
  const [chartData, setChartData] = useState({
    enrollmentTrend: [],
    userRoles: [],
    coursePopularity: []
  })
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const showToast = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast.info(msg)
  }

  useEffect(() => {
    if (!isAdmin) {
      showToast.error('Unauthorized access')
      return
    }
    fetchDashboardData()
  }, [isAdmin])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch users to get role counts
      const usersRes = await api.get('/users')
      const allUsers = usersRes.data || []
      const students = allUsers.filter(u => u.role === 'STUDENT')
      const trainers = allUsers.filter(u => u.role === 'TRAINER')

      // Fetch enrollments
      const enrollmentsRes = await api.get('/enrollments')
      const enrollments = enrollmentsRes.data || []

      // Fetch courses
      const coursesRes = await api.get('/courses')
      const courses = coursesRes.data || []

      // Set stats
      setStats({
        totalStudents: students.length,
        totalTrainers: trainers.length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length
      })

      // Set recent enrollments
      setRecentEnrollments(
        enrollments
          .sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt))
          .slice(0, 5)
      )

      // Course popularity (enrollments per course)
      const courseEnrollmentCount = {}
      enrollments.forEach(e => {
        courseEnrollmentCount[e.courseId] = (courseEnrollmentCount[e.courseId] || 0) + 1
      })

      const coursePopularityData = courses
        .map(c => ({
          name: c.name,
          enrollments: courseEnrollmentCount[c.id] || 0,
          views: Math.floor(Math.random() * 1000) // Mock views data
        }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5)

      setChartData(prev => ({
        ...prev,
        coursePopularity: coursePopularityData
      }))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard')
      showToast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, trend: '+12%', trendUp: true },
    { label: 'Total Trainers', value: stats.totalTrainers, icon: GraduationCap, trend: '+5%', trendUp: true },
    { label: 'Active Courses', value: stats.totalCourses, icon: BookOpen, trend: '+2%', trendUp: true },
    { label: 'Enrollments', value: stats.totalEnrollments, icon: Calendar, trend: '+18%', trendUp: true },
  ]

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar userRole="ADMIN" />
        <div className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} flex items-center justify-center transition-all duration-300`}>
          <Loader className="animate-spin text-orange-500" size={48} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar userRole="ADMIN" />

      <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} overflow-hidden transition-all duration-300`}>
        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Welcome back! Here's what happening with your platform.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-gray-500 font-medium">{stat.label}</p>
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <stat.icon size={20} />
                    </div>
                  </div>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                    <span className={`text-sm font-medium mb-1 ${stat.trendUp ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                      {stat.trend}
                      {stat.trendUp && <ArrowUpRight size={14} className="ml-0.5" />}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">From last month</p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-full group-hover:scale-150 transition-transform duration-500" />
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Course Popularity Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Course Popularity</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-3 h-3 rounded-full bg-orange-500"></span> Enrollments
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-3 h-3 rounded-full bg-gray-200"></span> Views
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
                  <Calendar size={18} />
                </button>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.coursePopularity} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Bar dataKey="enrollments" fill="#f97316" radius={[4, 4, 4, 4]} barSize={12} />
                    <Bar dataKey="views" fill="#e5e7eb" radius={[4, 4, 4, 4]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Activity / Profile Views Chart (Mock) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Platform Activity</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-3 h-3 rounded-full bg-orange-500"></span> Active
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="w-3 h-3 rounded-full bg-gray-200"></span> New
                    </div>
                  </div>
                </div>
                <button className="p-2 text-orange-500 bg-orange-50 rounded-lg">
                  <ArrowUpRight size={18} />
                </button>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Mon', active: 400, new: 240 },
                    { name: 'Tue', active: 300, new: 139 },
                    { name: 'Wed', active: 200, new: 580 },
                    { name: 'Thu', active: 278, new: 390 },
                    { name: 'Fri', active: 189, new: 480 },
                    { name: 'Sat', active: 239, new: 380 },
                    { name: 'Sun', active: 349, new: 430 },
                  ]} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="active" fill="#f97316" radius={[4, 4, 4, 4]} barSize={12} />
                    <Bar dataKey="new" fill="#e5e7eb" radius={[4, 4, 4, 4]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Lists Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Locations (Mock) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Top Locations</h3>
              <div className="space-y-6">
                {[
                  { city: 'New York', leads: 176 },
                  { city: 'London', leads: 142 },
                  { city: 'Paris', leads: 120 },
                  { city: 'Tokyo', leads: 98 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <MapPin size={18} />
                      </div>
                      <span className="font-medium text-gray-700">{item.city}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.leads}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Enrollments (Updated UI) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Enrollments</h3>
              <div className="space-y-4">
                {recentEnrollments.length > 0 ? recentEnrollments.map((enr, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                        {enr.studentName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{enr.studentName}</p>
                        <p className="text-xs text-gray-500">{enr.courseName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{new Date(enr.enrolledAt).toLocaleDateString()}</p>
                      <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">Confirmed</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-8">No recent enrollments</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default Dashboard
