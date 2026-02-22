import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import { BookOpen, CheckCircle, ChevronRight, Play, FileText, Award, ArrowLeft, Clock, Download } from 'lucide-react'
import { courseAPI, enrollmentAPI, resourceAPI } from '../../api'
import { toast } from 'react-toastify'

const CourseContent = () => {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { isCollapsed } = useSidebar()
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeModule, setActiveModule] = useState(null)
    const [completedModules, setCompletedModules] = useState([])
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [assignments, setAssignments] = useState([])
    const [materials, setMaterials] = useState([])
    const [activeTab, setActiveTab] = useState('content') // 'content', 'assignments', 'materials'

    useEffect(() => {
        if (user?.id && id) {
            fetchCourseAndEnrollment()
            loadProgress()
        }
    }, [user?.id, id])

    const fetchCourseAndEnrollment = async () => {
        try {
            setLoading(true)
            // Check enrollment first
            const enrollmentsRes = await enrollmentAPI.getByStudent(user.id)
            const enrollment = enrollmentsRes.data.find(e => e.courseId === parseInt(id))

            if (!enrollment || enrollment.status !== 'APPROVED') {
                toast.error('You are not authorized to view this course content')
                navigate('/student/view-courses')
                return
            }

            setIsEnrolled(true)

            // Fetch course details, assignments, and materials in parallel
            const [courseRes, assignmentsRes, materialsRes] = await Promise.all([
                courseAPI.getById(id),
                resourceAPI.getAssignmentsByCourse(id),
                resourceAPI.getMaterialsByCourse(id)
            ])

            setCourse(courseRes.data)
            setAssignments(assignmentsRes.data || [])
            setMaterials(materialsRes.data || [])

            if (courseRes.data.modules?.length > 0) {
                setActiveModule(courseRes.data.modules[0])
            }
        } catch (error) {
            console.error('Error fetching course:', error)
            toast.error('Failed to load course content')
        } finally {
            setLoading(false)
        }
    }

    const loadProgress = () => {
        const progressKey = `progress_${user.id}_${id}`
        const savedProgress = localStorage.getItem(progressKey)
        if (savedProgress) {
            setCompletedModules(JSON.parse(savedProgress))
        }
    }

    const toggleModuleCompletion = (moduleId) => {
        let newCompleted;
        if (completedModules.includes(moduleId)) {
            newCompleted = completedModules.filter(mId => mId !== moduleId)
        } else {
            newCompleted = [...completedModules, moduleId]
        }

        setCompletedModules(newCompleted)
        const progressKey = `progress_${user.id}_${id}`
        localStorage.setItem(progressKey, JSON.stringify(newCompleted))

        if (!completedModules.includes(moduleId)) {
            toast.success('Module marked as completed!')
        }
    }

    const progressPercentage = course?.modules?.length
        ? Math.round((completedModules.length / course.modules.length) * 100)
        : 0

    if (loading) {
        return (
            <div className="flex bg-gray-50 min-h-screen">
                <Sidebar />
                <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} p-8 flex items-center justify-center transition-all duration-300`}>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} p-8 transition-all duration-300`}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} />
                    <span>Back to Courses</span>
                </button>

                <div className="flex justify-between items-center mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto gap-2">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Course Modules
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'assignments' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Assignments ({assignments.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'materials' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            Study Materials ({materials.length})
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {activeTab === 'content' && (
                            activeModule ? (
                                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100">
                                    <div className="aspect-video bg-gray-900 flex items-center justify-center relative group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                                            <p className="text-white font-medium">Currently viewing: {activeModule.name}</p>
                                        </div>
                                        <Play size={64} className="text-white opacity-40 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer" />
                                    </div>

                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeModule.name}</h2>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5"><Clock size={16} /> {activeModule.duration} Minutes</span>
                                                    <span className="flex items-center gap-1.5"><FileText size={16} /> Section {activeModule.orderNumber}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleModuleCompletion(activeModule.id)}
                                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${completedModules.includes(activeModule.id)
                                                    ? 'bg-green-50 text-green-600 border border-green-200'
                                                    : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-primary-100'
                                                    }`}
                                            >
                                                {completedModules.includes(activeModule.id) ? (
                                                    <>
                                                        <CheckCircle size={18} />
                                                        Completed
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle size={18} className="opacity-50" />
                                                        Mark Completed
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="prose prose-indigo max-w-none">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Module Description</h3>
                                            <p className="text-gray-600 leading-relaxed">
                                                {activeModule?.description || 'Welcome to this learning module. Here you will find detailed information about the topics covered in this section of the course. Please follow the instructions and materials provided to complete the module successfully.'}
                                            </p>

                                            <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                <h4 className="text-blue-900 font-bold mb-2 flex items-center gap-2">
                                                    <FileText size={18} />
                                                    Learning Materials
                                                </h4>
                                                <p className="text-blue-700 text-sm mb-4">The following resources are available for this module:</p>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2 text-sm text-blue-800 hover:underline cursor-pointer">
                                                        <ChevronRight size={14} /> Session Notes (PDF)
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
                                    <BookOpen size={64} className="mx-auto text-gray-200 mb-4" />
                                    <h3 className="text-xl font-bold text-gray-400">No content available for this module</h3>
                                </div>
                            )
                        )}

                        {activeTab === 'assignments' && (
                            <div className="space-y-4">
                                {assignments.length > 0 ? (
                                    assignments.map(ass => (
                                        <div key={ass.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{ass.title}</h4>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{ass.moduleName || 'General Assignment'}</p>
                                                    </div>
                                                </div>
                                                {ass.fileName && (
                                                    <button
                                                        onClick={() => {
                                                            resourceAPI.downloadAssignment(ass.id).then(res => {
                                                                const url = window.URL.createObjectURL(new Blob([res.data]))
                                                                const a = document.createElement('a')
                                                                a.href = url
                                                                a.download = ass.fileName
                                                                a.click()
                                                            })
                                                        }}
                                                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="mt-4 text-sm text-gray-600 font-medium leading-relaxed">{ass.description}</p>
                                            <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={14} className="text-orange-500" />
                                                    Due: {ass.dueDate ? new Date(ass.dueDate).toLocaleDateString() : 'No deadline'}
                                                </div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    Posted: {new Date(ass.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 shadow-sm">
                                        <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">No Assignments Posted</h3>
                                        <p className="text-sm text-gray-400 mt-2 font-medium">Check back later for new tasks from your trainer.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'materials' && (
                            <div className="space-y-4">
                                {materials.length > 0 ? (
                                    materials.map(mat => (
                                        <div key={mat.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <BookOpen size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{mat.title}</h4>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{mat.moduleName || 'Course Notes'}</p>
                                                    </div>
                                                </div>
                                                {mat.fileName && (
                                                    <button
                                                        onClick={() => {
                                                            resourceAPI.downloadMaterial(mat.id).then(res => {
                                                                const url = window.URL.createObjectURL(new Blob([res.data]))
                                                                const a = document.createElement('a')
                                                                a.href = url
                                                                a.download = mat.fileName
                                                                a.click()
                                                            })
                                                        }}
                                                        className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="mt-4 text-sm text-gray-600 font-medium leading-relaxed">{mat.description}</p>
                                            <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    By: {mat.trainerName}
                                                </div>
                                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    Shared: {new Date(mat.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 shadow-sm">
                                        <BookOpen size={48} className="mx-auto text-gray-200 mb-4" />
                                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-tight">Resources Coming Soon</h3>
                                        <p className="text-sm text-gray-400 mt-2 font-medium">Session notes and handouts will appear here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Progress Area */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Award className="text-primary-600" size={20} />
                                Your Progress
                            </h3>
                            <div className="mb-4">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-3xl font-bold text-primary-600">{progressPercentage}%</span>
                                    <span className="text-sm text-gray-500 font-medium">{completedModules.length} / {course?.modules?.length || 0} Completed</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-primary-600 to-secondary-600 h-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                            {progressPercentage === 100 && (
                                <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-green-700 text-xs font-bold flex items-center gap-2">
                                    <CheckCircle size={14} />
                                    Course Completed!
                                </div>
                            )}
                        </div>

                        {/* Syllabus Download */}
                        {course?.hasSyllabus && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="text-red-500" size={20} />
                                    Course Syllabus
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">{course.syllabusFileName}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            courseAPI.downloadSyllabus(id).then(res => {
                                                const blob = new Blob([res.data], { type: 'application/pdf' })
                                                const url = window.URL.createObjectURL(blob)
                                                window.open(url, '_blank')
                                            }).catch(() => toast.error('Failed to open syllabus'))
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all"
                                    >
                                        <Play size={14} /> View
                                    </button>
                                    <button
                                        onClick={() => {
                                            courseAPI.downloadSyllabus(id).then(res => {
                                                const blob = new Blob([res.data], { type: 'application/pdf' })
                                                const url = window.URL.createObjectURL(blob)
                                                const a = document.createElement('a')
                                                a.href = url
                                                a.download = course.syllabusFileName || 'syllabus.pdf'
                                                a.click()
                                                window.URL.revokeObjectURL(url)
                                            }).catch(() => toast.error('Failed to download syllabus'))
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl text-sm font-bold hover:bg-green-100 transition-all"
                                    >
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-50">
                                <h3 className="font-bold text-gray-900">Course Modules</h3>
                            </div>
                            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                                {course?.modules?.sort((a, b) => a.orderNumber - b.orderNumber).map((module) => (
                                    <button
                                        key={module.id}
                                        onClick={() => setActiveModule(module)}
                                        className={`w-full p-4 flex items-start gap-4 hover:bg-gray-50 transition-all text-left ${activeModule?.id === module.id ? 'bg-primary-50/50' : ''}`}
                                    >
                                        <div className={`shrink-0 mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${completedModules.includes(module.id)
                                            ? 'bg-green-500 border-green-500 text-white'
                                            : activeModule?.id === module.id
                                                ? 'border-primary-500 bg-white'
                                                : 'border-gray-200 bg-white'
                                            }`}>
                                            {completedModules.includes(module.id) && <CheckCircle size={14} />}
                                            {activeModule?.id === module.id && !completedModules.includes(module.id) && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm font-bold ${activeModule?.id === module.id ? 'text-primary-700' : 'text-gray-700'}`}>
                                                {module.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <Clock size={10} />
                                                {module.duration} mins
                                            </p>
                                        </div>
                                        {activeModule?.id === module.id && <ChevronRight size={16} className="text-primary-500 shrink-0" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CourseContent
