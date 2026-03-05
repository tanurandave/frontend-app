import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { courseAPI, schedulingAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'
import { ArrowLeft, BookOpen, Users, Calendar, AlertCircle, Loader } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const TrainerModules = () => {
    const { user, isTrainer, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const { isPinned, isHovering } = useSidebar()
    const [modules, setModules] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const showToast = {
        success: (msg) => toast.success(msg),
        error: (msg) => toast.error(msg),
        info: (msg) => toast.info(msg)
    }

    useEffect(() => {
        if (authLoading) return

        if (!isTrainer) {
            showToast.error('Unauthorized access')
            navigate('/login')
            return
        }
        if (user?.id) {
            fetchModules()
        } else {
            setLoading(false)
        }
    }, [isTrainer, user, authLoading])

    const fetchModules = async () => {
        try {
            setLoading(true)
            setError(null)

            if (!user?.id) {
                setLoading(false)
                return
            }

            // Get all slots for this trainer to find assigned modules
            const slotsRes = await schedulingAPI.getSlotsByTrainer(user.id)
            const slots = slotsRes.data || []

            // Get unique module IDs from slots
            const moduleIds = [...new Set(slots.filter(s => s.moduleId).map(s => s.moduleId))]

            // Since we don't have a direct "get module by id" that returns rich info easily without course 
            // let's just get all courses and extract the modules if they match our IDs
            const coursesRes = await courseAPI.getAll()
            const allCourses = coursesRes.data || []

            const assignedModules = []
            allCourses.forEach(course => {
                if (course.modules) {
                    course.modules.forEach(module => {
                        if (moduleIds.includes(module.id)) {
                            assignedModules.push({
                                ...module,
                                courseName: course.name,
                                courseId: course.id,
                                // Additional info from slots if needed
                                slots: slots.filter(s => s.moduleId === module.id).length
                            })
                        }
                    })
                }
            })

            setModules(assignedModules)
        } catch (err) {
            console.error('Error fetching modules:', err)
            setError(err.response?.data?.message || 'Failed to load modules')
            showToast.error('Failed to load modules')
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader className="animate-spin" size={48} color="#3b82f6" />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar userRole="TRAINER" />

            <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} overflow-hidden transition-all duration-300`}>
                {/* Top Navigation */}
                <div className="bg-white border-b border-gray-200 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/trainer')}
                                className="text-gray-500 hover:text-gray-700 transition"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Assigned Modules</h1>
                                <p className="text-gray-500 mt-1">Manage your teaching modules</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-8">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="text-red-600" size={20} />
                            <span className="text-red-800">{error}</span>
                        </div>
                    )}

                    {/* Modules Grid */}
                    {modules.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <BookOpen className="text-blue-600" size={20} />
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            Active
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{module.name}</h3>
                                    <p className="text-xs text-blue-600 font-medium mb-2">{module.courseName}</p>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{module.description}</p>

                                    <div className="space-y-3 mb-6 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={16} />
                                            <span>Duration: {module.duration || 'N/A'} Hours</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={16} />
                                            <span>Sessions: {module.slots || 0} slots assigned</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/trainer/schedule?module=${module.id}`)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                        >
                                            View Schedule
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow p-12 text-center">
                            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No modules assigned</h3>
                            <p className="text-gray-500">
                                You don't have any modules assigned in the schedule yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    )
}

export default TrainerModules
