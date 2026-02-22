import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
    User, Mail, Phone, Calendar, ArrowLeft, BookOpen, Clock,
    FileText, Shield, Briefcase, Award, CheckCircle, X, Star, Link as LinkIcon
} from 'lucide-react'
import { userAPI, courseAPI, schedulingAPI, resourceAPI } from '../../api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Download, ClipboardList } from 'lucide-react'

const TrainerDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isCollapsed } = useSidebar()

    const [trainer, setTrainer] = useState(null)
    const [assignedCourses, setAssignedCourses] = useState([])
    const [scheduleSlots, setScheduleSlots] = useState([])
    const [assignments, setAssignments] = useState([])
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        fetchTrainerDetails()
    }, [id])

    const fetchTrainerDetails = async () => {
        try {
            setLoading(true)
            const [userRes, courseRes, slotRes, assRes, matRes] = await Promise.all([
                userAPI.getById(id),
                courseAPI.getByTrainer(id),
                schedulingAPI.getSlotsByTrainer(id),
                resourceAPI.getAssignmentsByTrainer(id),
                resourceAPI.getMaterialsByTrainer(id)
            ])

            setTrainer(userRes.data)
            setAssignedCourses(courseRes.data || [])
            setScheduleSlots(slotRes.data || [])
            setAssignments(assRes.data || [])
            setMaterials(matRes.data || [])
        } catch (error) {
            console.error('Error fetching trainer details:', error)
            toast.error('Failed to load trainer details')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar userRole="ADMIN" />
                <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Loading details...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!trainer) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar userRole="ADMIN" />
                <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                    <Header />
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trainer Not Found</h2>
                            <p className="text-gray-500 mb-6">The trainer you are looking for does not exist or has been removed.</p>
                            <button
                                onClick={() => navigate('/admin/trainers')}
                                className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium"
                            >
                                Back to Trainers
                            </button>
                        </div>
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
                    {/* Back Button & Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigate('/admin/trainers')}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Back to Trainers</span>
                            </button>

                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg shadow-green-500/20 ring-4 ring-white">
                                    {trainer.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl font-bold text-gray-900">{trainer.name}</h1>
                                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100 uppercase tracking-wider">
                                            Trainer
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Mail size={16} />
                                            <span className="text-sm">{trainer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Award size={16} />
                                            <span className="text-sm font-medium">{trainer.specialization || 'General Instructor'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar size={16} />
                                            <span className="text-sm">Joined {new Date(trainer.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Courses Leading</p>
                                <p className="text-2xl font-bold text-gray-900">{assignedCourses.length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Experience</p>
                                <p className="text-2xl font-bold text-gray-900">{trainer.experience || '0'} Years</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Current Slots</p>
                                <p className="text-2xl font-bold text-gray-900">{scheduleSlots.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                        <div className="flex border-b border-gray-100 px-6 overflow-x-auto bg-gray-50/50">
                            {[
                                { id: 'overview', label: 'Professional Profile', icon: User },
                                { id: 'courses', label: 'Assigned Courses', icon: BookOpen },
                                { id: 'schedule', label: 'Teaching Schedule', icon: Calendar },
                                { id: 'resources', label: 'Trainer Resources', icon: ClipboardList }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap mt-1 ${activeTab === tab.id
                                        ? 'border-green-500 text-green-600 bg-white rounded-t-xl shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-auto p-8">
                            {activeTab === 'overview' && (
                                <div className="max-w-4xl space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <User size={20} className="text-green-500" />
                                                Personal Details
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Full Name</p>
                                                    <p className="text-gray-900 font-medium">{trainer.name}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email Address</p>
                                                    <p className="text-gray-900 font-medium">{trainer.email}</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                                                    <p className="text-gray-900 font-medium">{trainer.phone || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                <Award size={20} className="text-green-500" />
                                                Professional Info
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Specialization</p>
                                                        <p className="text-gray-900 font-medium">{trainer.specialization || 'Not specified'}</p>
                                                    </div>
                                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                                        <Star size={20} fill="currentColor" />
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Experience</p>
                                                    <p className="text-gray-900 font-medium">{trainer.experience || '0'} Years in andragogy</p>
                                                </div>
                                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Academic Qualification</p>
                                                    <p className="text-gray-900 font-medium">{trainer.qualification || 'Not provided'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText size={20} className="text-green-500" />
                                            Professional Bio
                                        </h3>
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 leading-relaxed text-gray-600">
                                            {trainer.bio || 'This trainer has not shared their professional biography yet.'}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Joined Date</p>
                                                <p className="text-sm font-medium text-gray-900">{new Date(trainer.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Last Profile Update</p>
                                                <p className="text-sm font-medium text-gray-900">{trainer.updatedAt ? new Date(trainer.updatedAt).toLocaleDateString() : 'Original'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/admin/trainers?edit=${trainer.id}`)}
                                            className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition text-sm font-bold uppercase tracking-widest"
                                        >
                                            Edit Trainer Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'courses' && (
                                <div className="space-y-6">
                                    {assignedCourses.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {assignedCourses.map((course) => (
                                                <div key={course.id} className="group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-1"></div>
                                                    <div className="p-6 flex-1 flex flex-col">
                                                        <h4 className="font-black text-gray-900 group-hover:text-green-600 transition-colors uppercase tracking-tight text-lg mb-2">
                                                            {course.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                                                            {course.description || 'No description provided for this course.'}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                            <div className="flex items-center gap-1 text-gray-400">
                                                                <Clock size={14} />
                                                                <span className="text-xs font-bold uppercase">{course.duration} Hours</span>
                                                            </div>
                                                            <button
                                                                onClick={() => navigate(`/admin/courses/${course.id}`)}
                                                                className="text-green-600 hover:text-green-700 font-bold text-xs uppercase flex items-center gap-1"
                                                            >
                                                                Full Details
                                                                <LinkIcon size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                <BookOpen size={32} />
                                            </div>
                                            <h4 className="text-gray-900 font-bold mb-1">No Primary Courses</h4>
                                            <p className="text-gray-500 text-sm">This trainer is not currently the primary instructor for any courses.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'schedule' && (
                                <div className="space-y-6">
                                    {scheduleSlots.length > 0 ? (
                                        <div className="overflow-hidden bg-white border border-gray-100 rounded-3xl shadow-sm">
                                            <table className="w-full">
                                                <thead className="bg-gray-50/80 border-b border-gray-100">
                                                    <tr>
                                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Session Title</th>
                                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Day</th>
                                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Time Slot</th>
                                                        <th className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-widest">Course Context</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {scheduleSlots.map((slot) => (
                                                        <tr key={slot.id} className="hover:bg-gray-50/50 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <span className="font-bold text-gray-900 group-hover:text-green-600 transition-colors uppercase text-xs">{slot.slotName}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">{slot.dayOfWeek}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                                                    <div className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{slot.startTime}</div>
                                                                    <span>-</span>
                                                                    <div className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">{slot.endTime}</div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-xs text-gray-900 font-bold uppercase truncate max-w-[150px]">{slot.courseName}</p>
                                                                <p className="text-[10px] text-gray-500 italic truncate max-w-[150px]">{slot.moduleName}</p>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                <Calendar size={32} />
                                            </div>
                                            <h4 className="text-gray-900 font-bold mb-1">Schedule Clear</h4>
                                            <p className="text-gray-500 text-sm">No teaching slots have been assigned to this trainer yet.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Assignments Column */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                                <FileText size={20} className="text-blue-500" />
                                                Recent Assignments
                                            </h3>
                                            <div className="space-y-4">
                                                {assignments.length > 0 ? (
                                                    assignments.map(ass => (
                                                        <div key={ass.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 uppercase text-sm mb-1">{ass.title}</h4>
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{ass.courseName}</p>
                                                                </div>
                                                                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-blue-600 transition-colors">
                                                                    <Download size={16} />
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-3">
                                                                <span className="flex items-center gap-1"><Clock size={12} strokeWidth={3} /> {new Date(ass.dueDate).toLocaleDateString()}</span>
                                                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-tighter">Active</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                                                        <p className="text-xs font-bold uppercase tracking-widest">No Assignments Yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Materials Column */}
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                                <BookOpen size={20} className="text-emerald-500" />
                                                Study Materials
                                            </h3>
                                            <div className="space-y-4">
                                                {materials.length > 0 ? (
                                                    materials.map(mat => (
                                                        <div key={mat.id} className="p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 uppercase text-sm mb-1">{mat.title}</h4>
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{mat.courseName}</p>
                                                                </div>
                                                                <button className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-emerald-600 transition-colors">
                                                                    <Download size={16} />
                                                                </button>
                                                            </div>
                                                            <div className="text-[10px] text-gray-400 font-bold border-t border-gray-50 pt-3">
                                                                Shared: {new Date(mat.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
                                                        <p className="text-xs font-bold uppercase tracking-widest">No Materials Yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
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

export default TrainerDetails
