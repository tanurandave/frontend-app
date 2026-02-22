import { useState } from 'react'
import { X, Upload, FileText, Calendar, AlertCircle, Loader } from 'lucide-react'
import { resourceAPI } from '../api'
import { toast } from 'react-toastify'

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
            toast.error('Title and file are required')
            return
        }

        if (!trainerId || !slot?.courseId) {
            toast.error('Session or Trainer information is missing')
            console.error('Missing required IDs:', { trainerId, courseId: slot?.courseId })
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
                    // Format: yyyy-MM-ddTHH:mm:ss for Spring LocalDateTime compatibility
                    const dateObj = new Date(dueDate)
                    const formattedDate = dateObj.toISOString().split('.')[0]
                    formData.append('dueDate', formattedDate)
                }
                console.log('Sending assignment data:', Object.fromEntries(formData))
                await resourceAPI.createAssignment(formData)
                toast.success('Assignment created successfully')
            } else {
                console.log('Sending material data:', Object.fromEntries(formData))
                await resourceAPI.createMaterial(formData)
                toast.success('Study material uploaded')
            }

            onUploadSuccess()
            onClose()
        } catch (error) {
            console.error('Upload error detail:', error.response?.data || error.message)
            toast.error(error.response?.data?.message || 'Failed to upload resource')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                            {type === 'assignment' ? 'Create Assignment' : 'Upload Study Material'}
                        </h3>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">
                            For Session: #{slot.slotNumber} - {slot.moduleName}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm text-gray-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Resource Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={type === 'assignment' ? "e.g. Weekly Lab Exercise" : "e.g. Session Lecture Notes"}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Description (Optional)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add instructions or details..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 transition-all min-h-[100px] resize-none"
                            />
                        </div>

                        {type === 'assignment' && (
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Due Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="datetime-local"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-5 py-3.5 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-200 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Upload File</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 hover:bg-orange-50 hover:border-orange-200 cursor-pointer transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-orange-500 transition-colors mb-2" />
                                    <p className="text-xs font-bold text-gray-500">{file ? file.name : 'Select or drop file'}</p>
                                </div>
                                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-orange-600 hover:shadow-orange-200 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin" size={16} /> : <FileText size={16} />}
                            {type === 'assignment' ? 'Assign Task' : 'Post Materials'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ResourceUploadModal
