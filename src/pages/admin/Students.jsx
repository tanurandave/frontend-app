import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { userAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import Table from '../../components/ui/Table'
import { Plus, Mail, Trash2, Edit, X, AlertCircle, Loader, CheckCircle, Upload } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Students = () => {
  const { isAdmin } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

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

  const handleBulkUpload = async (e) => {
    e.preventDefault()
    if (!uploadFile) {
      showToast.error('Please select a file')
      return
    }

    const formData = new FormData()
    formData.append('file', uploadFile)

    try {
      setUploading(true)
      setUploadResult(null)
      const response = await userAPI.bulkUpload(uploadFile)
      setUploadResult(response.data)
      showToast.success(response.data.message)
      fetchStudents() // Refresh list
    } catch (error) {
      console.error('Upload failed:', error)
      showToast.error(error.response?.data?.message || 'Bulk upload failed')
    } finally {
      setUploading(false)
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

  const columns = [
    {
      header: 'Profile',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            {item.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500">+1 9876543210</p>
          </div>
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (item) => <span className="text-gray-600">{item.email}</span>
    },
    {
      header: 'Created at',
      accessor: 'createdAt',
      render: (item) => <span className="text-gray-600">{item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}</span>
    },
    {
      header: 'Updated by',
      accessor: 'updatedBy', // Generic for now
      render: () => <span className="text-gray-600">Admin</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      render: () => (
        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium border border-green-100">
          Active
        </span>
      )
    }
  ]

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar userRole="ADMIN" />

      <div className="flex-1 flex flex-col ml-64">
        <Header />

        <div className="flex-1 overflow-auto p-8">
          <Table
            title="Students List"
            columns={columns}
            data={filteredStudents}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            actions={
              <>
                <button
                  onClick={() => {
                    setShowUploadModal(true)
                    setUploadFile(null)
                    setUploadResult(null)
                  }}
                  className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition font-medium text-sm shadow-sm"
                >
                  <Upload size={16} />
                  Bulk Upload
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(true)
                    setEditingId(null)
                    setFormData({ name: '', email: '', password: '' })
                    setFormErrors({})
                  }}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition font-medium text-sm shadow-sm"
                >
                  <Plus size={16} />
                  Add Student
                </button>
              </>
            }
            renderRow={(item) => (
              <>
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50">
                  <Plus size={18} /> {/* Using Plus as View icon placeholder if Eye not imported or similar */}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            pagination={{
              currentPage: 1,
              totalPages: 1, // Implement real pagination if needed
              totalItems: filteredStudents.length,
              itemsPerPage: 10,
              onPageChange: () => { }
            }}
          />
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Bulk Upload Students</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {!uploadResult ? (
                <form onSubmit={handleBulkUpload}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV / Excel File</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={(e) => setUploadFile(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center pointer-events-none">
                        <Upload className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-sm text-gray-600 font-medium">{uploadFile ? uploadFile.name : 'Click to upload or drag and drop'}</p>
                        <p className="text-xs text-gray-400 mt-1">CSV, Excel files only</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!uploadFile || uploading}
                      className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2 font-medium"
                    >
                      {uploading ? (
                        <>
                          <Loader size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : 'Upload Students'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Complete!</h3>
                    <p className="text-gray-600">{uploadResult.message}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                      <p className="text-2xl font-bold text-gray-800">{uploadResult.totalRecords}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-xs text-green-600 uppercase font-bold tracking-wider">Success</p>
                      <p className="text-2xl font-bold text-green-700">{uploadResult.successfulRecords}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl">
                      <p className="text-xs text-red-600 uppercase font-bold tracking-wider">Failed</p>
                      <p className="text-2xl font-bold text-red-700">{uploadResult.failedRecords}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadResult(null)
                      setUploadFile(null)
                    }}
                    className="w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="John Doe"
                />
                {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="john@example.com"
                />
                {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
              </div>

              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Minimum 6 characters"
                  />
                  {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t border-gray-100">
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
                  {saving ? (
                    <>
                      <Loader className="animate-spin" size={18} />
                      Saving...
                    </>
                  ) : (
                    editingId ? 'Update' : 'Add Student'
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Student?</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition flex items-center gap-2"
                >
                  {saving ? 'Deleting...' : 'Delete'}
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
