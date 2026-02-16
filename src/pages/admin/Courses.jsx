import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { Plus, BookOpen, Trash2, Edit, X, Loader, FolderOpen, Search, Clock, MoreVertical, LayoutGrid, List } from 'lucide-react'
import { courseAPI } from '../../api'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Courses = () => {
  const navigate = useNavigate()
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
        orderNumber: (selectedCourse.modules?.length || 0) + 1
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
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar userRole="ADMIN" />
      <div className="flex-1 flex flex-col ml-64">
        <Header />

        <div className="flex-1 overflow-auto p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-500">Manage your course catalog</p>
            </div>
            <button
              onClick={() => { setEditingCourse(null); setFormData({ name: '', description: '', duration: '' }); setShowAddModal(true); }}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition font-medium shadow-sm hover:shadow-md"
            >
              <Plus size={18} />
              Add New Course
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 border-l border-gray-100 pl-4 ml-4">
              <button className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or add a new course.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => navigate(`/admin/courses/${course.id}`)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group flex flex-col h-full cursor-pointer"
                >
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center shadow-sm">
                        <BookOpen size={24} />
                      </div>
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={course.name}>{course.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{course.description || 'No description provided.'}</p>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                        <Clock size={14} className="text-orange-500" />
                        {course.duration} Hours
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                        <FolderOpen size={14} className="text-blue-500" />
                        {course.modules?.length || 0} Modules
                      </div>
                    </div>
                  </div>

                  <div
                    className="p-4 border-t border-gray-50 bg-gray-50/30 rounded-b-2xl flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openModulesModal(course)}
                      className="flex-1 text-xs font-semibold bg-white border border-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      Manage Modules
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(course.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
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
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Full Stack Development"
                />
                {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${formErrors.duration ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., 120"
                  min="1"
                />
                {formErrors.duration && <p className="text-red-500 text-sm mt-1">{formErrors.duration}</p>}
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Modules - {selectedCourse.name}</h2>
                <p className="text-gray-500 text-sm">{selectedCourse.modules?.length || 0} modules</p>
              </div>
              <button onClick={closeModuleModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Add Module Form */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Module</h3>
                <form onSubmit={handleAddModule} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={moduleFormData.name}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent col-span-2"
                      placeholder="Module Name / Title *"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={moduleFormData.duration}
                      onChange={(e) => setModuleFormData({ ...moduleFormData, duration: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Hours to teach *"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    <div key={module.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{module.name}</h4>
                          <p className="text-xs text-gray-500">{module.description || 'No description'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium text-gray-600 bg-gray-200 px-2 py-1 rounded-md">{module.duration}h</span>
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Course?</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this course? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
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
