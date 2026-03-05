import { useState } from 'react'
import { X, Upload, FileText, Calendar, AlertCircle, Loader, CheckCircle2 } from 'lucide-react'
import { resourceAPI } from '../api'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'

const ResourceUploadModal = ({ isOpen, onClose, slot, type, trainerId, onUploadSuccess }) => {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title || (!file && type === 'material')) {
            toast.error('Resource title and file are required')
            return
        }

        if (!trainerId || !slot?.courseId) {
            toast.error('Session or Trainer information is missing')
            return
        }

        try {
            setLoading(true)
            const formData = new FormData()
            formData.append('trainerId', trainerId)
            formData.append('courseId', slot.courseId)

            if (slot.moduleId) formData.append('moduleId', slot.moduleId)
            if (slot.id) formData.append('slotId', slot.id)

            formData.append('title', title)
            if (description) formData.append('description', description)
            if (file) formData.append('file', file)

            if (type === 'assignment') {
                if (dueDate) {
                    const dateObj = new Date(dueDate)
                    const formattedDate = dateObj.toISOString().split('.')[0]
                    formData.append('dueDate', formattedDate)
                }
                await resourceAPI.createAssignment(formData)
                toast.success('Assignment created successfully')
            } else {
                await resourceAPI.createMaterial(formData)
                toast.success('Study material uploaded successfully')
            }

            onUploadSuccess()
            onClose()
            // Reset form
            setTitle('')
            setDescription('')
            setDueDate('')
            setFile(null)
        } catch (error) {
            console.error('Upload error:', error.response?.data || error.message)
            toast.error(error.response?.data?.message || 'Failed to upload resource')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-gray-900/40 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden border border-white/20"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                    {type === 'assignment' ? 'Create Assignment' : 'Upload Study Material'}
                                </h3>
                                <p className="text-xs text-gray-500 font-semibold mt-1 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                    Session: #{slot?.slotNumber} • {slot?.moduleName || 'Teaching Lab'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 transition-all hover:rotate-90"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1 mb-2 block">Resource Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={type === 'assignment' ? "e.g. Weekly Research Paper" : "e.g. Session Slide Deck"}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1 mb-2 block">Instruction or Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add specific instructions for students..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 transition-all min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {type === 'assignment' && (
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1 mb-2 block">Submission Deadline</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="datetime-local"
                                                    value={dueDate}
                                                    onChange={(e) => setDueDate(e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1 mb-2 block">Attachment</label>
                                        <label className={`flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed rounded-[2rem] cursor-pointer transition-all group ${file ? 'bg-orange-50/50 border-orange-200' : 'bg-gray-50 border-gray-200 hover:bg-orange-50 hover:border-orange-200'
                                            }`}>
                                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                                {file ? (
                                                    <>
                                                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-3">
                                                            <CheckCircle2 size={24} />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-900 truncate max-w-[240px]">{file.name}</p>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                            className="text-[10px] font-bold text-red-500 uppercase mt-2 hover:underline"
                                                        >
                                                            Remove File
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-white border border-gray-100 text-gray-300 rounded-xl flex items-center justify-center mb-3 group-hover:text-orange-500 transition-all group-hover:scale-110 shadow-sm">
                                                            <Upload size={24} />
                                                        </div>
                                                        <p className="text-sm font-bold text-gray-500">Drag & Drop or Click to Upload</p>
                                                        <p className="text-[10px] font-medium text-gray-400 mt-1">PDF, DOCX, ZIP (Max 50MB)</p>
                                                    </>
                                                )}
                                            </div>
                                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-orange-600 hover:shadow-orange-200/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    {loading ? <Loader className="animate-spin" size={16} /> : (type === 'assignment' ? <FileText size={16} /> : <Upload size={16} />)}
                                    {type === 'assignment' ? 'Create Task' : 'Post Materials'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default ResourceUploadModal

