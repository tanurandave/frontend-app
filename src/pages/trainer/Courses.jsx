import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { courseAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import { BookOpen, Clock, Users, ArrowRight, Loader, AlertCircle } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TrainerCourses = () => {
    const { user, isTrainer, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const { isPinned, isHovering } = useSidebar()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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
            toast.error('Failed to load courses')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar userRole="TRAINER" />
                <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <Loader className="animate-spin text-blue-600" size={48} />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar userRole="TRAINER" />

            <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
                <Header />

                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Institute Courses</h1>
                        <p className="text-gray-500 font-medium mt-1">Explore and review the full curriculum library</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-5 rounded-3xl flex items-center gap-4 mb-8">
                            <AlertCircle size={24} />
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    {courses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {courses.map((course) => (
                                <div
                                    key={course.id}
                                    className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-orange-200/20 transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col"
                                >
                                    {/* Course Banner */}
                                    <div className="h-3 w-full bg-gradient-to-r from-orange-400 via-orange-600 to-orange-800"></div>

                                    <div className="p-8 flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all">
                                                <BookOpen size={24} />
                                            </div>
                                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] bg-orange-50 px-4 py-1.5 rounded-full">
                                                Curriculum
                                            </span>
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-orange-600 transition-colors uppercase tracking-tight line-clamp-1">
                                            {course.name}
                                        </h3>

                                        <p className="text-gray-500 text-sm mb-8 line-clamp-2 leading-relaxed font-medium flex-1">
                                            {course.description || 'No detailed description provided for this academic program.'}
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                <Clock size={16} className="text-orange-500" />
                                                <span className="text-xs font-bold">{course.duration} Hours</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                <Users size={16} className="text-blue-500" />
                                                <span className="text-xs font-bold">{course.modules?.length || 0} Modules</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => navigate(`/trainer/courses/${course.id}`)}
                                            className="w-full py-4 bg-gray-900 text-white rounded-[1.25rem] hover:bg-orange-600 transition-all font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 group/btn shadow-xl shadow-gray-200 hover:shadow-orange-200"
                                        >
                                            View Program
                                            <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-24 text-center border-2 border-dashed border-gray-100 shadow-sm">
                            <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">No Courses Catalogued</h2>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                The institute curriculum library is currently empty. Check back soon for updates.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    )
}

export default TrainerCourses
