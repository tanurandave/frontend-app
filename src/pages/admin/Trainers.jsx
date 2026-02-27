import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api, { userAPI } from '../../api'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import { useSidebar } from '../../context/SidebarContext'
import Table from '../../components/ui/Table'
import { Plus, Mail, Trash2, Edit, X, AlertCircle, Loader, Eye, User, Calendar, Shield, Briefcase, Award } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Trainers = () => {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const { isPinned, isHovering } = useSidebar()
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
  const [viewingProfile, setViewingProfile] = useState(null)

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

  const columns = [
    {
      header: 'Profile',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/admin/trainers/${item.id}`)}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-110 transition-transform">
            {item.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900 hover:text-green-600 transition-colors">{item.name}</p>
            <p className="text-xs text-gray-500">ID: {item.id}</p>
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
      header: 'Specialization',
      accessor: 'specialization',
      render: (item) => <span className="font-medium text-gray-800">{item.specialization || 'General'}</span>
    },
    {
      header: 'Experience',
      accessor: 'experience',
      render: (item) => <span className="text-gray-600">{item.experience || '0'} Years</span>
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

      <div className={`flex-1 flex flex-col ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <Header />

        <div className="flex-1 overflow-auto p-8">
          <Table
            title="Trainers List"
            columns={columns}
            data={filteredTrainers}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            actions={
              <button
                onClick={() => {
                  setShowAddModal(true)
                  setEditingId(null)
                  setFormData({ name: '', email: '', password: '', specialization: '', experience: '' })
                  setFormErrors({})
                }}
                className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition font-medium text-sm shadow-sm"
              >
                <Plus size={16} />
                Add Trainer
              </button>
            }
            renderRow={(item) => (
              <>
                <button
                  onClick={() => navigate(`/admin/trainers/${item.id}`)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                  title="View Full Profile"
                >
                  <Eye size={18} />
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
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Trainer' : 'Add New Trainer'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="John Smith"
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
                  placeholder="trainer@example.com"
                />
                {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g., Python"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                <input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="5"
                  min="0"
                  max="50"
                />
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
                    editingId ? 'Update' : 'Add Trainer'
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trainer?</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to delete this trainer? This action cannot be undone.</p>

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

export default Trainers
