import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
    User, Mail, Phone, Calendar, ArrowLeft, BookOpen, Clock,
    FileText, Shield, MapPin, Briefcase, Award, CheckCircle, X
} from 'lucide-react'
import { userAPI, enrollmentAPI, notificationAPI } from '../../api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const StudentDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isCollapsed } = useSidebar()

    const [student, setStudent] = useState(null)
    const [enrollments, setEnrollments] = useState([])
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        fetchStudentDetails()
    }, [id])

    const fetchStudentDetails = async () => {
        try {
            setLoading(true)
            const [userRes, enrollRes, notifRes] = await Promise.all([
                userAPI.getById(id),
                enrollmentAPI.getByStudent(id),
                notificationAPI.getUserNotifications(id)
            ])

            setStudent(userRes.data)
            setEnrollments(enrollRes.data || [])
            setNotifications(notifRes.data || [])
        } catch (error) {
            console.error('Error fetching student details:', error)
            toast.error('Failed to load student details')
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
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium">Loading details...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!student) {
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
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h2>
                            <p className="text-gray-500 mb-6">The student you are looking for does not exist or has been removed.</p>
                            <button
                                onClick={() => navigate('/admin/students')}
                                className="px-6 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition font-medium"
                            >
                                Back to Students
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
                                onClick={() => navigate('/admin/students')}
                                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                <span className="font-medium">Back to Students</span>
                            </button>

                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg shadow-blue-500/20 ring-4 ring-white">
                                    {student.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wider">
                                            Student
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Mail size={16} />
                                            <span className="text-sm">{student.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar size={16} />
                                            <span className="text-sm">Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Courses Enrolled</p>
                                <p className="text-2xl font-bold text-gray-900">{enrollments.filter(e => e.status === 'APPROVED').length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
                                <p className="text-2xl font-bold text-gray-900">{enrollments.filter(e => e.status === 'PENDING').length}</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Notifications Sent</p>
                                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                        <div className="flex border-b border-gray-100 px-6 overflow-x-auto bg-gray-50/50">
                            {[
                                { id: 'overview', label: 'Overview', icon: User },
                                { id: 'courses', label: 'Enrolled Courses', icon: BookOpen },
                                { id: 'notifications', label: 'Notification History', icon: FileText }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap mt-1 ${activeTab === tab.id
                                        ? 'border-orange-500 text-orange-600 bg-white rounded-t-xl shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]'
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
                                <div className="max-w-3xl space-y-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <User size={20} className="text-orange-500" />
                                            Personal Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Full Name</p>
                                                <p className="text-gray-900 font-medium">{student.name}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Email Address</p>
                                                <p className="text-gray-900 font-medium">{student.email}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Phone Number</p>
                                                <p className="text-gray-900 font-medium">{student.phone || 'Not provided'}</p>
                                            </div>
                                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Account Role</p>
                                                <p className="text-gray-900 font-medium">{student.role}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FileText size={20} className="text-orange-500" />
                                            Biography
                                        </h3>
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600 leading-relaxed">
                                            {student.bio || 'This student has not provided a biography yet.'}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Shield size={20} className="text-orange-500" />
                                            System Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Account Created</p>
                                                    <p className="text-sm font-medium text-gray-900">{new Date(student.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                                    <Clock size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Last Updated</p>
                                                    <p className="text-sm font-medium text-gray-900">{student.updatedAt ? new Date(student.updatedAt).toLocaleString() : 'Never'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'courses' && (
                                <div className="space-y-6">
                                    {enrollments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {enrollments.map((enrollment) => (
                                                <div key={enrollment.id} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg">
                                                            {enrollment.courseName?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors uppercase text-sm tracking-wide">
                                                                {enrollment.courseName}
                                                            </h4>
                                                            <p className="text-xs text-gray-500">Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${enrollment.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-100' :
                                                        enrollment.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                            'bg-red-50 text-red-600 border-red-100'
                                                        }`}>
                                                        {enrollment.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                <BookOpen size={32} />
                                            </div>
                                            <p className="text-gray-500 font-medium">No courses found for this student.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-4">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-400 mt-1">
                                                    <Mail size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-gray-900 text-sm leading-relaxed mb-2 font-medium">{notif.message}</p>
                                                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                                                        <span className={notif.read ? 'text-green-500' : 'text-orange-500'}>
                                                            {notif.read ? 'Opened' : 'Unread'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-300">
                                                <Mail size={32} />
                                            </div>
                                            <p className="text-gray-500 font-medium">No notification history found.</p>
                                        </div>
                                    )}
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

export default StudentDetails
