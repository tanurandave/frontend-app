import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, Plus, BookOpen, Trash2, Edit, X, AlertCircle, Loader, FolderOpen } from 'lucide-react'
import { courseAPI } from '../../api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [editingCourse, setEditingCourse] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', duration: '' })
  const [moduleFormData, setModuleFormData] = useState({ name: '', description: '', duration: '', orderNumber: '' })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await courseAPI.getAll()
      setCourses(response.data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Course name is required'
    if (!formData.duration || formData.duration <= 0) errors.duration = 'Duration is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateModuleForm = () => {
    const errors = {}
    if (!moduleFormData.name.trim()) errors.name = 'Module name is required'
    if (!moduleFormData.duration || moduleFormData.duration <= 0) errors.duration = 'Duration is required'
    if (!moduleFormData.orderNumber || moduleFormData.orderNumber <= 0) errors.orderNumber = 'Order number is required'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setSaving(true)
      const data = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration)
      }

      if (editingCourse) {
        await courseAPI.update(editingCourse.id, data)
        setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...data } : c))
        toast.success('Course updated successfully!')
      } else {
        const response = await courseAPI.create(data)
        setCourses([...courses, response.data])
        toast.success('Course created successfully!')
      }
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save course')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) return
    try {
      setSaving(true)
      await courseAPI.delete(showDeleteConfirm)
      setCourses(courses.filter(c => c.id !== showDeleteConfirm))
      toast.success('Course deleted successfully!')
      setShowDeleteConfirm(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course')
    } finally {
      setSaving(false)
    }
  }

  const handleAddModule = async (e) => {
    e.preventDefault()
    if (!validateModuleForm()) return

    try {
      setSaving(true)
      const data = {
        name: moduleFormData.name,
        description: moduleFormData.description,
        duration: parseInt(moduleFormData.duration),
        orderNumber: parseInt(moduleFormData.orderNumber)
      }

      const response = await courseAPI.addModule(selectedCourse.id, data)
      
      setCourses(courses.map(c => {
        if (c.id === selectedCourse.id) {
          return { ...c, modules: [...(c.modules || []), response.data] }
        }
        return c
      }))
      
      setSelectedCourse({ ...selectedCourse, modules: [...(selectedCourse.modules || []), response.data] })
      
      toast.success('Module added successfully!')
      setModuleFormData({ name: '', description: '', duration: '', orderNumber: '' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add module')
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (course) => {
    setEditingCourse(course)
    setFormData({ name: course.name, description: course.description || '', duration: course.duration })
    setShowAddModal(true)
    setFormErrors({})
  }

  const openModulesModal = (course) => {
    setSelectedCourse(course)
    setShowModuleModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingCourse(null)
    setFormData({ name: '', description: '', duration: '' })
    setFormErrors({})
  }

  const closeModuleModal = () => {
    setShowModuleModal(false)
    setSelectedCourse(null)
    setModuleFormData({ name: '', description: '', duration: '', orderNumber: '' })
    setFormErrors({})
  }

  const filteredCourses = courses.filter(course =>
    course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-500 mt-1">Manage course catalog</p>
          </div>
          <button 
            onClick={() => { setEditingCourse(null); setFormData({ name: '', description: '', duration: '' }); setShowAddModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Course
          </button>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">Loading...</div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">No courses found</div>
          ) : (
            filteredCourses.map((course) => (
              <div key={course.id} className="glass-card p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
                    <BookOpen className="text-white" size={28} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(course)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(course.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {course.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <button 
                    onClick={() => openModulesModal(course)}
                    className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <FolderOpen size={16} />
                    {course.modules?.length || 0} modules
                  </button>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add/Edit Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Full Stack Development"
                />
                {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Course description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${formErrors.duration ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 120"
                  min="1"
                />
                {formErrors.duration && <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader className="animate-spin" size={18} /> : null}
                  {editingCourse ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modules Modal */}
      {showModuleModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modules - {selectedCourse.name}</h2>
                <p className="text-gray-500 text-sm">{selectedCourse.modules?.length || 0} modules</p>
              </div>
              <button onClick={closeModuleModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Add Module Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Module</h3>
                <form onSubmit={handleAddModule} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={moduleFormData.name}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Module name *"
                    />
                    <input
                      type="number"
                      value={moduleFormData.orderNumber}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, orderNumber: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Order # *"
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={moduleFormData.duration}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, duration: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Duration (hours) *"
                      min="1"
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                    >
                      Add Module
                    </button>
                  </div>
                  <input
                    type="text"
                    value={moduleFormData.description}
                    onChange={(e) => setModuleFormData({ ...moduleFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Description (optional)"
                  />
                </form>
              </div>

              {/* Modules List */}
              <div className="space-y-3">
                {selectedCourse.modules?.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No modules added yet</p>
                ) : (
                  selectedCourse.modules?.map((module, index) => (
                    <div key={module.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{module.name}</h4>
                          <p className="text-sm text-gray-500">{module.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">{module.duration} hours</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Course?</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this course? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={saving}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader className="animate-spin" size={18} /> : null}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default Courses
