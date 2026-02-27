import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { schedulingAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import { ArrowLeft, Calendar, Clock, MapPin, Users, AlertCircle, Loader, BookOpen, ChevronRight, Edit3, Save, X, Plus, FilePlus, BookCopy } from 'lucide-react'
import ResourceUploadModal from '../../components/ResourceUploadModal'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
      setError('Failed to load teaching schedule')
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
      toast.success('Session notes archived')
    } catch (err) {
      toast.error('Failed to save notes')
    } finally {
      setNoteLoading(false)
    }
  }

  const filteredSchedule = selectedDay === 'all'
    ? schedule
    : schedule.filter(slot => slot.dayOfWeek?.toUpperCase() === selectedDay.toUpperCase())

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA]">
      <Sidebar userRole="TRAINER" />

      <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} overflow-hidden transition-all duration-300`}>
        <Header />

        <main className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="flex justify-between items-end mb-10">
            <div>
              <button
                onClick={() => navigate('/trainer')}
                className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-black uppercase tracking-widest text-[10px] mb-4 transition-colors"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Teaching Schedule</h1>
              <p className="text-gray-500 font-medium mt-1">Manage your weekly session log and student feedback</p>
            </div>

            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto gap-1">
              <button
                onClick={() => setSelectedDay('all')}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${selectedDay === 'all' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:bg-gray-50'
                  }`}
              >
                Full Week
              </button>
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${selectedDay === day ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-50 border border-red-100 rounded-[2rem] p-6 flex items-center gap-4">
              <AlertCircle className="text-red-600" size={24} />
              <span className="text-red-900 font-bold">{error}</span>
            </div>
          )}

          {filteredSchedule.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {filteredSchedule.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-orange-200/20 transition-all duration-500 p-8 group border-l-[12px] border-l-orange-600"
                >
                  <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-8">
                    <div className="flex items-center gap-8">
                      <div className="w-20 h-20 bg-gray-50 rounded- [2rem] flex flex-col items-center justify-center border border-gray-100 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                        <p className="text-[10px] font-black uppercase opacity-60">Slot</p>
                        <p className="text-3xl font-black mt-1">#{slot.slotNumber}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {slot.dayOfWeek}
                          </span>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1.5">
                            <Clock size={14} className="text-blue-500" />
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-1 group-hover:text-orange-600 transition-colors">
                          {slot.moduleName || 'Session Title Not Set'}
                        </h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{slot.courseName}</p>
                      </div>
                    </div>

                    <div className="flex-1 max-w-xl">
                      <div className="bg-gray-50/50 rounded-[2rem] p-6 border border-gray-100 relative group/notes mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <BookOpen size={14} className="text-indigo-500" />
                            Session Log
                          </h4>
                          {editingSlotId === slot.id ? (
                            <div className="flex gap-2">
                              <button onClick={() => setEditingSlotId(null)} className="text-[10px] font-black uppercase text-gray-400 hover:text-gray-600">Cancel</button>
                              <button onClick={() => handleUpdateNotes(slot.id)} disabled={noteLoading} className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-700">Save Log</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingSlotId(slot.id); setTempNotes(slot.notes || ''); }}
                              className="opacity-0 group-hover/notes:opacity-100 transition-opacity bg-white p-2 rounded-lg text-orange-600 border border-orange-100 shadow-sm"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>

                        {editingSlotId === slot.id ? (
                          <textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            className="w-full bg-white border border-orange-200 rounded-xl p-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 min-h-[100px] resize-none"
                            placeholder="Record attendance, topics covered, or student feedback..."
                          />
                        ) : (
                          <div className="text-sm text-gray-600 font-medium leading-relaxed italic">
                            {slot.notes ? slot.notes : <span className="text-gray-300">No session notes recorded yet. Click edit to add documentation.</span>}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons for Resources */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => setResourceModal({ isOpen: true, type: 'assignment', slot })}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-orange-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
                        >
                          <FilePlus size={14} /> Add Assignment
                        </button>
                        <button
                          onClick={() => setResourceModal({ isOpen: true, type: 'material', slot })}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-blue-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                        >
                          <BookCopy size={14} /> Upload Notes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm">
              <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar size={48} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No Sessions Identified</h2>
              <p className="text-gray-500 font-medium max-w-sm mx-auto">
                No classes have been assigned to you for {selectedDay === 'all' ? 'this week' : selectedDay.toLowerCase()}.
              </p>
            </div>
          )}
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

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default TrainerSchedule
