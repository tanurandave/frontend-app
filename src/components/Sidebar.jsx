import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UserCheck,
  LogOut,
  Bell
} from 'lucide-react'

const Sidebar = ({ userRole }) => {
  const { user, logout } = useAuth()
  const role = userRole || user?.role

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/students', icon: Users, label: 'Students' },
    { to: '/admin/trainers', icon: GraduationCap, label: 'Trainers' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
    { to: '/admin/scheduling', icon: Calendar, label: 'Scheduling' },
    { to: '/admin/enrollments', icon: UserCheck, label: 'Enrollments' },
  ]

  const trainerLinks = [
    { to: '/trainer', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/trainer/modules', icon: BookOpen, label: 'My Modules' },
    { to: '/trainer/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/trainer/profile', icon: UserCheck, label: 'My Profile' },
  ]

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
  ]

  let links = studentLinks
  if (role === 'ADMIN') {
    links = adminLinks
  } else if (role === 'TRAINER') {
    links = trainerLinks
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-50">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gradient">Training Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Management System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/student' || link.to === '/trainer'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
