import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import api, { userAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import { Search, Plus, Mail, User, Trash2, Edit, X, AlertCircle, Loader, Award } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Trainers = () => {
  const { isAdmin } = useAuth()
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: ''
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
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getTrainers()
      setTrainers(response.data || [])
    } catch (error) {
      console.error('Error fetching trainers:', error)
      showToast.error('Failed to fetch trainers')
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

  const handleAddTrainer = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSaving(true)
      
      if (editingId) {
        // Update trainer
        await userAPI.update(editingId, {
          name: formData.name,
          email: formData.email,
          specialization: formData.specialization,
          experience: formData.experience,
          role: 'TRAINER'
        })
        
        setTrainers(trainers.map(t => 
          t.id === editingId 
            ? { 
              ...t, 
              name: formData.name, 
              email: formData.email,
              specialization: formData.specialization,
              experience: formData.experience
            }
            : t
        ))
        showToast.success('Trainer updated successfully!')
      } else {
        // Create new trainer
        const response = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          specialization: formData.specialization,
          experience: formData.experience,
          role: 'TRAINER'
        })
        
        const newTrainer = response.data.user || response.data
        if (newTrainer) {
          setTrainers([...trainers, newTrainer])
          showToast.success('Trainer added successfully!')
        }
      }

      setShowAddModal(false)
      setEditingId(null)
      setFormData({ name: '', email: '', password: '', specialization: '', experience: '' })
      setFormErrors({})
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to save trainer'
      showToast.error(errorMsg)
      setFormErrors({ submit: errorMsg })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (trainer) => {
    setEditingId(trainer.id)
    setFormData({
      name: trainer.name,
      email: trainer.email,
      password: '',
      specialization: trainer.specialization || '',
      experience: trainer.experience || ''
    })
    setShowAddModal(true)
    setFormErrors({})
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      setSaving(true)
      await userAPI.delete(deleteConfirm)
      setTrainers(trainers.filter(t => t.id !== deleteConfirm))
      showToast.success('Trainer deleted successfully!')
      setDeleteConfirm(null)
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete trainer'
      showToast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingId(null)
    setFormData({ name: '', email: '', password: '', specialization: '', experience: '' })
    setFormErrors({})
  }

  const filteredTrainers = trainers.filter(trainer =>
    trainer && (trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole="ADMIN" />
      
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trainers Management</h1>
              <p className="text-gray-500 mt-1">Manage trainer accounts and assignments</p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(true)
                setEditingId(null)
                setFormData({ name: '', email: '', password: '', specialization: '', experience: '' })
                setFormErrors({})
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Plus size={20} />
              Add Trainer
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

          {/* Trainers Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader className="animate-spin text-blue-600" size={40} />
              </div>
            ) : filteredTrainers.length === 0 ? (
              <div className="text-center py-12">
                <Award className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">
                  {trainers.length === 0 ? 'No trainers yet' : 'No trainers matching your search'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Trainer</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Specialization</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Experience</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTrainers.map((trainer) => (
                      <tr key={trainer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-600 to-green-400 flex items-center justify-center text-white font-bold">
                              {trainer.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{trainer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail size={16} />
                            {trainer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 font-medium">
                            {trainer.specialization || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">
                            {trainer.experience ? `${trainer.experience} years` : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(trainer)}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(trainer.id)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Trainer' : 'Add New Trainer'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddTrainer} className="p-6 space-y-4">
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
                  placeholder="John Smith"
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
                  placeholder="trainer@example.com"
                />
                {formErrors.email && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Web Development, Python"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 5"
                  min="0"
                  max="70"
                />
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
                    editingId ? 'Update Trainer' : 'Add Trainer'
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
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Trainer?</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this trainer? This action cannot be undone.
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

export default Trainers
