import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { schedulingAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, AlertCircle,
  Loader, BookOpen, ChevronRight, Edit3, Save, X, Plus,
  FilePlus, BookCopy, MoreHorizontal, CheckCircle2,
  Clock4, CalendarDays, GraduationCap
} from 'lucide-react'
import ResourceUploadModal from '../../components/ResourceUploadModal'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion, AnimatePresence } from 'framer-motion'

const TrainerSchedule = () => {
  const { user, isTrainer, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { isPinned, isHovering } = useSidebar()
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDay, setSelectedDay] = useState('all')
  const [editingSlotId, setEditingSlotId] = useState(null)
  const [tempNotes, setTempNotes] = useState('')
  const [noteLoading, setNoteLoading] = useState(false)
  const [resourceModal, setResourceModal] = useState({ isOpen: false, type: 'assignment', slot: null })

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  useEffect(() => {
    if (authLoading) return
    if (!isTrainer) {
      navigate('/login')
      return
    }
    if (user?.id) fetchSchedule()
  }, [isTrainer, user, authLoading])

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      const res = await schedulingAPI.getSlotsByTrainer(user.id)
      const slots = res.data || []
      const sorted = slots.sort((a, b) => {
        const dayOrder = days.map(d => d.toUpperCase()).indexOf(a.dayOfWeek?.toUpperCase()) -
          days.map(d => d.toUpperCase()).indexOf(b.dayOfWeek?.toUpperCase())
        if (dayOrder !== 0) return dayOrder
        return (a.startTime || '').localeCompare(b.startTime || '')
      })
      setSchedule(sorted)
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setError('Failed to load teaching schedule. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotes = async (slotId) => {
    try {
      setNoteLoading(true)
      await schedulingAPI.updateSlotNotes(slotId, tempNotes)
      setSchedule(prev => prev.map(slot =>
        slot.id === slotId ? { ...slot, notes: tempNotes } : slot
      ))
      setEditingSlotId(null)
      toast.success('Session notes archived successfully')
    } catch (err) {
      toast.error('Failed to save notes')
    } finally {
      setNoteLoading(false)
    }
  }

  const filteredSchedule = selectedDay === 'all'
    ? schedule
    : schedule.filter(slot => slot.dayOfWeek?.toUpperCase() === selectedDay.toUpperCase())

  // Calculate statistics
  const totalSlots = schedule.length
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const todaySlots = schedule.filter(slot => slot.dayOfWeek?.toUpperCase() === today.toUpperCase()).length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
          <Calendar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600" size={20} />
        </motion.div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading your schedule...</p>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      <Sidebar userRole="TRAINER" />

      <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} overflow-hidden transition-all duration-300`}>
        <Header />

        <main className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
          {/* SEO Header - Hidden from visual but present for crawlers/screen readers if needed */}
          <h1 className="sr-only">Trainer Teaching Schedule - Nexanova Training Hub</h1>

          {/* Breadcrumb & Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <button
                onClick={() => navigate('/trainer')}
                className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-semibold text-xs mb-3 transition-colors group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                BACK TO DASHBOARD
              </button>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Teaching Schedule</h2>
              <p className="text-gray-500 text-sm mt-1">Manage your weekly sessions, student resources and logs</p>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weekly Slots</p>
                  <p className="text-xl font-bold text-gray-900">{totalSlots}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Clock4 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Today's Sessions</p>
                  <p className="text-xl font-bold text-gray-900">{todaySlots}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Day Filter */}
          <section className="mb-10 overflow-x-auto">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-max mx-auto md:mx-0">
              <button
                onClick={() => setSelectedDay('all')}
                className={`relative px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${selectedDay === 'all' ? 'text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                {selectedDay === 'all' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gray-900 rounded-xl"
                  />
                )}
                <span className="relative z-10">All Days</span>
              </button>
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${selectedDay === day ? 'text-white' : 'text-gray-400 hover:text-gray-900'
                    }`}
                >
                  {selectedDay === day && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-orange-600 rounded-xl shadow-lg shadow-orange-200"
                    />
                  )}
                  <span className="relative z-10">{day.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </section>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600"
            >
              <AlertCircle size={20} />
              <span className="font-semibold">{error}</span>
            </motion.div>
          )}

          {/* Schedule List */}
          <AnimatePresence mode="wait">
            {filteredSchedule.length > 0 ? (
              <motion.div
                key={selectedDay}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
              >
                {filteredSchedule.map((slot, idx) => (
                  <motion.div
                    key={slot.id || idx}
                    variants={itemVariants}
                    className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 p-6 md:p-8 flex flex-col xl:flex-row gap-8 items-start xl:items-center group relative overflow-hidden"
                  >
                    {/* Decorative side accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 group-hover:w-2.5 transition-all duration-300"></div>

                    {/* Left: Time & Slot Info */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="w-20 h-20 bg-gray-50 rounded-2xl flex flex-col items-center justify-center border border-gray-100 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                        <p className="text-[10px] font-bold uppercase opacity-60">Slot</p>
                        <p className="text-3xl font-black">{slot.slotNumber}</p>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${slot.dayOfWeek === today ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {slot.dayOfWeek}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                            <Clock size={14} className="text-blue-500" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {slot.moduleName || 'Untitled Session'}
                        </h3>
                        <p className="text-sm font-medium text-gray-400 mt-1 flex items-center gap-1.5">
                          <GraduationCap size={14} />
                          {slot.courseName}
                        </p>
                      </div>
                    </div>

                    {/* Center: Session Log */}
                    <div className="flex-1 w-full max-w-2xl bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50 relative group/notes">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                          <BookOpen size={14} className="text-indigo-500" />
                          Session Log & Notes
                        </h4>
                        <div className="flex items-center gap-2">
                          {editingSlotId === slot.id ? (
                            <>
                              <button
                                onClick={() => setEditingSlotId(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => handleUpdateNotes(slot.id)}
                                disabled={noteLoading}
                                className="p-1.5 text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
                                title="Save Log"
                              >
                                {noteLoading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => { setEditingSlotId(slot.id); setTempNotes(slot.notes || ''); }}
                              className="p-2 text-gray-400 hover:text-orange-600 bg-white border border-gray-100 rounded-lg shadow-sm transition-all hover:scale-105"
                              title="Edit Log"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {editingSlotId === slot.id ? (
                        <textarea
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="w-full bg-white border border-orange-200 rounded-xl p-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 min-h-[100px] resize-none transition-all shadow-inner"
                          placeholder="Record attendance, topics covered, or student feedback..."
                          autoFocus
                        />
                      ) : (
                        <div className="text-sm text-gray-600 font-medium leading-relaxed">
                          {slot.notes ? (
                            <div className="flex gap-2">
                              <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                              <span>{slot.notes}</span>
                            </div>
                          ) : (
                            <span className="text-gray-300 italic flex items-center gap-2">
                              <AlertCircle size={14} />
                              No session notes recorded yet.
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Actions */}
                    <div className="flex flex-row xl:flex-col gap-3 w-full xl:w-48 shrink-0">
                      <button
                        onClick={() => setResourceModal({ isOpen: true, type: 'assignment', slot })}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-orange-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-orange-600 hover:bg-orange-50 hover:shadow-md transition-all active:scale-95"
                      >
                        <FilePlus size={16} />
                        <span className="xl:hidden">Assignment</span>
                        <span className="hidden xl:inline">Assignment</span>
                      </button>
                      <button
                        onClick={() => setResourceModal({ isOpen: true, type: 'material', slot })}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-blue-100 rounded-xl text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-50 hover:shadow-md transition-all active:scale-95"
                      >
                        <BookCopy size={16} />
                        <span className="xl:hidden">Materials</span>
                        <span className="hidden xl:inline">Materials</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-16 md:p-24 text-center border border-gray-100 shadow-xl flex flex-col items-center"
              >
                <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <Calendar size={48} />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No Sessions Found</h3>
                <p className="text-gray-500 font-medium max-w-xs mx-auto mb-8">
                  You don't have any classes scheduled for {selectedDay === 'all' ? 'this week' : selectedDay}.
                </p>
                <button
                  onClick={() => setSelectedDay('all')}
                  className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                >
                  View Full Week
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ResourceUploadModal
        isOpen={resourceModal.isOpen}
        onClose={() => setResourceModal({ ...resourceModal, isOpen: false })}
        slot={resourceModal.slot}
        type={resourceModal.type}
        trainerId={user?.id}
        onUploadSuccess={() => fetchSchedule()}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default TrainerSchedule

