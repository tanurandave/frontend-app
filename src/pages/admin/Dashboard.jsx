import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import api from '../../api'
import { 
  Users, GraduationCap, BookOpen, Calendar, TrendingUp, AlertCircle, Loader 
} from 'lucide-react'
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Dashboard = () => {
  const { user, isAdmin } = useAuth()
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

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

      // User roles pie chart
      setChartData(prev => ({
        ...prev,
        userRoles: [
          { name: 'Students', value: students.length, color: '#3b82f6' },
          { name: 'Trainers', value: trainers.length, color: '#10b981' },
          { name: 'Admin', value: allUsers.filter(u => u.role === 'ADMIN').length, color: '#f59e0b' }
        ].filter(item => item.value > 0)
      }))

      // Enrollment trend (mock data based on actual enrollments)
      const enrollmentByMonth = {}
      enrollments.forEach(e => {
        const month = new Date(e.enrolledAt).toLocaleDateString('en-US', { month: 'short' })
        enrollmentByMonth[month] = (enrollmentByMonth[month] || 0) + 1
      })

      const trendData = Object.entries(enrollmentByMonth)
        .map(([month, count]) => ({ month, enrollments: count }))
        .slice(-6)

      setChartData(prev => ({
        ...prev,
        enrollmentTrend: trendData.length > 0 ? trendData : [
          { month: 'Jan', enrollments: 0 },
          { month: 'Feb', enrollments: 0 },
          { month: 'Mar', enrollments: 0 }
        ]
      }))

      // Course popularity (enrollments per course)
      const courseEnrollmentCount = {}
      enrollments.forEach(e => {
        courseEnrollmentCount[e.courseId] = (courseEnrollmentCount[e.courseId] || 0) + 1
      })

      const coursePopularityData = courses
        .map(c => ({
          name: c.name,
          enrollments: courseEnrollmentCount[c.id] || 0
        }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 5)

      setChartData(prev => ({
        ...prev,
        coursePopularity: coursePopularityData.length > 0 ? coursePopularityData : []
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
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Trainers', value: stats.totalTrainers, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Active Courses', value: stats.totalCourses, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Total Enrollments', value: stats.totalEnrollments, icon: Calendar, color: 'bg-orange-500' },
  ]

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar userRole="ADMIN" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <Loader className="animate-spin text-blue-600" size={48} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="ADMIN" />
      
      <div className="flex-1 flex flex-col ml-64 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="text-white" size={28} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Roles Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                User Distribution
              </h2>
              {chartData.userRoles.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData.userRoles}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.userRoles.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No user data available
                </div>
              )}
            </div>

            {/* Enrollment Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Enrollment Trend
              </h2>
              {chartData.enrollmentTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.enrollmentTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEnrollments" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="enrollments" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorEnrollments)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No enrollment data available
                </div>
              )}
            </div>
          </div>

          {/* Course Popularity & Recent Enrollments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Popularity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen size={20} className="text-purple-600" />
                Top Courses
              </h2>
              {chartData.coursePopularity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.coursePopularity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No course data available
                </div>
              )}
            </div>

            {/* Recent Enrollments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-orange-600" />
                Recent Enrollments
              </h2>
              {recentEnrollments.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {recentEnrollments.map((enrollment) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition border-l-4 border-blue-500"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold">
                            {enrollment.studentName?.charAt(0).toUpperCase() || 'S'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{enrollment.studentName || 'N/A'}</p>
                          <p className="text-sm text-gray-500 truncate">{enrollment.courseName || 'N/A'}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                        {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  No recent enrollments
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default Dashboard
