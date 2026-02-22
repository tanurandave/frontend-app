import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UserCheck,
  LogOut,
  Bell,
  Clock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react'

const Sidebar = ({ userRole }) => {
  const { user, logout } = useAuth()
  const { isCollapsed, toggleSidebar } = useSidebar()
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
    { to: '/trainer/courses', icon: BookOpen, label: 'Institute Courses' },
    { to: '/trainer/modules', icon: Clock, label: 'My Modules' },
    { to: '/trainer/schedule', icon: Calendar, label: 'Schedule' },
    { to: '/trainer/resources', icon: ClipboardList, label: 'Resources' },
  ]

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/notifications', icon: Bell, label: 'Notifications' },
    { to: '/student/view-courses', icon: BookOpen, label: 'View Courses' },
    { to: '/student/requests', icon: Clock, label: 'My Requests' },
  ]

  let links = studentLinks
  if (role === 'ADMIN') {
    links = adminLinks
  } else if (role === 'TRAINER') {
    links = trainerLinks
  }

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
            <GraduationCap className="text-white" size={24} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-black text-gray-900 leading-none tracking-tighter">NEXANOVA</h1>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">Training Hub</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/student' || link.to === '/trainer'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-100'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                } ${isCollapsed ? 'justify-center px-3' : ''}`
              }
              title={isCollapsed ? link.label : ''}
            >
              <link.icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{link.label}</span>}
              {/* Tooltip on hover when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none shadow-lg">
                  {link.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse Toggle & Logout */}
        <div className="p-3 border-t border-gray-100 space-y-1.5">
          <button
            onClick={toggleSidebar}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors group relative ${isCollapsed ? 'justify-center px-3' : ''
              }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} className="shrink-0" /> : <ChevronLeft size={20} className="shrink-0" />}
            {!isCollapsed && <span className="font-medium">Collapse</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none shadow-lg">
                Expand sidebar
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </button>
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors group relative ${isCollapsed ? 'justify-center px-3' : ''
              }`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none shadow-lg">
                Logout
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
