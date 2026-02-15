import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { userAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import { Search, Plus, Mail, User, Trash2, Edit, X, AlertCircle, Loader, CheckCircle } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Students = () => {
  const { isAdmin } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const showToast = {
    success: (msg) => toast.success(msg),
    error: (msg) => toast.error(msg),
    info: (msg) => toast.info(msg)
  }

  useEffect(() => {
    if (!isAdmin) {
      showToast.error('Unauthorized access')
      return
    }
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getStudents()
      setStudents(response.data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      showToast.error('Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!editingId && !formData.password.trim()) {
      errors.password = 'Password is required'
    } else if (!editingId && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSaving(true)
      
      if (editingId) {
        // Update student
        await userAPI.update(editingId, {
          name: formData.name,
          email: formData.email,
          role: 'STUDENT'
        })
        
        setStudents(students.map(s => 
          s.id === editingId 
            ? { ...s, name: formData.name, email: formData.email }
            : s
        ))
        showToast.success('Student updated successfully!')
      } else {
        // Create new student
        const response = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'STUDENT'
        })
        
        // AuthResponse returns {token, email, name, role, userId} - not wrapped in 'user'
        const newUser = {
          id: response.data.userId,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }
        setStudents([...students, newUser])
        showToast.success('Student added successfully!')
      }

      setShowAddModal(false)
      setEditingId(null)
      setFormData({ name: '', email: '', password: '' })
      setFormErrors({})
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save student'
      showToast.error(errorMsg)
      setFormErrors({ submit: errorMsg })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (student) => {
    setEditingId(student.id)
    setFormData({
      name: student.name,
      email: student.email,
      password: ''
    })
    setShowAddModal(true)
    setFormErrors({})
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      setSaving(true)
      await userAPI.delete(deleteConfirm)
      setStudents(students.filter(s => s.id !== deleteConfirm))
      showToast.success('Student deleted successfully!')
      setDeleteConfirm(null)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete student'
      showToast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingId(null)
    setFormData({ name: '', email: '', password: '' })
    setFormErrors({})
  }

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="ADMIN" />
      
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
              <p className="text-gray-500 mt-1">Manage student accounts and enrollments</p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(true)
                setEditingId(null)
                setFormData({ name: '', email: '', password: '' })
                setFormErrors({})
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={20} />
              Add Student
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Search Bar */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader className="animate-spin text-blue-600" size={40} />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <User className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">
                  {students.length === 0 ? 'No students yet' : 'No students matching your search'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Joined</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold">
                              {student.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={16} />
                            {student.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(student.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded p-3 flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle size={18} />
                  {formErrors.submit}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {formErrors.name && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {formErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Password - Only show when adding new */}
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Minimum 6 characters"
                  />
                  {formErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
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
                  {saving ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update Student' : 'Add Student'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Student?</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this student? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
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
                  {saving ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
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

export default Students

