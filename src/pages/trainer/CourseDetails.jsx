import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { courseAPI, userAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
    ArrowLeft, BookOpen, Clock, Users, FileText,
    Download, Trash2, Edit, Save, X, Plus, AlertCircle, Loader
} from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TrainerCourseDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isTrainer } = useAuth()
    const { isCollapsed } = useSidebar()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        if (!isTrainer) {
            navigate('/login')
            return
        }
        fetchCourseDetails()
    }, [id, isTrainer])

    const fetchCourseDetails = async () => {
        try {
            setLoading(true)
            const response = await courseAPI.getById(id)
            setCourse(response.data)
        } catch (err) {
            console.error('Error fetching course details:', err)
            setError('Course not found or unauthorized')
            toast.error('Failed to load course details')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadSyllabus = async () => {
        try {
            const response = await courseAPI.downloadSyllabus(id)
            const blob = new Blob([response.data], { type: response.headers['content-type'] })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            // Try to get filename from header or use default
            const contentDisposition = response.headers['content-disposition']
            let fileName = 'syllabus.pdf'
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/)
                if (fileNameMatch.length === 2) fileName = fileNameMatch[1]
            }
            link.setAttribute('download', fileName)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (error) {
            console.error('Error downloading syllabus:', error)
            toast.error('Could not download syllabus')
        }
    }

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar userRole="TRAINER" />
                <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <Loader className="animate-spin text-blue-600" size={48} />
                    </div>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar userRole="TRAINER" />
                <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                    <Header />
                    <div className="flex-1 p-8 text-center bg-white rounded-3xl m-8 shadow-sm">
                        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/trainer/courses')}
                            className="px-6 py-2 bg-gray-900 text-white rounded-xl"
                        >
                            Back to Institute Courses
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar userRole="TRAINER" />

            <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                <Header />

                <div className="flex-1 overflow-auto p-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4">
                        <button
                            onClick={() => navigate('/trainer/courses')}
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit font-medium"
                        >
                            <ArrowLeft size={20} />
                            Back to Institute Courses
                        </button>

                        <div className="flex items-center justify-between">
                            <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight">{course.name}</h1>
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border-2 ${course.syllabusFileName ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                    }`}>
                                    {course.syllabusFileName ? 'Syllabus Ready' : 'Incomplete'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Duration</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{course.duration} Hours</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText size={28} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Modules</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">{course.modules?.length || 0} Units</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 group hover:shadow-md transition-all">
                            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users size={28} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Students</p>
                                <p className="text-2xl font-black text-gray-900 tracking-tight">Active Group</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                        <div className="flex border-b border-gray-100 px-8 bg-gray-50/50">
                            {[
                                { id: 'overview', label: 'Course Overview', icon: BookOpen },
                                { id: 'syllabus', label: 'Syllabus & Modules', icon: FileText }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-8 py-5 text-sm font-black uppercase tracking-widest transition-all border-b-2 mt-1 ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600 bg-white rounded-t-2xl shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]'
                                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100/30'
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
                                    <section>
                                        <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-2 h-8 bg-blue-600"></div>
                                            Basic Description
                                        </h3>
                                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 leading-relaxed text-gray-600 italic">
                                            {course.description || 'No description available for this course.'}
                                        </div>
                                    </section>

                                    <section>
                                        <h3 className="text-xl font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-2 h-8 bg-indigo-600"></div>
                                            Teaching Team
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Primary Instructor</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold rounded-2xl">
                                                        {course.primaryTrainerName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 text-lg">{course.primaryTrainerName}</p>
                                                        <p className="text-xs text-gray-500 font-bold">Main Lecturer</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {activeTab === 'syllabus' && (
                                <div className="space-y-8">
                                    {/* Syllabus Document */}
                                    <div className="p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl text-white flex items-center justify-between shadow-xl">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                                                <Download size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black uppercase tracking-tight">Technical Syllabus</h4>
                                                <p className="text-gray-400 text-sm font-medium">
                                                    {course.syllabusFileName || 'Syllabus not uploaded yet'}
                                                </p>
                                            </div>
                                        </div>
                                        {course.syllabusFileName && (
                                            <button
                                                onClick={handleDownloadSyllabus}
                                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                                            >
                                                Download PDF
                                            </button>
                                        )}
                                    </div>

                                    {/* Modules List */}
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2 mb-6">
                                            <div className="w-2 h-8 bg-emerald-600"></div>
                                            Syllabus Units ({course.modules?.length || 0})
                                        </h3>

                                        {course.modules?.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {course.modules.map((module, idx) => (
                                                    <div key={module.id} className="p-6 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 transition-all group flex items-center gap-6 shadow-sm">
                                                        <div className="w-12 h-12 bg-gray-50 text-gray-400 font-black flex items-center justify-center rounded-2xl border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-gray-900 uppercase tracking-tight text-lg mb-1">{module.name}</h4>
                                                            <p className="text-gray-500 text-sm line-clamp-1">{module.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                                                            <p className="text-sm font-black text-blue-600">{module.duration || 0} Hours</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-16 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 font-bold">No modules defined for this course.</p>
                                            </div>
                                        )}
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

export default TrainerCourseDetails
