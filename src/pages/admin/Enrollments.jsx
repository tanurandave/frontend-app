import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import Header from '../../components/Header'
import Table from '../../components/ui/Table'
import { Search, Plus, User, BookOpen, Calendar, CheckCircle, XCircle, Users, Check, Trash2, Eye, Clock } from 'lucide-react'
import { enrollmentAPI, userAPI, courseAPI } from '../../api'

const Enrollments = () => {
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  // Sorting & Selection
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState([])
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'pending'

  // Bulk Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [studentSearchTerm, setStudentSearchTerm] = useState('')

  // Table Search
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

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
      setMessage({ type: 'error', text: 'Failed to load data. Please try again.' })
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

  const toggleStudent = (studentId) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId))
    } else {
      setSelectedStudentIds(prev => [...prev, studentId])
    }
  }

  const selectAllFiltered = () => {
    const filteredIds = filteredStudents.map(s => s.id)
    const newSelected = [...new Set([...selectedStudentIds, ...filteredIds])]
    setSelectedStudentIds(newSelected)
  }

  const deselectAllFiltered = () => {
    const filteredIds = filteredStudents.map(s => s.id)
    setSelectedStudentIds(prev => prev.filter(id => !filteredIds.includes(id)))
  }

  const handleEnroll = async () => {
    if (selectedStudentIds.length === 0 || !selectedCourse) return

    try {
      setIsSubmitting(true)
      setMessage({ type: '', text: '' })

      await enrollmentAPI.bulkEnroll({
        studentIds: selectedStudentIds,
        courseId: parseInt(selectedCourse)
      })

      setMessage({ type: 'success', text: `Successfully enrolled ${selectedStudentIds.length} student(s)!` })
      fetchData()
      setSelectedStudentIds([])
      // Keep selected course for easier multiple batch enrollments
    } catch (error) {
      console.error('Enrollment error:', error)
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to enroll students.' })
    } finally {
      setIsSubmitting(false)
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  const handleDeleteEnrollment = async (id) => {
    if (!window.confirm('Are you sure you want to remove this enrollment?')) return

    try {
      await enrollmentAPI.delete(id)
      fetchData()
      setMessage({ type: 'success', text: 'Enrollment removed successfully' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error deleting enrollment:', error)
      setMessage({ type: 'error', text: 'Failed to delete enrollment' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleApprove = async (id) => {
    try {
      await enrollmentAPI.approve(id)
      setMessage({ type: 'success', text: 'Enrollment Approved!' })
      fetchData()
    } catch (error) {
      console.error('Error approving:', error)
      setMessage({ type: 'error', text: 'Failed to approve enrollment' })
    } finally {
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this enrollment request?')) return
    try {
      await enrollmentAPI.reject(id)
      setMessage({ type: 'success', text: 'Enrollment Rejected' })
      fetchData()
    } catch (error) {
      console.error('Error rejecting:', error)
      setMessage({ type: 'error', text: 'Failed to reject enrollment' })
    } finally {
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEnrollmentIds(filteredEnrollments.map(e => e.id))
    } else {
      setSelectedEnrollmentIds([])
    }
  }

  const handleSelectRow = (id) => {
    if (selectedEnrollmentIds.includes(id)) {
      setSelectedEnrollmentIds(prev => prev.filter(item => item !== id))
    } else {
      setSelectedEnrollmentIds(prev => [...prev, id])
    }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedEnrollmentIds.length} enrollments?`)) return

    try {
      // In a real app we'd have a bulk delete API, but for now we iterate
      // Or if backend supports it. Assuming single delete for now.
      // Ideally backend should support bulk delete.
      // But user asked for "delete option" in the list.
      // Let's loop for now if API doesn't support bulk.
      // api/index.js shows delete(id).

      await Promise.all(selectedEnrollmentIds.map(id => enrollmentAPI.delete(id)))

      setMessage({ type: 'success', text: `Successfully deleted ${selectedEnrollmentIds.length} enrollments` })
      fetchData()
      setSelectedEnrollmentIds([])
    } catch (error) {
      console.error('Bulk delete error:', error)
      setMessage({ type: 'error', text: 'Failed to delete some enrollments' })
    } finally {
      setTimeout(() => setMessage({ type: '', text: '' }), 5000)
    }
  }

  // Calculate Stats
  const totalEnrollments = enrollments.length
  const totalStudents = students.length
  const totalCourses = courses.length
  const activeStudentCount = new Set(enrollments.map(e => e.studentId)).size

  // Filter & Sort Logic
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch =
      getStudentName(enrollment.studentId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseName(enrollment.courseId).toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === 'pending') {
      return matchesSearch && enrollment.status === 'PENDING'
    } else {
      // Active tab shows Approved (and maybe legacy ones which default to approved in backend mapping)
      return matchesSearch && (enrollment.status === 'APPROVED' || !enrollment.status)
    }
  })

  if (sortConfig.key) {
    filteredEnrollments.sort((a, b) => {
      let aValue, bValue
      if (sortConfig.key === 'studentId') {
        aValue = getStudentName(a.studentId).toLowerCase()
        bValue = getStudentName(b.studentId).toLowerCase()
      } else if (sortConfig.key === 'courseId') {
        aValue = getCourseName(a.courseId).toLowerCase()
        bValue = getCourseName(b.courseId).toLowerCase()
      } else {
        aValue = a[sortConfig.key]
        bValue = b[sortConfig.key]
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase())
  )

  const columns = [
    {
      header: 'Student',
      accessor: 'studentId',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {getStudentName(item.studentId).charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="block font-bold text-gray-900 text-sm">{getStudentName(item.studentId)}</span>
            <span className="text-xs text-gray-500">ID: {item.studentId}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Course',
      accessor: 'courseId',
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {getCourseName(item.courseId)}
        </span>
      )
    },
    {
      header: 'Enrolled On',
      accessor: 'enrolledAt',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
          <Calendar size={14} className="text-gray-400" />
          {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString() : '-'}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => {
        const status = item.status || 'APPROVED'
        const styles = {
          APPROVED: 'bg-green-50 text-green-700 border-green-200',
          PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          REJECTED: 'bg-red-50 text-red-700 border-red-200'
        }
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.APPROVED}`}>
            {status}
          </span>
        )
      }
    }
  ]

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans relative">
      <Sidebar userRole="ADMIN" />
      <div className="flex-1 ml-64 flex flex-col transition-all duration-300">
        <Header />

        <div className="flex-1 overflow-auto p-8 relative">
          {/* Toast Notification */}
          {/* Reusing message state for toast */}
          {message.text && (
            <div className={`
                  fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-slide-in transition-all duration-300 transform translate-y-0 opacity-100
                  ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-900/90 backdrop-blur-md text-white border border-gray-800'}
              `}>
              {message.type === 'error' ? <XCircle size={20} className="text-red-500" /> : <CheckCircle size={20} className="text-green-400" />}
              <div className="flex flex-col">
                <span className="font-semibold text-sm">{message.type === 'error' ? 'Error' : 'Success'}</span>
                <span className="text-sm opacity-90">{message.text}</span>
              </div>
              <button
                onClick={() => setMessage({ type: '', text: '' })}
                className="ml-4 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <XCircle size={16} className="opacity-60 hover:opacity-100" />
              </button>
            </div>
          )}

          <header className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Enrollment Management</h1>
            <p className="text-gray-500 mt-2">Manage course assignments and track student progress.</p>
          </header>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalEnrollments}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Students</p>
                <h3 className="text-2xl font-bold text-gray-900">{activeStudentCount}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <h3 className="text-2xl font-bold text-gray-900">{enrollments.filter(e => e.status === 'PENDING').length}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Available Courses</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalCourses}</h3>
              </div>
            </div>
          </div>

          {/* Bulk Enrollment Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-10">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">New Enrollment</h2>
                <p className="text-sm text-gray-500 mt-1">Select students and assign a course to enroll them.</p>
              </div>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Bulk Action
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Student Selection (Keep existing specialized UI) */}
              <div className="lg:col-span-7 flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Select Students
                    {selectedStudentIds.length > 0 && (
                      <span className="ml-2 bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">
                        {selectedStudentIds.length} Selected
                      </span>
                    )}
                  </label>
                  <div className="flex gap-2">
                    <button onClick={selectAllFiltered} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-md transition-colors">Select All</button>
                    <button onClick={deselectAllFiltered} className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors">Clear Selection</button>
                  </div>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search students by name or email..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-3 custom-scrollbar">
                  {filteredStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <User size={40} className="mb-3 opacity-30" />
                      <p className="text-sm font-medium">No students found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {filteredStudents.map(student => (
                        <div
                          key={student.id}
                          onClick={() => toggleStudent(student.id)}
                          className={`
                            relative flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 border
                            ${selectedStudentIds.includes(student.id)
                              ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
                              : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'}
                            `}
                        >
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 transition-colors
                            ${selectedStudentIds.includes(student.id) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}
                            `}>
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-semibold truncate ${selectedStudentIds.includes(student.id) ? 'text-indigo-900' : 'text-gray-900'}`}>{student.name}</p>
                            <p className="text-xs text-gray-500 truncate">{student.email}</p>
                          </div>
                          {selectedStudentIds.includes(student.id) && (
                            <div className="absolute top-2 right-2 text-indigo-600">
                              <CheckCircle size={14} fill="currentColor" className="text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Course & Submit */}
              <div className="lg:col-span-5 flex flex-col h-[500px]">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <span className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Select Course
                  </label>
                  <div className="bg-gray-50 p-1 rounded-xl border border-gray-200 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {courses.length === 0 ? (
                      <p className="text-center py-4 text-gray-500 text-sm">No courses available.</p>
                    ) : (
                      <div className="space-y-1">
                        {courses.map(course => (
                          <div
                            key={course.id}
                            onClick={() => setSelectedCourse(course.id.toString())}
                            className={`
                                p-3 rounded-lg cursor-pointer transition-all border flex items-center gap-3
                                ${selectedCourse === course.id.toString()
                                ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500 z-10'
                                : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'}
                                `}
                          >
                            <div className={`p-2 rounded-lg ${selectedCourse === course.id.toString() ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                              <BookOpen size={18} />
                            </div>
                            <div>
                              <p className={`text-sm font-semibold ${selectedCourse === course.id.toString() ? 'text-gray-900' : 'text-gray-700'}`}>{course.name}</p>
                              <span className="text-xs text-gray-500">{course.duration} Hours</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-gray-500">Students Selected:</span>
                      <span className="font-semibold text-gray-900">{selectedStudentIds.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Course Selected:</span>
                      <span className="font-semibold text-gray-900 text-right truncate w-40">
                        {selectedCourse ? courses.find(c => c.id.toString() === selectedCourse)?.name : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="h-6 mb-2">
                    {message.text && (
                      <div className={`flex items-center gap-2 text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {message.type === 'error' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        {message.text}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEnroll}
                    disabled={selectedStudentIds.length === 0 || !selectedCourse || isSubmitting}
                    className={`
                        w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2
                        transition-all duration-200
                        ${selectedStudentIds.length === 0 || !selectedCourse || isSubmitting
                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/25 active:scale-[0.98]'}
                    `}
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Confirm Enrollment
                        <Check size={18} strokeWidth={3} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enrollments List */}
          <div className="mb-6 flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-3 px-4 text-sm font-bold transition-all relative
                    ${activeTab === 'active' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}
                `}
            >
              Active Enrollments
              {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-3 px-4 text-sm font-bold transition-all relative flex items-center gap-2
                    ${activeTab === 'pending' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}
                `}
            >
              Pending Requests
              {enrollments.filter(e => e.status === 'PENDING').length > 0 && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full">
                  {enrollments.filter(e => e.status === 'PENDING').length}
                </span>
              )}
              {activeTab === 'pending' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
            </button>
          </div>

          <Table
            title={activeTab === 'active' ? "Active Enrollments" : "Pending Requests"}
            columns={columns}
            data={filteredEnrollments}
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            sortConfig={sortConfig}
            onSort={handleSort}
            selectedIds={selectedEnrollmentIds}
            onSelectAll={handleSelectAll}
            onSelectRow={handleSelectRow}
            actions={
              selectedEnrollmentIds.length > 0 ? (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete ({selectedEnrollmentIds.length})
                </button>
              ) : <></>
            }
            renderRow={(item) => (
              activeTab === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition-all"
                    title="Approve"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-all"
                    title="Reject"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleDeleteEnrollment(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                  title="Remove enrollment"
                >
                  <Trash2 size={18} />
                </button>
              )
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default Enrollments
