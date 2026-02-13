import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useAuth } from '../../context/AuthContext'
import { Users, GraduationCap, BookOpen, Calendar, Clock } from 'lucide-react'
import { statsAPI, enrollmentAPI, schedulingAPI } from '../../api'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    students: 0,
    trainers: 0,
    courses: 0,
    schedules: 0
  })
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch stats
      const statsResponse = await statsAPI.getDashboardStats()
      setStats(statsResponse.data)

      // Fetch recent enrollments
      const enrollmentsResponse = await enrollmentAPI.getAll()
      setRecentEnrollments(enrollmentsResponse.data.slice(-5).reverse())
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Trainers', value: stats.trainers, icon: GraduationCap, color: 'bg-green-500' },
    { label: 'Active Courses', value: stats.courses, icon: BookOpen, color: 'bg-purple-500' },
    { label: 'Active Schedules', value: stats.schedules, icon: Calendar, color: 'bg-orange-500' },
  ]

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="glass-card p-6 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loading ? '...' : stat.value}</p>
                </div>
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="text-white" size={28} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-primary-600" />
              Weekly Schedule
            </h2>
            <p className="text-gray-500 text-sm">View the Scheduling page for weekly schedule details.</p>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} className="text-primary-600" />
              Recent Enrollments
            </h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : recentEnrollments.length === 0 ? (
                <p className="text-gray-500">No enrollments yet.</p>
              ) : (
                recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold">
                        {enrollment.studentName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.studentName}</p>
                        <p className="text-sm text-gray-500">{enrollment.courseName}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
