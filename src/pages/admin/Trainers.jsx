import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, Plus, Mail, User, Trash2, Edit } from 'lucide-react'
import { userAPI } from '../../api'

const Trainers = () => {
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getTrainers()
      setTrainers(response.data)
    } catch (error) {
      console.error('Error fetching trainers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTrainers = trainers.filter(trainer =>
    trainer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trainers</h1>
            <p className="text-gray-500 mt-1">Manage trainer accounts</p>
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search trainers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Trainer</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Email</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Role</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Created At</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredTrainers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">No trainers found</td>
                  </tr>
                ) : (
                  filteredTrainers.map((trainer) => (
                    <tr key={trainer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">
                            {trainer.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{trainer.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} />
                          {trainer.email}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {trainer.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {trainer.createdAt ? new Date(trainer.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Trainers
