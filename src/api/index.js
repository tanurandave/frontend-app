import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    // Log the exact error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    })

    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getUser: (id) => api.get(`/auth/user/${id}`),
  resetPassword: (data) => api.post('/auth/forgot-password', data),
}

// User APIs (for admin to get all users)
export const userAPI = {
  getAll: () => api.get('/users'),
  getStudents: () => api.get('/users/students'),
  getTrainers: () => api.get('/users/trainers'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  bulkUpload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/users/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

// Course APIs
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  addModule: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  getModules: (courseId) => api.get(`/courses/${courseId}/modules`),
  deleteModule: (moduleId) => api.delete(`/courses/modules/${moduleId}`),
  updateModule: (moduleId, data) => api.put(`/courses/modules/${moduleId}`, data),
  getTrainers: (courseId) => api.get(`/courses/${courseId}/trainers`),
  uploadSyllabus: (courseId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/courses/${courseId}/syllabus`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getSyllabusUrl: (courseId) => `${API_BASE_URL}/courses/${courseId}/syllabus`,
  deleteSyllabus: (courseId) => api.delete(`/courses/${courseId}/syllabus`),
  downloadSyllabus: (courseId) => api.get(`/courses/${courseId}/syllabus`, { responseType: 'blob' }),
  getByTrainer: (trainerId) => api.get(`/courses/trainer/${trainerId}`),
}

// Enrollment APIs
export const enrollmentAPI = {
  getAll: () => api.get('/enrollments'),
  enroll: (data) => api.post('/enrollments', data),
  bulkEnroll: (data) => api.post('/enrollments/bulk', data),
  bulkUpload: (courseId, file) => {
    const formData = new FormData()
    formData.append('courseId', courseId)
    formData.append('file', file)
    return api.post('/enrollments/bulk-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getByStudent: (studentId) => api.get(`/enrollments/student/${studentId}`),
  getStudentCourses: (studentId) => api.get(`/enrollments/student/${studentId}/courses`),
  getByCourse: (courseId) => api.get(`/enrollments/course/${courseId}`),
  delete: (id) => api.delete(`/enrollments/${id}`),
  request: (data) => api.post('/enrollments/request', data),
  approve: (id) => api.put(`/enrollments/${id}/approve`),
  reject: (id) => api.put(`/enrollments/${id}/reject`),
}

// Scheduling APIs
export const schedulingAPI = {
  createWeek: (data) => api.post('/scheduling/weeks', data),
  getAllWeeks: () => api.get('/scheduling/weeks'),
  getWeekById: (id) => api.get(`/scheduling/weeks/${id}`),
  createSlot: (weekId, data) => api.post(`/scheduling/weeks/${weekId}/slots`, data),
  updateSlot: (weekId, slotId, data) => api.put(`/scheduling/weeks/${weekId}/slots/${slotId}`, data),
  getSlotsByWeek: (weekId) => api.get(`/scheduling/weeks/${weekId}/slots`),
  getSlotsByTrainer: (trainerId) => api.get(`/scheduling/trainers/${trainerId}/slots`),
  deleteSlot: (slotId) => api.delete(`/scheduling/slots/${slotId}`),
  updateSlotNotes: (slotId, notes) => api.put(`/scheduling/slots/${slotId}/notes`, notes, {
    headers: { 'Content-Type': 'text/plain' }
  }),
}

// Timetable APIs
export const timetableAPI = {
  getStudentTimetable: (studentId) => api.get(`/timetable/student/${studentId}`),
}

// Stats APIs
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
}

// Notification APIs
export const notificationAPI = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadNotifications: (userId) => api.get(`/notifications/user/${userId}/unread`),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
}

// Resource APIs (Assignments & Materials)
export const resourceAPI = {
  createAssignment: (formData) => api.post('/resources/assignments', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createMaterial: (formData) => api.post('/resources/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAssignmentsByCourse: (courseId) => api.get(`/resources/assignments/course/${courseId}`),
  getMaterialsByCourse: (courseId) => api.get(`/resources/materials/course/${courseId}`),
  getAssignmentsByTrainer: (trainerId) => api.get(`/resources/assignments/trainer/${trainerId}`),
  getMaterialsByTrainer: (trainerId) => api.get(`/resources/materials/trainer/${trainerId}`),
  submitAssignment: (id, formData) => api.post(`/resources/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getSubmissions: (id) => api.get(`/resources/assignments/${id}/submissions`),
  deleteAssignment: (id) => api.delete(`/resources/assignments/${id}`),
  deleteMaterial: (id) => api.delete(`/resources/materials/${id}`),
  downloadAssignment: (id) => api.get(`/resources/assignments/${id}/download`, { responseType: 'blob' }),
  downloadMaterial: (id) => api.get(`/resources/materials/${id}/download`, { responseType: 'blob' }),
}

export default api
