import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { enrollmentAPI, courseAPI, schedulingAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
  Users, BookOpen, Calendar, Clock,
  TrendingUp, ArrowUpRight, ChevronRight,
  MoreVertical, Search, Bell, Settings,
  BarChart3, PieChart, Activity
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  LineChart, Line, Cell
} from 'recharts'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TrainerDashboard = () => {
  const { user, isTrainer, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { isCollapsed } = useSidebar()
  const [stats, setStats] = useState({
    assignedSlots: 0,
    students: 0,
    courses: 0,
    modules: 0,
    teachingHours: 0
  })
  const [teaching, setTeaching] = useState([])
  const [loading, setLoading] = useState(true)

  // Demo data for charts
  const weeklyData = [
    { name: 'Mon', hours: 4, students: 25 },
    { name: 'Tue', hours: 6, students: 42 },
    { name: 'Wed', hours: 3, students: 18 },
    { name: 'Thu', hours: 8, students: 56 },
    { name: 'Fri', hours: 5, students: 30 },
    { name: 'Sat', hours: 2, students: 12 },
    { name: 'Sun', hours: 0, students: 0 },
  ]

  const engagementData = [
    { name: 'Week 1', value: 400 },
    { name: 'Week 2', value: 300 },
    { name: 'Week 3', value: 500 },
    { name: 'Week 4', value: 280 },
    { name: 'Week 5', value: 590 },
  ]

  useEffect(() => {
    if (authLoading) return
    if (!isTrainer) {
      navigate('/login')
      return
    }
    fetchTrainerStats()
  }, [isTrainer, user, authLoading])

  const fetchTrainerStats = async () => {
    try {
      setLoading(true)
      const [enrollmentsRes, coursesRes, slotsRes] = await Promise.all([
        enrollmentAPI.getAll(),
        courseAPI.getAll(),
        schedulingAPI.getSlotsByTrainer(user.id)
      ])

      const enrollments = enrollmentsRes.data || []
      const slots = slotsRes.data || []

      const uniqueStudents = new Set(enrollments.map(e => e.studentId)).size
      const trainerModules = new Set(slots.filter(s => s.moduleId).map(s => s.moduleId)).size

      // Calculate teaching hours (3 hours per slot)
      const hours = slots.length * 3

      setStats({
        assignedSlots: slots.length,
        students: uniqueStudents,
        courses: coursesRes.data?.length || 0,
        modules: trainerModules,
        teachingHours: hours
      })

      setTeaching(slots.slice(0, 5))
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      toast.error('Failed to update dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
          <Activity className="absolute inset-0 m-auto text-orange-600 animate-pulse" size={24} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar userRole="TRAINER" />

      <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} overflow-hidden transition-all duration-300`}>
        <Header />

        <main className="flex-1 overflow-auto p-8 custom-scrollbar">
          {/* Welcome Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Dashboard</h1>
              <p className="text-gray-500 font-medium mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex gap-3">
              <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/10">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
              <button className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex items-center gap-2">
                Quick Action
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Students', value: stats.students, sub: 'Active Enrollments', icon: Users, color: 'orange', trend: '+12%' },
              { label: 'Teaching Hours', value: stats.teachingHours, sub: 'Across all slots', icon: Clock, color: 'blue', trend: '+5%' },
              { label: 'Modules Ready', value: stats.modules, sub: 'Assigned curriculum', icon: BookOpen, color: 'indigo', trend: 'Stable' },
              { label: 'Weekly Slots', value: stats.assignedSlots, sub: 'Scheduled sessions', icon: Calendar, color: 'emerald', trend: '+2' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-100/20 transition-all group overflow-hidden relative">
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black text-gray-900">{item.value}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${item.trend.includes('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                        }`}>
                        {item.trend}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 font-medium mt-2">{item.sub}</p>
                  </div>
                  <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all`}>
                    <item.icon size={24} />
                  </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50/50 rounded-full blur-2xl group-hover:bg-orange-100/50 transition-all"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Main Chart - Teaching Load */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">Teaching Distribution</h4>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Weekly Session Allocation</p>
                </div>
                <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-orange-600 transition-colors">
                  <TrendingUp size={20} />
                </button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#868E96', fontSize: 12, fontWeight: 700 }}
                      dy={15}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#868E96', fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: '#F8F9FA' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                    />
                    <Bar
                      dataKey="hours"
                      fill="#EA580C"
                      radius={[6, 6, 6, 6]}
                      barSize={40}
                    >
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#EA580C' : '#FDBA74'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement Analytics */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">Student Engagement</h4>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Attendance & Participation</p>
                </div>
                <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-orange-600 transition-colors">
                  <Activity size={20} />
                </button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={engagementData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#868E96', fontSize: 12, fontWeight: 700 }}
                      dy={15}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#868E96', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#EA580C"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Students / Performers */}
            <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h4 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">Top Students</h4>
              <div className="space-y-6">
                {[
                  { name: "John Smith", score: "98%", id: "ST-001", color: "blue" },
                  { name: "Sarah Connor", score: "95%", id: "ST-142", color: "orange" },
                  { name: "Mike Ross", score: "92%", id: "ST-089", color: "emerald" },
                  { name: "Emma Watson", score: "88%", id: "ST-221", color: "indigo" },
                  { name: "David Miller", score: "85%", id: "ST-104", color: "purple" }
                ].map((st, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 bg-${st.color}-50 text-${st.color}-600 rounded-xl flex items-center justify-center font-black group-hover:bg-orange-600 group-hover:text-white transition-all`}>
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{st.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{st.id}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">{st.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Today's Schedule</h4>
                <button
                  onClick={() => navigate('/trainer/schedule')}
                  className="text-xs font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest flex items-center gap-1 bg-orange-50 px-4 py-2 rounded-xl transition-all"
                >
                  Full Calendar <ArrowUpRight size={14} />
                </button>
              </div>

              {teaching.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {teaching.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-[1.5rem] border border-gray-100 hover:border-orange-200 hover:bg-white transition-all group shadow-sm hover:shadow-xl hover:shadow-orange-100/10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center border border-gray-100 shadow-sm group-hover:bg-orange-600 group-hover:text-white transition-all">
                          <p className="text-[10px] font-black uppercase leading-none opacity-60">Slot</p>
                          <p className="text-xl font-black leading-none mt-1">#{slot.slotNumber}</p>
                        </div>
                        <div>
                          <h5 className="font-black text-gray-900 text-lg leading-tight uppercase tracking-tight">{slot.moduleName || 'Teaching Session'}</h5>
                          <div className="flex items-center gap-4 mt-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                              <Calendar size={14} className="text-orange-500" />
                              {slot.dayOfWeek}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                              <Clock size={14} className="text-blue-500" />
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:block text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Course</p>
                          <p className="text-sm font-black text-gray-900">{slot.courseName}</p>
                        </div>
                        <button className="w-10 h-10 bg-white text-gray-400 border border-gray-100 rounded-xl flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                  <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar size={40} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">No sessions today</h3>
                  <p className="text-gray-500 font-medium">Enjoy your free time or prepare for tomorrow!</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default TrainerDashboard
