import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { Search, Plus, User, BookOpen, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { enrollmentAPI, userAPI, courseAPI } from '../../api'

const Enrollments = () => {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        userAPI.getStudents(),
        courseAPI.getAll(),
        enrollmentAPI.getAll()
      ])
      setStudents(studentsRes.data)
      setCourses(coursesRes.data)
      setEnrollments(enrollmentsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId)
    return student ? student.name : 'Unknown'
  }

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId)
    return course ? course.name : 'Unknown'
  }

  const filteredEnrollments = enrollments.filter(enrollment => 
    getStudentName(enrollment.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCourseName(enrollment.courseId).toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enrollments</h1>
            <p className="text-gray-500 mt-1">Manage student course enrollments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-primary-600" size={20} />
              Select Student
            </h3>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a student</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>{student.name}</option>
              ))}
            </select>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="text-primary-600" size={20} />
              Select Course
            </h3>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="input-field"
            >
              <option value="">Choose a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          <div className="glass-card p-6 flex items-end">
            <button 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={!selectedStudent || !selectedCourse}
            >
              <Plus size={20} />
              Enroll Student
            </button>
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search enrollments..."
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
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Student</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-600">Course</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">Enrollment Date</th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">No enrollments found</td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold">
                            {getStudentName(enrollment.studentId).charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{getStudentName(enrollment.studentId)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-700">{getCourseName(enrollment.courseId)}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Calendar size={14} />
                          {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <XCircle size={18} />
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

export default Enrollments
