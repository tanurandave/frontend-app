import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminTrainers from './pages/admin/Trainers'
import AdminCourses from './pages/admin/Courses'
import AdminScheduling from './pages/admin/Scheduling'
import AdminEnrollments from './pages/admin/Enrollments'
import StudentDashboard from './pages/student/Dashboard'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/students" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminStudents />
            </PrivateRoute>
          } />
          <Route path="/admin/trainers" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminTrainers />
            </PrivateRoute>
          } />
          <Route path="/admin/courses" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminCourses />
            </PrivateRoute>
          } />
          <Route path="/admin/scheduling" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminScheduling />
            </PrivateRoute>
          } />
          <Route path="/admin/enrollments" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <AdminEnrollments />
            </PrivateRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <StudentDashboard />
            </PrivateRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
