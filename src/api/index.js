import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getUser: (id) => api.get(`/auth/user/${id}`),
}

// User APIs (for admin to get all users)
export const userAPI = {
  getAll: () => api.get('/users'),
  getStudents: () => api.get('/users/role/STUDENT'),
  getTrainers: () => api.get('/users/role/TRAINER'),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
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
}

// Enrollment APIs
export const enrollmentAPI = {
  getAll: () => api.get('/enrollments'),
  enroll: (data) => api.post('/enrollments', data),
  getByStudent: (studentId) => api.get(`/enrollments/student/${studentId}`),
  getByCourse: (courseId) => api.get(`/enrollments/course/${courseId}`),
  delete: (id) => api.delete(`/enrollments/${id}`),
}

// Scheduling APIs
export const schedulingAPI = {
  createWeek: (data) => api.post('/scheduling/weeks', data),
  getAllWeeks: () => api.get('/scheduling/weeks'),
  getWeekById: (id) => api.get(`/scheduling/weeks/${id}`),
  createSlot: (weekId, data) => api.post(`/scheduling/weeks/${weekId}/slots`, data),
  getSlotsByWeek: (weekId) => api.get(`/scheduling/weeks/${weekId}/slots`),
  getSlotsByTrainer: (trainerId) => api.get(`/scheduling/trainers/${trainerId}/slots`),
  deleteSlot: (slotId) => api.delete(`/scheduling/slots/${slotId}`),
}

// Timetable APIs
export const timetableAPI = {
  getStudentTimetable: (studentId) => api.get(`/timetable/student/${studentId}`),
}

// Stats APIs
export const statsAPI = {
  getDashboardStats: () => api.get('/stats/dashboard'),
}

export default api
