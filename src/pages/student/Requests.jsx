import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import { Clock, CheckCircle, XCircle, BookOpen, Filter, ArrowRight } from 'lucide-react'
import { enrollmentAPI } from '../../api'
import { toast } from 'react-toastify'

const Requests = () => {
    const { user } = useAuth()
    const { isPinned, isHovering } = useSidebar()
    const [enrollments, setEnrollments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => {
        if (user?.id) fetchEnrollments()
    }, [user?.id])

    const fetchEnrollments = async () => {
        try {
            setLoading(true)
            const res = await enrollmentAPI.getByStudent(user.id)
            setEnrollments(res.data || [])
        } catch (error) {
            console.error('Error fetching enrollments:', error)
            toast.error('Failed to load requests')
        } finally {
            setLoading(false)
        }
    }

    const filteredEnrollments = filter === 'ALL'
        ? enrollments
        : enrollments.filter(e => e.status === filter)

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-50 text-green-700 border-green-200'
            case 'PENDING': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
            case 'REJECTED': return 'bg-red-50 text-red-700 border-red-200'
            default: return 'bg-gray-50 text-gray-700 border-gray-200'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle size={16} />
            case 'PENDING': return <Clock size={16} />
            case 'REJECTED': return <XCircle size={16} />
            default: return null
        }
    }

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className={`flex-1 ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} p-8 transition-all duration-300`}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg">
                                <Clock size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
                                <p className="text-gray-500 text-sm">Track your enrollment requests</p>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6">
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                                <span className="ml-2 text-xs opacity-70">
                                    ({f === 'ALL' ? enrollments.length : enrollments.filter(e => e.status === f).length})
                                </span>
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                        </div>
                    ) : filteredEnrollments.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
                            <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-400">No requests found</h3>
                            <p className="text-gray-400 text-sm mt-1">
                                {filter === 'ALL' ? 'Browse courses and send enrollment requests' : `No ${filter.toLowerCase()} requests`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredEnrollments.map((enrollment) => (
                                <div
                                    key={enrollment.id}
                                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white">
                                                <BookOpen size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900">{enrollment.courseName}</h4>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-400">
                                                        Requested: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${getStatusStyle(enrollment.status)}`}>
                                                        {getStatusIcon(enrollment.status)}
                                                        {enrollment.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 gap-3">
                                            {enrollment.status === 'APPROVED' && (
                                                <Link
                                                    to={`/student/courses/${enrollment.courseId}`}
                                                    className="px-5 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all flex items-center gap-2"
                                                >
                                                    Go to Course <ArrowRight size={14} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Requests
