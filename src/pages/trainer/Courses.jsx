import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { courseAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
    BookOpen, Clock, Users, ArrowRight, Loader, AlertCircle,
    Search, Filter, LayoutGrid, List, Sparkles, GraduationCap,
    Calendar, ArrowLeft, BookCheck, Clock4
} from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion, AnimatePresence } from 'framer-motion'

const TrainerCourses = () => {
    const { user, isTrainer, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const { isPinned, isHovering } = useSidebar()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

    useEffect(() => {
        if (authLoading) return

        if (!isTrainer) {
            toast.error('Unauthorized access')
            navigate('/login')
            return
        }

        if (user?.id) {
            fetchTrainerCourses()
        }
    }, [isTrainer, user, authLoading])

    const fetchTrainerCourses = async () => {
        try {
            setLoading(true)
            const response = await courseAPI.getAll()
            setCourses(response.data || [])
        } catch (err) {
            console.error('Error fetching courses:', err)
            setError('Failed to load institute courses')
            toast.error('Failed to load curriculum library')
        } finally {
            setLoading(false)
        }
    }

    const filteredCourses = useMemo(() => {
        return courses.filter(course =>
            course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [courses, searchTerm])

    // Stats calculation
    const totalHours = useMemo(() => courses.reduce((acc, curr) => acc + (parseInt(curr.duration) || 0), 0), [courses])
    const totalModules = useMemo(() => courses.reduce((acc, curr) => acc + (curr.modules?.length || 0), 0), [courses])

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative"
                >
                    <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                    <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600" size={20} />
                </motion.div>
                <p className="mt-4 text-gray-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Accessing Curriculum Library...</p>
            </div>
        )
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
            <Sidebar userRole="TRAINER" />

            <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} transition-all duration-300 overflow-hidden`}>
                <Header />

                <main className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
                    {/* Page Header */}
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                        >
                            <button
                                onClick={() => navigate('/trainer')}
                                className="flex items-center gap-2 text-gray-400 hover:text-orange-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 transition-colors group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                DASHBOARD CONTROL
                            </button>
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                                Institute Courses
                                <Sparkles className="text-orange-500" size={24} />
                            </h1>
                            <p className="text-gray-500 font-medium mt-1">Explore the complete professional training curriculum</p>
                        </motion.div>

                        {/* Quick Stats Grid */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                        >
                            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 min-w-[160px]">
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <BookCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Courses</p>
                                    <p className="text-xl font-black text-gray-900">{courses.length}</p>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 min-w-[160px]">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Clock4 size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Training Hours</p>
                                    <p className="text-xl font-black text-gray-900">{totalHours}</p>
                                </div>
                            </div>
                            <div className="hidden sm:flex bg-white p-4 rounded-3xl shadow-sm border border-gray-100 items-center gap-4 min-w-[160px]">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <LayoutGrid size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Modules</p>
                                    <p className="text-xl font-black text-gray-900">{totalModules}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Controls Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row items-center gap-4"
                    >
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type="text"
                                placeholder="Search by course name, technology or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-6 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-orange-500/10 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shrink-0">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </motion.div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] flex items-center gap-4 mb-10">
                            <AlertCircle size={24} />
                            <div>
                                <p className="font-black uppercase tracking-widest text-[10px]">Library Error</p>
                                <p className="font-bold text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Courses Grid/List */}
                    <AnimatePresence mode="wait">
                        {filteredCourses.length > 0 ? (
                            <motion.div
                                key={viewMode + searchTerm}
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className={viewMode === 'grid'
                                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8"
                                    : "flex flex-col gap-4"
                                }
                            >
                                {filteredCourses.map((course) => (
                                    <motion.div
                                        key={course.id}
                                        variants={itemVariants}
                                        className={`group bg-white rounded-[2.5rem] border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-200/20 overflow-hidden flex ${viewMode === 'list' ? 'flex-row items-center p-4' : 'flex-col'
                                            }`}
                                    >
                                        {viewMode === 'grid' && (
                                            <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-orange-600 to-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                        )}

                                        <div className={`p-8 flex flex-col h-full ${viewMode === 'list' ? 'flex-row items-center w-full p-6' : ''}`}>
                                            <div className={`flex items-center justify-between mb-8 ${viewMode === 'list' ? 'mb-0 mr-12' : ''}`}>
                                                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-[1.5rem] flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110 transition-all duration-500 shadow-inner group-hover:shadow-lg group-hover:shadow-orange-200">
                                                    <GraduationCap size={28} />
                                                </div>
                                                {viewMode === 'grid' && (
                                                    <div className="text-right">
                                                        <span className="block text-[10px] font-black text-orange-600 uppercase tracking-widest opacity-60">Program ID</span>
                                                        <span className="text-xs font-black text-gray-900 uppercase">#{course.id.toString().padStart(4, '0')}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-wider">Curriculum</span>
                                                    {course.modules?.length > 10 && (
                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider">Extensive</span>
                                                    )}
                                                </div>
                                                <h3 className={`text-2xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors uppercase tracking-tight line-clamp-1`}>
                                                    {course.name}
                                                </h3>
                                                <p className="text-gray-500 text-sm mb-8 line-clamp-2 leading-relaxed font-semibold italic">
                                                    {course.description || 'Comprehensive training program designed for professional developers and aspirants.'}
                                                </p>

                                                <div className={`grid grid-cols-2 gap-4 ${viewMode === 'list' ? 'mb-0 mr-8 min-w-[300px]' : 'mb-8'}`}>
                                                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 group-hover:border-orange-100 group-hover:bg-orange-50/30 transition-colors">
                                                        <Clock size={16} className="text-orange-500" />
                                                        <span className="text-xs font-black uppercase tracking-tighter">{course.duration} HR SESSION</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3.5 rounded-2xl border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/30 transition-colors">
                                                        <Users size={16} className="text-blue-500" />
                                                        <span className="text-xs font-black uppercase tracking-tighter">{course.modules?.length || 0} MODULES</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => navigate(`/trainer/courses/${course.id}`)}
                                                className={`${viewMode === 'list' ? 'w-48 ml-auto' : 'w-full'} py-4 bg-gray-900 text-white rounded-[1.5rem] transition-all font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 group/btn shadow-xl shadow-gray-200 hover:bg-orange-600 hover:shadow-orange-200/50 active:scale-[0.98] border border-transparent`}
                                            >
                                                View Modules
                                                <ArrowRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-[3rem] py-24 px-8 text-center border border-gray-100 shadow-xl flex flex-col items-center"
                            >
                                <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-10 shadow-inner">
                                    <BookOpen size={48} />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-3 uppercase tracking-tight">No Matches Found</h2>
                                <p className="text-gray-500 font-bold max-w-sm mx-auto mb-10">
                                    {searchTerm ? `We couldn't find any courses matching "${searchTerm}". Try a different search term.` : "The institute curriculum library is currently empty."}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg"
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="light"
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </div>
    )
}

export default TrainerCourses

