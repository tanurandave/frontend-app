import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminTrainers from './pages/admin/Trainers'
import AdminCourses from './pages/admin/Courses'
import AdminCourseDetails from './pages/admin/CourseDetails'
import AdminScheduling from './pages/admin/Scheduling'
import AdminEnrollments from './pages/admin/Enrollments'
import AdminNotifications from './pages/admin/Notifications'
import AdminStudentDetails from './pages/admin/StudentDetails'
import AdminTrainerDetails from './pages/admin/TrainerDetails'
import TrainerDashboard from './pages/trainer/Dashboard'
import TrainerModules from './pages/trainer/Modules'
import TrainerSchedule from './pages/trainer/Schedule'
import TrainerProfile from './pages/trainer/Profile'
import TrainerNotifications from './pages/trainer/Notifications'
import TrainerCourses from './pages/trainer/Courses'
import TrainerCourseDetails from './pages/trainer/CourseDetails'
import TrainerResources from './pages/trainer/Resources'
import StudentDashboard from './pages/student/Dashboard'
import StudentNotifications from './pages/student/Notifications'
import StudentViewCourses from './pages/student/ViewCourses'
import StudentRequests from './pages/student/Requests'
import StudentCourseContent from './pages/student/CourseContent'
import PrivateRoute from './components/PrivateRoute'
import { SidebarProvider } from './context/SidebarContext'

function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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
            <Route path="/admin/students/:id" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminStudentDetails />
              </PrivateRoute>
            } />
            <Route path="/admin/trainers/:id" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminTrainerDetails />
              </PrivateRoute>
            } />
            <Route path="/admin/courses" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminCourses />
              </PrivateRoute>
            } />
            <Route path="/admin/courses/:id" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminCourseDetails />
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
            <Route path="/admin/notifications" element={
              <PrivateRoute allowedRoles={['ADMIN']}>
                <AdminNotifications />
              </PrivateRoute>
            } />

            {/* Trainer Routes */}
            <Route path="/trainer" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerDashboard />
              </PrivateRoute>
            } />
            <Route path="/trainer/modules" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerModules />
              </PrivateRoute>
            } />
            <Route path="/trainer/schedule" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerSchedule />
              </PrivateRoute>
            } />
            <Route path="/trainer/profile" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerProfile />
              </PrivateRoute>
            } />
            <Route path="/trainer/notifications" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerNotifications />
              </PrivateRoute>
            } />
            <Route path="/trainer/courses" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerCourses />
              </PrivateRoute>
            } />
            <Route path="/trainer/courses/:id" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerCourseDetails />
              </PrivateRoute>
            } />
            <Route path="/trainer/resources" element={
              <PrivateRoute allowedRoles={['TRAINER']}>
                <TrainerResources />
              </PrivateRoute>
            } />

            {/* Student Routes */}
            <Route path="/student" element={
              <PrivateRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </PrivateRoute>
            } />
            <Route path="/student/notifications" element={
              <PrivateRoute allowedRoles={['STUDENT']}>
                <StudentNotifications />
              </PrivateRoute>
            } />
            <Route path="/student/view-courses" element={
              <PrivateRoute allowedRoles={['STUDENT']}>
                <StudentViewCourses />
              </PrivateRoute>
            } />
            <Route path="/student/requests" element={
              <PrivateRoute allowedRoles={['STUDENT']}>
                <StudentRequests />
              </PrivateRoute>
            } />
            <Route path="/student/courses/:id" element={
              <PrivateRoute allowedRoles={['STUDENT']}>
                <StudentCourseContent />
              </PrivateRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  )
}

export default App
