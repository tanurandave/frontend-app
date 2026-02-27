import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, Clock, User, Layers, CheckCircle, Search, Play, FileText, Download } from 'lucide-react'
import { courseAPI, enrollmentAPI } from '../../api'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const ViewCourses = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { isPinned, isHovering } = useSidebar()
    const [courses, setCourses] = useState([])
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [requestingCourse, setRequestingCourse] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        if (user?.id) {
            fetchData()
        }
    }, [user?.id])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [coursesRes, enrollmentsRes] = await Promise.all([
                courseAPI.getAll(),
                enrollmentAPI.getByStudent(user.id)
            ])
            setCourses(coursesRes.data)
            setEnrollments(enrollmentsRes.data)
        } catch (error) {
            console.error('Error fetching courses:', error)
            toast.error('Failed to load courses')
        } finally {
            setLoading(false)
        }
    }

    const handleRequestEnrollment = async (courseId) => {
        // Pre-check: prevent duplicate enrollment
        const existingStatus = getEnrollmentStatus(courseId)
        if (existingStatus === 'APPROVED') {
            toast.warning('You are already enrolled in this course!')
            return
        }
        if (existingStatus === 'PENDING') {
            toast.info('Your enrollment request is already pending.')
            return
        }

        try {
            setRequestingCourse(courseId)
            await enrollmentAPI.request({ studentId: user.id, courseId })
            toast.success('Enrollment request sent successfully!')
            // Refresh enrollments
            const enrollmentsRes = await enrollmentAPI.getByStudent(user.id)
            setEnrollments(enrollmentsRes.data)
        } catch (error) {
            console.error("Failed to request enrollment", error)
            const errorMsg = error.response?.data?.message || "Failed to request enrollment"
            if (errorMsg?.toLowerCase().includes('already enrolled') || errorMsg?.toLowerCase().includes('request pending')) {
                toast.warning('You are already enrolled in this course!')
            } else {
                toast.error(errorMsg)
            }
        } finally {
            setRequestingCourse(null)
        }
    }

    const getEnrollmentStatus = (courseId) => {
        const enrollment = enrollments.find(e => e.courseId === courseId)
        return enrollment ? enrollment.status : null
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-50 text-green-700 border-green-200'
            case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
            default: return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const filteredCourses = courses.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className={`flex-1 ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} p-8 transition-all duration-300`}>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
                        <p className="text-gray-500 mt-1">Explore and enroll in new learning paths</p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                        />
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="text-gray-500 mt-4">Loading available courses...</p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <BookOpen size={64} className="text-gray-200 mb-4" />
                        <p className="text-xl font-medium text-gray-500">No courses found</p>
                        {searchTerm && <p className="text-gray-400 mt-1">Try a different search term</p>}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map(course => {
                            const status = getEnrollmentStatus(course.id)
                            const isEnrolled = status === 'APPROVED'
                            const isPending = status === 'PENDING'
                            const isRejected = status === 'REJECTED'

                            return (
                                <div key={course.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                                            <BookOpen size={28} />
                                        </div>
                                        {status && (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
                                                {status}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-900 mb-2">{course.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leadings-relaxed">{course.description}</p>

                                    <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Clock size={16} className="text-primary-500" />
                                            <span>{course.duration} Hours Duration</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Layers size={16} className="text-primary-500" />
                                            <span>{course.modules?.length || 0} Learning Modules</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <User size={16} className="text-primary-500" />
                                            <span>Trainer: <span className="font-semibold text-gray-800">{course.primaryTrainerName || 'Not Assigned'}</span></span>
                                        </div>
                                    </div>

                                    {course.hasSyllabus && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                courseAPI.downloadSyllabus(course.id).then(res => {
                                                    const blob = new Blob([res.data], { type: 'application/pdf' })
                                                    const url = window.URL.createObjectURL(blob)
                                                    window.open(url, '_blank')
                                                }).catch(() => toast.error('Failed to open syllabus'))
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 mb-4 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all border border-blue-100"
                                        >
                                            <FileText size={16} />
                                            <span>View Syllabus</span>
                                            <Download size={14} className="ml-auto" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => isEnrolled ? navigate(`/student/courses/${course.id}`) : handleRequestEnrollment(course.id)}
                                        disabled={isPending || requestingCourse === course.id}
                                        className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                      ${isEnrolled
                                                ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:shadow-lg hover:shadow-green-100'
                                                : isPending
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                                    : 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-primary-100'}
                    `}
                                    >
                                        {requestingCourse === course.id ? (
                                            <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                {isEnrolled ? 'View Course Content' : isPending ? 'Request Pending' : isRejected ? 'Re-request Enrollment' : 'Enroll Now'}
                                                {isEnrolled ? <Play size={18} /> : (!status || isRejected) && <CheckCircle size={18} />}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

export default ViewCourses
