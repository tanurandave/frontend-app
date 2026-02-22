import React, { useState, useEffect } from 'react'
import { FileText, BookOpen, Clock, Download, Users, CheckCircle, ChevronRight, Search, Layout, Trash2 } from 'lucide-react'
import { resourceAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import { toast, ToastContainer } from 'react-toastify'

const TrainerResources = () => {
    const { isCollapsed } = useSidebar()
    const { user } = useAuth()
    const [assignments, setAssignments] = useState([])
    const [materials, setMaterials] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedAssignment, setSelectedAssignment] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [activeTab, setActiveTab] = useState('assignments')

    useEffect(() => {
        if (user?.id) fetchResources()
    }, [user])

    const fetchResources = async () => {
        try {
            setLoading(true)
            const [assRes, matRes] = await Promise.all([
                resourceAPI.getAssignmentsByTrainer(user.id),
                resourceAPI.getMaterialsByTrainer(user.id)
            ])
            setAssignments(assRes.data || [])
            setMaterials(matRes.data || [])
        } catch (error) {
            toast.error('Failed to load resources')
        } finally {
            setLoading(false)
        }
    }

    const viewSubmissions = async (assignment) => {
        try {
            setSelectedAssignment(assignment)
            const res = await resourceAPI.getSubmissions(assignment.id)
            setSubmissions(res.data || [])
        } catch (error) {
            toast.error('Failed to load submissions')
        }
    }

    const handleDelete = async (e, id, type) => {
        e.stopPropagation()
        if (!window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return

        try {
            if (type === 'assignment') {
                await resourceAPI.deleteAssignment(id)
                if (selectedAssignment?.id === id) setSelectedAssignment(null)
            } else {
                await resourceAPI.deleteMaterial(id)
            }
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`)
            fetchResources()
        } catch (error) {
            toast.error(`Failed to delete ${type}`)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Header title="Resource Management" />
                <main className="p-8">
                    <div className="flex justify-between items-center mb-8 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('assignments')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'assignments' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                My Assignments ({assignments.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'materials' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:bg-gray-50'}`}
                            >
                                Study Materials ({materials.length})
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* List Section */}
                        <div className="lg:col-span-2 space-y-4">
                            {activeTab === 'assignments' ? (
                                assignments.map(ass => (
                                    <div key={ass.id} className={`bg-white rounded-[2rem] p-6 border transition-all cursor-pointer ${selectedAssignment?.id === ass.id ? 'border-orange-500 shadow-lg' : 'border-gray-100 hover:shadow-md'}`} onClick={() => viewSubmissions(ass)}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{ass.title}</h4>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{ass.courseName} • {ass.moduleName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleDelete(e, ass.id, 'assignment')}
                                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                                    title="Delete Assignment"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                                <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all">
                                                    <Download size={20} />
                                                </button>
                                                <ChevronRight size={20} className="text-gray-300" />
                                            </div>
                                        </div>
                                        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Clock size={14} className="text-orange-500" />
                                                Due: {new Date(ass.dueDate).toLocaleDateString()}
                                            </div>
                                            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                                Active Assignment
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                materials.map(mat => (
                                    <div key={mat.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                                    <BookOpen size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">{mat.title}</h4>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{mat.courseName} • {mat.moduleName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => handleDelete(e, mat.id, 'material')}
                                                    className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                                                    title="Delete Material"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                                <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-orange-600 hover:text-white transition-all">
                                                    <Download size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Shared on: {new Date(mat.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Submission Details / Info Panel */}
                        <div className="lg:col-span-1">
                            {selectedAssignment ? (
                                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm sticky top-8">
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-2">Student Submissions</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6">For: {selectedAssignment.title}</p>

                                    <div className="space-y-4">
                                        {submissions.length > 0 ? (
                                            submissions.map(sub => (
                                                <div key={sub.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 uppercase">{sub.studentName}</p>
                                                            <p className="text-[10px] text-gray-400 font-bold">{new Date(sub.submittedAt).toLocaleString()}</p>
                                                        </div>
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-600 rounded text-[8px] font-black uppercase">Completed</span>
                                                    </div>
                                                    <button className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-widest mt-2 hover:text-orange-700 transition-colors">
                                                        <Download size={14} /> Download Work
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center">
                                                <Users size={48} className="mx-auto text-gray-200 mb-4" />
                                                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No Submissions Yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100 text-gray-300">
                                    <Layout size={48} className="mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest leading-relaxed">Select an assignment to track student completion and progress</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    )
}

export default TrainerResources
