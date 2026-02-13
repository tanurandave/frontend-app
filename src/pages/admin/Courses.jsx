import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, Plus, BookOpen, Trash2, Edit } from 'lucide-react'
import { courseAPI } from '../../api'

const Courses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await courseAPI.getAll()
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
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
          <button className="btn-primary flex items-center gap-2">
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
                    <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.name}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {course.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {course.modules?.length || 0} modules
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    Active
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

export default Courses
