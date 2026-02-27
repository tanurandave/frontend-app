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
  ClipboardList,
  Pin
} from 'lucide-react'
import { useState } from 'react'

const Sidebar = ({ userRole }) => {
  const { user, logout } = useAuth()
  const { isCollapsed, isPinned, togglePin, isHovering, setIsHovering } = useSidebar()
  // When pinned, sidebar stays expanded. When not pinned, show icons-only when NOT hovering,
  // and expand to show labels while hovering.
  const collapsed = !isPinned && !isHovering
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
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`fixed left-0 top-0 h-full bg-white  border-r border-gray-200 shadow-sm z-50 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'
        }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo / Pin */}
        <div className="relative p-6 border-b border-gray-100 flex items-center gap-3">
          {isHovering && (
            <button
              onClick={(e) => { e.stopPropagation(); togglePin(); }}
              className={`absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-md transition-colors ${isPinned ? 'bg-orange-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'} shadow-sm`}
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
            >
              <Pin size={16} />
            </button>
          )}

          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-200">
            <GraduationCap className="text-white" size={24} />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-black text-gray-900 leading-none tracking-tighter">NEXANOVA</h1>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1">Training Hub</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/student' || link.to === '/trainer'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${isActive
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-100'
                  : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                } ${collapsed ? 'justify-center px-3' : ''}`
              }
              title={collapsed ? link.label : ''}
            >
              <link.icon size={20} className="shrink-0" />
              {!collapsed && <span className="font-medium whitespace-nowrap">{link.label}</span>}
              {/* Tooltip on hover when collapsed */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none shadow-lg">
                  {link.label}
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 space-y-1.5">
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors group relative ${collapsed ? 'justify-center px-3' : ''
              }`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
            {collapsed && (
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
