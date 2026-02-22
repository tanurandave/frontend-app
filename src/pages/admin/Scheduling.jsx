import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
  Calendar, Plus, Edit, Clock, X, Save, Trash2,
  ChevronLeft, ChevronRight, User, BookOpen, Layers,
  CheckCircle, AlertCircle, Loader
} from 'lucide-react'
import { schedulingAPI, courseAPI, userAPI } from '../../api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Scheduling = () => {
  const { isCollapsed } = useSidebar()
  const [weeks, setWeeks] = useState([])
  const [currentWeek, setCurrentWeek] = useState(null)
  const [slots, setSlots] = useState([])
  const [courses, setCourses] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showWeekModal, setShowWeekModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null) // For editing

  // Form States
  const [weekNumber, setWeekNumber] = useState('')
  const [formData, setFormData] = useState({
    courseId: '',
    moduleId: '',
    trainerId: '',
    dayOfWeek: '',
    slotNumber: ''
  })

  const timeSlots = [
    { id: 1, label: '08:00 - 11:00' },
    { id: 2, label: '11:00 - 14:00' },
    { id: 3, label: '14:00 - 17:00' },
    { id: 4, label: '17:00 - 20:00' }
  ]
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [weeksRes, coursesRes, trainersRes] = await Promise.all([
        schedulingAPI.getAllWeeks(),
        courseAPI.getAll(),
        userAPI.getTrainers()
      ])

      const sortedWeeks = (weeksRes.data || []).sort((a, b) => b.weekNumber - a.weekNumber)
      setWeeks(sortedWeeks)
      setCourses(coursesRes.data || [])
      setTrainers(trainersRes.data || [])

      if (sortedWeeks.length > 0) {
        setCurrentWeek(sortedWeeks[0])
        fetchSlots(sortedWeeks[0].id)
      }
    } catch (error) {
      console.error('Error loading scheduling data:', error)
      toast.error('Failed to load scheduling data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async (weekId) => {
    try {
      const response = await schedulingAPI.getSlotsByWeek(weekId)
      setSlots(response.data || [])
    } catch (error) {
      console.error('Error fetching slots:', error)
      toast.error('Failed to load slots for this week')
    }
  }

  const handleCreateWeek = async (e) => {
    e.preventDefault()
    if (!weekNumber || isNaN(parseInt(weekNumber))) {
      toast.error('Please enter a valid week number')
      return
    }
    try {
      const response = await schedulingAPI.createWeek({ weekNumber: parseInt(weekNumber) })
      setWeeks([response.data, ...weeks])
      setCurrentWeek(response.data)
      setWeekNumber('')
      setShowWeekModal(false)
      setSlots([])
      toast.success('Successfully created Week ' + response.data.weekNumber)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create week')
    }
  }

  const openSlotModal = (day, slotNum, existingSlot = null) => {
    if (!currentWeek) {
      toast.info('Please create or select a week first')
      return
    }

    if (existingSlot) {
      setSelectedSlot(existingSlot)
      setFormData({
        courseId: existingSlot.courseId,
        moduleId: existingSlot.moduleId,
        trainerId: existingSlot.trainerId,
        dayOfWeek: existingSlot.dayOfWeek,
        slotNumber: existingSlot.slotNumber
      })
    } else {
      setSelectedSlot(null)
      setFormData({
        courseId: '',
        moduleId: '',
        trainerId: '',
        dayOfWeek: day,
        slotNumber: slotNum
      })
    }
    setShowSlotModal(true)
  }

  const handleSlotSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedSlot) {
        await schedulingAPI.updateSlot(currentWeek.id, selectedSlot.id, formData)
        toast.success('Slot updated successfully')
      } else {
        await schedulingAPI.createSlot(currentWeek.id, formData)
        toast.success('Slot created successfully')
      }
      setShowSlotModal(false)
      fetchSlots(currentWeek.id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return
    try {
      await schedulingAPI.deleteSlot(slotId)
      setSlots(slots.filter(s => s.id !== slotId))
      setShowSlotModal(false)
      toast.success('Session deleted')
    } catch (error) {
      toast.error('Failed to delete session')
    }
  }

  const getSlotForDayAndTime = (day, slotNum) => {
    return slots.find(s => s.dayOfWeek === day && s.slotNumber === slotNum)
  }

  const getModulesForCourse = () => {
    const course = courses.find(c => c.id === parseInt(formData.courseId))
    return course ? course.modules : []
  }

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar userRole="ADMIN" />
        <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <Loader className="animate-spin text-primary-600" size={48} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar userRole="ADMIN" />

      <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        <Header />

        <div className="flex-1 overflow-auto p-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Schedule Management</h1>
              <p className="text-gray-500 font-medium">Coordinate courses, trainers and classrooms</p>
            </div>
            <button
              onClick={() => setShowWeekModal(true)}
              className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-2xl hover:bg-black transition-all font-bold uppercase tracking-widest text-sm shadow-xl shadow-gray-200 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Create New Week
            </button>
          </div>

          {/* Week Selector */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Active View</h3>
                <p className="text-xl font-black text-gray-900 uppercase">
                  {currentWeek ? `Week ${currentWeek.weekNumber}` : 'No Week Selected'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 max-w-lg scrollbar-hide">
              {weeks.map(week => (
                <button
                  key={week.id}
                  onClick={() => {
                    setCurrentWeek(week)
                    fetchSlots(week.id)
                  }}
                  className={`px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all whitespace-nowrap shadow-sm border ${currentWeek?.id === week.id
                    ? 'bg-blue-600 text-white border-blue-600 scale-105 shadow-blue-200'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200 hover:text-blue-600'
                    }`}
                >
                  W{week.weekNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Table */}
          <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-900">
                    <th className="p-6 text-left border-b border-gray-800">
                      <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs">
                        <Clock size={16} className="text-blue-400" />
                        Timing
                      </div>
                    </th>
                    {days.map(day => (
                      <th key={day} className="p-6 text-center border-b border-gray-800">
                        <div className="text-white font-black uppercase tracking-widest text-xs">
                          {day}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(time => (
                    <tr key={time.id} className="group">
                      <td className="p-6 bg-gray-50/50 border-r border-gray-100 w-48">
                        <p className="text-sm font-black text-gray-900 tracking-tight">{time.label}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Session {time.id}</p>
                      </td>
                      {days.map(day => {
                        const slot = getSlotForDayAndTime(day, time.id)
                        return (
                          <td key={day} className="p-4 border border-gray-50 group-hover:bg-gray-50/30 transition-colors">
                            {slot ? (
                              <button
                                onClick={() => openSlotModal(day, time.id, slot)}
                                className="w-full text-left p-4 rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group/slot relative overflow-hidden"
                              >
                                <div className="absolute top-0 right-0 w-1 h-full bg-blue-600"></div>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 truncate">{slot.courseName}</p>
                                <h4 className="font-extrabold text-gray-900 text-sm uppercase leading-tight mb-2 line-clamp-2">{slot.moduleName}</h4>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                  <User size={12} className="text-blue-500" />
                                  <span className="text-[10px] font-bold uppercase tracking-tight truncate">{slot.trainerName}</span>
                                </div>
                                <div className="absolute top-2 right-2 opacity-0 group-hover/slot:opacity-100 transition-opacity">
                                  <Edit size={14} className="text-blue-600" />
                                </div>
                              </button>
                            ) : (
                              <button
                                onClick={() => openSlotModal(day, time.id)}
                                className="w-full h-24 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-300 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all group/add"
                              >
                                <Plus size={24} className="group-hover/add:scale-125 transition-transform" />
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create Week Modal */}
      {showWeekModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl ring-1 ring-black/5">
            <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">New Schedule</h3>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Configuration</p>
              </div>
              <button onClick={() => setShowWeekModal(false)} className="hover:rotate-90 transition-transform"><X /></button>
            </div>
            <form onSubmit={handleCreateWeek} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Week Number</label>
                <input
                  type="number"
                  required
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  placeholder="Enter Week Number (e.g. 1)"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                Launch Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Slot Modal (Create/Edit) */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
              <button
                onClick={() => setShowSlotModal(false)}
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              >
                <X size={28} />
              </button>
              <div className="flex items-center gap-4 mb-2">
                <div className="px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {formData.dayOfWeek} • SLOT {formData.slotNumber}
                </div>
              </div>
              <h3 className="text-4xl font-black uppercase tracking-tight">
                {selectedSlot ? 'Modify Session' : 'Assign Session'}
              </h3>
              <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Current Week {currentWeek.weekNumber}</p>
            </div>

            <form onSubmit={handleSlotSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Course Select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} /> Course Path
                  </label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value, moduleId: '' })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold outline-none"
                  >
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Module Select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14} /> Knowledge Unit
                  </label>
                  <select
                    required
                    disabled={!formData.courseId}
                    value={formData.moduleId}
                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold outline-none disabled:bg-gray-100"
                  >
                    <option value="">Select Module</option>
                    {getModulesForCourse().map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                {/* Trainer Select */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={14} /> Lead Trainer
                  </label>
                  <select
                    required
                    value={formData.trainerId}
                    onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 font-bold outline-none"
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {selectedSlot && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(selectedSlot.id)}
                    className="w-20 h-16 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-red-100"
                  >
                    <Trash2 size={24} />
                  </button>
                )}
                <button type="submit" className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-2xl shadow-gray-200">
                  <Save size={20} />
                  {selectedSlot ? 'Update Session' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default Scheduling
