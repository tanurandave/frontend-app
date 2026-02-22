import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import {
    BookOpen, Clock, Users, User, ArrowLeft, MoreVertical,
    Edit, Trash2, FolderOpen, Calendar, Mail, FileText, Upload, Download, Eye, X
} from 'lucide-react'
import { courseAPI, enrollmentAPI, resourceAPI } from '../../api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ClipboardList } from 'lucide-react'

const CourseDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const syllabusInputRef = useRef(null)
    const { isCollapsed } = useSidebar()

    const [course, setCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [students, setStudents] = useState([])
    const [trainers, setTrainers] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [assignments, setAssignments] = useState([])
    const [materials, setMaterials] = useState([])
    const [showEditModal, setShowEditModal] = useState(false)
    const [editFormData, setEditFormData] = useState({ name: '', description: '', duration: '' })
    const [saving, setSaving] = useState(false)
    const [showEditModuleModal, setShowEditModuleModal] = useState(false)
    const [editModuleFormData, setEditModuleFormData] = useState({ id: null, name: '', description: '', duration: '', orderNumber: '' })
    const [uploadingSyllabus, setUploadingSyllabus] = useState(false)

    useEffect(() => {
        fetchCourseDetails()
    }, [id])

    const fetchCourseDetails = async () => {
        try {
            setLoading(true)
            const [courseRes, enrollmentsRes, trainersRes, assRes, matRes] = await Promise.all([
                courseAPI.getById(id),
                enrollmentAPI.getByCourse(id),
                courseAPI.getTrainers(id),
                resourceAPI.getAssignmentsByCourse(id),
                resourceAPI.getMaterialsByCourse(id)
            ])

            setCourse(courseRes.data)
            setModules(courseRes.data.modules || [])
            setStudents(enrollmentsRes.data.map(e => ({
                id: e.studentId,
                name: e.studentName,
                enrolledAt: e.enrolledAt,
                enrollmentId: e.id
            })))
            setTrainers(trainersRes.data)
            setAssignments(assRes.data || [])
            setMaterials(matRes.data || [])
        } catch (error) {
            console.error('Error fetching course details:', error)
            toast.error('Failed to load course details')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCourse = async () => {
        if (!window.confirm('Are you sure you want to delete this course? This cannot be undone.')) return

        try {
            await courseAPI.delete(id)
            toast.success('Course deleted successfully')
            navigate('/admin/courses')
        } catch (error) {
            toast.error('Failed to delete course')
        }
    }

    const openEditModal = () => {
        setEditFormData({
            name: course.name,
            description: course.description || '',
            duration: course.duration
        })
        setShowEditModal(true)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            await courseAPI.update(id, editFormData)
            setCourse({ ...course, ...editFormData })
            toast.success('Course updated successfully')
            setShowEditModal(false)
        } catch (error) {
            toast.error('Failed to update course')
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('Are you sure you want to delete this module?')) return

        try {
            await courseAPI.deleteModule(moduleId)
            setModules(modules.filter(m => m.id !== moduleId))
            toast.success('Module deleted successfully')
        } catch (error) {
            toast.error('Failed to delete module')
        }
    }

    const openEditModuleModal = (module) => {
        setEditModuleFormData({
            id: module.id,
            name: module.name,
            description: module.description || '',
            duration: module.duration,
            orderNumber: module.orderNumber || 1
        })
        setShowEditModuleModal(true)
    }

    const handleEditModuleSubmit = async (e) => {
        e.preventDefault()
        try {
            setSaving(true)
            const payload = {
                name: editModuleFormData.name,
                description: editModuleFormData.description,
                duration: parseInt(editModuleFormData.duration),
                orderNumber: editModuleFormData.orderNumber || 1
            }

            await courseAPI.updateModule(editModuleFormData.id, payload)

            setModules(modules.map(m => m.id === editModuleFormData.id ? { ...m, ...payload } : m))
            toast.success('Module updated successfully')
            setShowEditModuleModal(false)
        } catch (error) {
            console.error(error)
            toast.error('Failed to update module')
        } finally {
            setSaving(false)
        }
    }

    const handleSyllabusUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file only')
            return
        }

        if (file.size > 20 * 1024 * 1024) {
            toast.error('File size must be less than 20MB')
            return
        }

        try {
            setUploadingSyllabus(true)
            const res = await courseAPI.uploadSyllabus(id, file)
            setCourse(res.data)
            toast.success('Syllabus uploaded successfully!')
        } catch (error) {
            console.error('Error uploading syllabus:', error)
            toast.error('Failed to upload syllabus')
        } finally {
            setUploadingSyllabus(false)
            if (syllabusInputRef.current) syllabusInputRef.current.value = ''
        }
    }

    const handleDeleteSyllabus = async () => {
        if (!window.confirm('Are you sure you want to remove the syllabus?')) return
        try {
            const res = await courseAPI.deleteSyllabus(id)
            setCourse(res.data)
            toast.success('Syllabus removed successfully')
        } catch (error) {
            toast.error('Failed to remove syllabus')
        }
    }

    const handleDownloadSyllabus = async () => {
        try {
            const res = await courseAPI.downloadSyllabus(id)
            const blob = new Blob([res.data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = course.syllabusFileName || 'syllabus.pdf'
            a.click()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            toast.error('Failed to download syllabus')
        }
    }

    const handleViewSyllabus = () => {
        const token = localStorage.getItem('token')
        const url = courseAPI.getSyllabusUrl(id)
        // Open in new tab with auth - we'll fetch as blob and create object URL
        courseAPI.downloadSyllabus(id).then(res => {
            const blob = new Blob([res.data], { type: 'application/pdf' })
            const objectUrl = window.URL.createObjectURL(blob)
            window.open(objectUrl, '_blank')
        }).catch(() => toast.error('Failed to open syllabus'))
    }

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar userRole="ADMIN" />
                <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                    <Header />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar userRole="ADMIN" />
                <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                    <Header />
                    <div className="flex-1 p-8">
                        <div className="text-center py-12">
                            <h2 className="text-xl font-bold text-gray-900">Course not found</h2>
                            <button onClick={() => navigate('/admin/courses')} className="mt-4 text-orange-600 hover:underline">Back to Courses</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar userRole="ADMIN" />
            <div className={`flex-1 flex flex-col ${isCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
                <Header />

                <div className="flex-1 overflow-auto p-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Courses</span>
                    </button>

                    {/* Course Header Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 flex gap-2">
                            <button
                                onClick={openEditModal}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Course"
                            >
                                <Edit size={20} />
                            </button>
                            <button
                                onClick={handleDeleteCourse}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Course"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center shadow-lg shrink-0">
                                <BookOpen size={48} />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
                                <p className="text-gray-600 mb-6 max-w-3xl leading-relaxed">{course.description || 'No description available.'}</p>

                                <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-500">
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Clock size={18} className="text-orange-500" />
                                        <span>{course.duration} Hours Duration</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <Users size={18} className="text-blue-500" />
                                        <span>{students.length} Students Enrolled</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                        <FolderOpen size={18} className="text-purple-500" />
                                        <span>{modules.length} Modules</span>
                                    </div>
                                    {course.hasSyllabus && (
                                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-green-700">
                                            <FileText size={18} />
                                            <span>Syllabus Uploaded</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex border-b border-gray-200 mb-8">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'overview'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Modules & Curriculum
                        </button>
                        <button
                            onClick={() => setActiveTab('syllabus')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'syllabus'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText size={16} />
                            Syllabus
                            {course.hasSyllabus && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'students'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Enrolled Students
                        </button>
                        <button
                            onClick={() => setActiveTab('trainers')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'trainers'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Assigned Trainers
                        </button>
                        <button
                            onClick={() => setActiveTab('resources')}
                            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'resources'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <ClipboardList size={16} />
                            Learning Resources
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="animate-fadeIn">
                        {activeTab === 'overview' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-gray-900">Course Modules</h3>
                                </div>

                                {modules.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                                        No modules added yet.
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {modules.map((module, index) => (
                                            <div key={module.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-orange-200 transition-colors group">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-gray-900 text-lg mb-1">{module.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                                                {module.duration}h
                                                            </span>
                                                            <button
                                                                onClick={() => openEditModuleModal(module)}
                                                                className="text-gray-400 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Edit Module"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteModule(module.id)}
                                                                className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                title="Delete Module"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{module.description || 'No description provided.'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Syllabus Tab */}
                        {activeTab === 'syllabus' && (
                            <div className="max-w-4xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <FileText className="text-orange-500" size={20} />
                                        Course Syllabus
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="file"
                                            ref={syllabusInputRef}
                                            accept="application/pdf"
                                            onChange={handleSyllabusUpload}
                                            className="hidden"
                                        />
                                        <button
                                            onClick={() => syllabusInputRef.current?.click()}
                                            disabled={uploadingSyllabus}
                                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium text-sm hover:bg-orange-600 transition-all disabled:opacity-50 shadow-sm"
                                        >
                                            {uploadingSyllabus ? (
                                                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Upload size={16} />
                                            )}
                                            {course.hasSyllabus ? 'Replace Syllabus' : 'Upload Syllabus'}
                                        </button>
                                    </div>
                                </div>

                                {course.hasSyllabus ? (
                                    <div className="space-y-6">
                                        {/* File Info Card */}
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                                                        <FileText size={28} className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{course.syllabusFileName}</h4>
                                                        <p className="text-sm text-gray-500 mt-0.5">PDF Document • Uploaded for this course</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={handleViewSyllabus}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-100 transition-all"
                                                    >
                                                        <Eye size={16} /> View
                                                    </button>
                                                    <button
                                                        onClick={handleDownloadSyllabus}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-medium text-sm hover:bg-green-100 transition-all"
                                                    >
                                                        <Download size={16} /> Download
                                                    </button>
                                                    <button
                                                        onClick={handleDeleteSyllabus}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-medium text-sm hover:bg-red-100 transition-all"
                                                    >
                                                        <Trash2 size={16} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inline PDF Viewer */}
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                                <h4 className="font-bold text-gray-700 flex items-center gap-2">
                                                    <Eye size={16} /> Preview
                                                </h4>
                                            </div>
                                            <div className="bg-gray-100 p-4">
                                                <iframe
                                                    src={`${courseAPI.getSyllabusUrl(id)}#toolbar=1`}
                                                    className="w-full rounded-xl border border-gray-200 shadow-inner"
                                                    style={{ height: '700px' }}
                                                    title="Syllabus Preview"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <Upload size={36} className="text-gray-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-500 mb-2">No Syllabus Uploaded</h3>
                                        <p className="text-gray-400 mb-6 max-w-md mx-auto">Upload a PDF syllabus for this course. Students and trainers will be able to view and download it.</p>
                                        <button
                                            onClick={() => syllabusInputRef.current?.click()}
                                            disabled={uploadingSyllabus}
                                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all inline-flex items-center gap-2 shadow-md"
                                        >
                                            <Upload size={18} />
                                            Upload PDF Syllabus
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'students' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Enrolled Students ({students.length})</h3>
                                {students.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                                        No students enrolled in this course yet.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {students.map((student) => (
                                            <div key={student.enrollmentId} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{student.name}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <Calendar size={12} />
                                                        Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'trainers' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Course Trainers</h3>
                                <p className="text-sm text-gray-500 mb-6">Trainers assigned to this course via schedule slots.</p>

                                {trainers.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                                        No trainers currently assigned to slots for this course.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {trainers.map((trainer) => (
                                            <div key={trainer.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
                                                        {trainer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{trainer.name}</h4>
                                                        <p className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-1">Trainer</p>
                                                    </div>
                                                </div>
                                                <div className="border-t border-gray-50 pt-4 mt-2">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                                        <Mail size={16} className="text-gray-400" />
                                                        {trainer.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="space-y-10">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                            <FileText className="text-orange-500" />
                                            Active Assignments ({assignments.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {assignments.length > 0 ? (
                                                assignments.map(ass => (
                                                    <div key={ass.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="font-black text-gray-900 uppercase tracking-tight">{ass.title}</h4>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Trainer: {ass.trainerName}</p>
                                                            </div>
                                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all">
                                                                <Download size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-4">
                                                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-orange-500" /> Due: {new Date(ass.dueDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-100">
                                                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No assignments found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                            <BookOpen className="text-blue-500" />
                                            Study Materials ({materials.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {materials.length > 0 ? (
                                                materials.map(mat => (
                                                    <div key={mat.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div>
                                                                <h4 className="font-black text-gray-900 uppercase tracking-tight">{mat.title}</h4>
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Trainer: {mat.trainerName}</p>
                                                            </div>
                                                            <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all">
                                                                <Download size={18} />
                                                            </button>
                                                        </div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-t border-gray-50 pt-4">
                                                            Shared: {new Date(mat.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-100">
                                                    <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No materials found</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit Course Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Edit Course</h2>
                                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                                    <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours) *</label>
                                    <input
                                        type="number"
                                        value={editFormData.duration}
                                        onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Module Modal */}
                {showEditModuleModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Edit Module</h2>
                                <button onClick={() => setShowEditModuleModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleEditModuleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Module Name *</label>
                                    <input
                                        type="text"
                                        value={editModuleFormData.name}
                                        onChange={(e) => setEditModuleFormData({ ...editModuleFormData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={editModuleFormData.description}
                                        onChange={(e) => setEditModuleFormData({ ...editModuleFormData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        rows="3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours) *</label>
                                    <input
                                        type="number"
                                        value={editModuleFormData.duration}
                                        onChange={(e) => setEditModuleFormData({ ...editModuleFormData, duration: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModuleModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    )
}

export default CourseDetails
