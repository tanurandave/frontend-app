import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
  Calendar, Plus, Edit, Clock, X, Save, Trash2,
  ChevronLeft, ChevronRight, User, BookOpen, Layers,
  CheckCircle, AlertCircle, Loader, CalendarDays, LayoutGrid
} from 'lucide-react'
import { schedulingAPI, courseAPI, userAPI } from '../../api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const slotColors = [
  { bg: 'bg-orange-50', border: 'border-orange-200', accent: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-600' },
  { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-600' },
  { bg: 'bg-rose-50', border: 'border-rose-200', accent: 'bg-rose-500', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-600' },
  { bg: 'bg-violet-50', border: 'border-violet-200', accent: 'bg-violet-500', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-600' },
  { bg: 'bg-cyan-50', border: 'border-cyan-200', accent: 'bg-cyan-500', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-600' },
  { bg: 'bg-emerald-50', border: 'border-emerald-200', accent: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-600' },
]

const getSlotColor = (courseId) => {
  if (!courseId) return slotColors[0]
  return slotColors[courseId % slotColors.length]
}

const Scheduling = () => {
  const { isPinned, isHovering } = useSidebar()
  const [weeks, setWeeks] = useState([])
  const [currentWeek, setCurrentWeek] = useState(null)
  const [slots, setSlots] = useState([])
  const [courses, setCourses] = useState([])
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileDay, setMobileDay] = useState(0)

  // Modals
  const [showWeekModal, setShowWeekModal] = useState(false)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Form States
  const [weekNumber, setWeekNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    courseId: '',
    moduleId: '',
    trainerId: '',
    dayOfWeek: '',
    slotNumber: ''
  })

  const timeSlots = [
    { id: 1, label: '08:00 – 11:00', period: 'Morning' },
    { id: 2, label: '11:00 – 14:00', period: 'Late Morning' },
    { id: 3, label: '14:00 – 17:00', period: 'Afternoon' },
    { id: 4, label: '17:00 – 20:00', period: 'Evening' },
  ]
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  const dayShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  useEffect(() => { loadInitialData() }, [])

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
      toast.error('Failed to load scheduling data')
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async (weekId) => {
    try {
      const response = await schedulingAPI.getSlotsByWeek(weekId)
      setSlots(response.data || [])
    } catch {
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
      setSaving(true)
      const response = await schedulingAPI.createWeek({ weekNumber: parseInt(weekNumber) })
      setWeeks([response.data, ...weeks])
      setCurrentWeek(response.data)
      setWeekNumber('')
      setShowWeekModal(false)
      setSlots([])
      toast.success('Week ' + response.data.weekNumber + ' created!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create week')
    } finally {
      setSaving(false)
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
      setFormData({ courseId: '', moduleId: '', trainerId: '', dayOfWeek: day, slotNumber: slotNum })
    }
    setShowSlotModal(true)
  }

  const handleSlotSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (selectedSlot) {
        await schedulingAPI.updateSlot(currentWeek.id, selectedSlot.id, formData)
        toast.success('Session updated!')
      } else {
        await schedulingAPI.createSlot(currentWeek.id, formData)
        toast.success('Session assigned!')
      }
      setShowSlotModal(false)
      fetchSlots(currentWeek.id)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this session?')) return
    try {
      await schedulingAPI.deleteSlot(slotId)
      setSlots(slots.filter(s => s.id !== slotId))
      setShowSlotModal(false)
      toast.success('Session deleted')
    } catch {
      toast.error('Failed to delete session')
    }
  }

  const getSlotForDayAndTime = (day, slotNum) =>
    slots.find(s => s.dayOfWeek === day && s.slotNumber === slotNum)

  const getModulesForCourse = () => {
    const course = courses.find(c => c.id === parseInt(formData.courseId))
    return course ? course.modules : []
  }

  const filledSlots = slots.length
  const totalSlots = days.length * timeSlots.length

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex bg-orange-50/30 min-h-screen">
        <Sidebar userRole="ADMIN" />
        <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Loading schedule…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar userRole="ADMIN" />

      <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} transition-all duration-300 min-w-0`}>
        <Header />

        <div className="flex-1 overflow-auto p-4 md:p-8">

          {/* ── Page Header ────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CalendarDays className="text-orange-600" size={20} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Schedule Management</h1>
              </div>
              <p className="text-gray-500 text-sm ml-13 pl-[52px]">Coordinate courses, trainers & sessions per week</p>
            </div>
            <button
              onClick={() => setShowWeekModal(true)}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 active:scale-95 transition-all font-semibold shadow-sm shadow-orange-200 whitespace-nowrap self-start sm:self-auto"
            >
              <Plus size={18} />
              New Week
            </button>
          </div>

          {/* ── Stats Row ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Current Week', value: currentWeek ? `Week ${currentWeek.weekNumber}` : '—', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Total Weeks', value: weeks.length, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Sessions Filled', value: filledSlots, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Open Slots', value: totalSlots - filledSlots, icon: LayoutGrid, color: 'text-violet-600', bg: 'bg-violet-50' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 flex items-center gap-3 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <stat.icon className={stat.color} size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium truncate">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Week Selector ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="shrink-0">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Active Week</p>
              <p className="text-base font-bold text-gray-900">
                {currentWeek ? `Week ${currentWeek.weekNumber}` : 'None selected'}
              </p>
            </div>
            <div className="h-px sm:h-8 sm:w-px bg-gray-100" />
            <div className="flex items-center gap-2 flex-wrap">
              {weeks.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No weeks yet — create one to begin</p>
              ) : (
                weeks.map(week => (
                  <button
                    key={week.id}
                    onClick={() => { setCurrentWeek(week); fetchSlots(week.id) }}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${currentWeek?.id === week.id
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                      }`}
                  >
                    W{week.weekNumber}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Mobile Day Navigator ───────────────────────────────────── */}
          <div className="flex md:hidden items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3 mb-4">
            <button
              onClick={() => setMobileDay(d => Math.max(0, d - 1))}
              disabled={mobileDay === 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5">
              {days.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMobileDay(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${mobileDay === i ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                >
                  {dayShort[i]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMobileDay(d => Math.min(days.length - 1, d + 1))}
              disabled={mobileDay === days.length - 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* ── Timetable ─────────────────────────────────────────────── */}
          {!currentWeek ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-orange-200 p-12 md:p-20 text-center">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="text-orange-400" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">No week selected</h3>
              <p className="text-gray-400 text-sm mb-6">Create a new week schedule to start assigning sessions</p>
              <button
                onClick={() => setShowWeekModal(true)}
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition font-semibold"
              >
                <Plus size={18} /> Create First Week
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* ── Desktop Table ───────────────────────────────── */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-500 to-amber-500">
                      <th className="px-5 py-4 text-left w-36">
                        <div className="flex items-center gap-2 text-white/90 font-semibold text-xs uppercase tracking-wider">
                          <Clock size={14} />
                          Time
                        </div>
                      </th>
                      {days.map((day, i) => (
                        <th key={day} className="px-4 py-4 text-center">
                          <p className="text-white font-bold text-xs uppercase tracking-wide">{dayShort[i]}</p>
                          <p className="text-white/60 text-[10px] font-medium mt-0.5">{day.slice(0, 3) + day.slice(3).toLowerCase()}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {timeSlots.map((time, rowIdx) => (
                      <tr key={time.id} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-orange-50/20'}>
                        <td className="px-5 py-4 border-r border-gray-100 w-36">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-8 bg-orange-400 rounded-full" />
                            <div>
                              <p className="text-xs font-bold text-gray-800">{time.label}</p>
                              <p className="text-[10px] text-gray-400 font-medium">{time.period}</p>
                            </div>
                          </div>
                        </td>
                        {days.map(day => {
                          const slot = getSlotForDayAndTime(day, time.id)
                          const color = getSlotColor(slot?.courseId)
                          return (
                            <td key={day} className="p-2.5 align-top">
                              {slot ? (
                                <button
                                  onClick={() => openSlotModal(day, time.id, slot)}
                                  className={`w-full text-left p-3 rounded-xl ${color.bg} border ${color.border} hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden`}
                                >
                                  <div className={`absolute left-0 top-0 h-full w-1 ${color.accent} rounded-l-xl`} />
                                  <p className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 ${color.text} pl-2 truncate`}>{slot.courseName}</p>
                                  <p className="text-xs font-bold text-gray-800 pl-2 line-clamp-2 leading-tight mb-1">{slot.moduleName}</p>
                                  <div className="flex items-center gap-1 pl-2">
                                    <User size={9} className="text-gray-400 shrink-0" />
                                    <span className="text-[9px] text-gray-500 font-medium truncate">{slot.trainerName}</span>
                                  </div>
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit size={12} className={color.text} />
                                  </div>
                                </button>
                              ) : (
                                <button
                                  onClick={() => openSlotModal(day, time.id)}
                                  className="w-full h-20 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-300 hover:border-orange-300 hover:text-orange-400 hover:bg-orange-50/50 transition-all group"
                                >
                                  <Plus size={20} className="group-hover:scale-110 transition-transform" />
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

              {/* ── Mobile View (single day) ────────────────────── */}
              <div className="block md:hidden">
                <div className="px-4 pt-4 pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-orange-600 text-sm uppercase tracking-wide">
                    {days[mobileDay]} • {dayShort[mobileDay]}
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {timeSlots.map(time => {
                    const slot = getSlotForDayAndTime(days[mobileDay], time.id)
                    const color = getSlotColor(slot?.courseId)
                    return (
                      <div key={time.id} className="p-4 flex gap-3 items-start">
                        <div className="shrink-0 text-right w-20">
                          <p className="text-[10px] font-bold text-gray-700">{time.label.split('–')[0].trim()}</p>
                          <p className="text-[9px] text-gray-400">{time.period}</p>
                        </div>
                        <div className="flex-1">
                          {slot ? (
                            <button
                              onClick={() => openSlotModal(days[mobileDay], time.id, slot)}
                              className={`w-full text-left px-3 py-2.5 rounded-xl ${color.bg} border ${color.border} relative overflow-hidden`}
                            >
                              <div className={`absolute left-0 top-0 h-full w-1 ${color.accent} rounded-l-xl`} />
                              <p className={`text-[9px] font-bold uppercase tracking-wide mb-0.5 ${color.text} pl-2 truncate`}>{slot.courseName}</p>
                              <p className="text-xs font-bold text-gray-800 pl-2">{slot.moduleName}</p>
                              <p className="text-[9px] text-gray-500 pl-2 mt-0.5">{slot.trainerName}</p>
                            </button>
                          ) : (
                            <button
                              onClick={() => openSlotModal(days[mobileDay], time.id)}
                              className="w-full h-14 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-300 hover:border-orange-300 hover:text-orange-400 hover:bg-orange-50/50 transition-all text-xs font-medium"
                            >
                              <Plus size={14} /> Add Session
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Legend ────────────────────────────────────────────────── */}
          {filledSlots > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Legend:</p>
              {[...new Set(slots.map(s => s.courseId))].map(cId => {
                const color = getSlotColor(cId)
                const name = slots.find(s => s.courseId === cId)?.courseName
                return (
                  <div key={cId} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${color.badge} text-[10px] font-bold`}>
                    <div className={`w-2 h-2 rounded-full ${color.accent}`} />
                    {name}
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Create Week Modal
      ════════════════════════════════════════════════════════════════ */}
      {showWeekModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Week</h3>
                <p className="text-orange-100 text-xs mt-0.5">Add a new training schedule week</p>
              </div>
              <button onClick={() => setShowWeekModal(false)} className="text-white/70 hover:text-white transition-colors p-1">
                <X size={22} />
              </button>
            </div>
            {/* Modal Body */}
            <form onSubmit={handleCreateWeek} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Week Number
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(e.target.value)}
                  placeholder="e.g. 1, 2, 3…"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all font-semibold text-gray-800 placeholder:text-gray-300"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeekModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create Week
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          Assign / Edit Slot Modal
      ════════════════════════════════════════════════════════════════ */}
      {showSlotModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {formData.dayOfWeek} • Slot {formData.slotNumber}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedSlot ? 'Edit Session' : 'Assign Session'}
                  </h3>
                  <p className="text-orange-100 text-xs mt-0.5">
                    Week {currentWeek?.weekNumber} • {timeSlots.find(t => t.id === formData.slotNumber)?.label}
                  </p>
                </div>
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="text-white/70 hover:text-white transition-colors p-1 mt-1"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSlotSubmit} className="flex-1 overflow-y-auto p-6 space-y-5" style={{ scrollbarWidth: 'none' }}>

              {/* Course */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <BookOpen size={12} /> Course
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value, moduleId: '' })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none font-semibold text-gray-800 transition-all"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Module */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <Layers size={12} /> Module
                </label>
                <select
                  required
                  disabled={!formData.courseId}
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none font-semibold text-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select Module</option>
                  {getModulesForCourse().map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                {formData.courseId && getModulesForCourse().length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={11} /> No modules found for this course
                  </p>
                )}
              </div>

              {/* Trainer */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  <User size={12} /> Trainer
                </label>
                <select
                  required
                  value={formData.trainerId}
                  onChange={(e) => setFormData({ ...formData, trainerId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none font-semibold text-gray-800 transition-all"
                >
                  <option value="">Select Trainer</option>
                  {trainers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}{t.specialization ? ` — ${t.specialization}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {selectedSlot && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(selectedSlot.id)}
                    className="w-12 h-11 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shrink-0"
                    title="Delete session"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm shadow-orange-200"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  {selectedSlot ? 'Update' : 'Assign'}
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
