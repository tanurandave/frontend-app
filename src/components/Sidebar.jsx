import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSidebar } from '../context/SidebarContext'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  Calendar, UserCheck, LogOut, Bell, Clock, ClipboardList,
  Pin, X, ChevronRight
} from 'lucide-react'
import { useEffect } from 'react'

const Sidebar = ({ userRole }) => {
  const { user, logout } = useAuth()
  const { isPinned, togglePin, isHovering, setIsHovering, mobileOpen, setMobileOpen } = useSidebar()
  const location = useLocation()

  // Desktop: collapsed = icons-only when not pinned and not hovering
  const collapsed = !isPinned && !isHovering
  const role = userRole || user?.role

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

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
  if (role === 'ADMIN') links = adminLinks
  else if (role === 'TRAINER') links = trainerLinks

  // ─── Shared nav content (used in both desktop sidebar & mobile drawer) ───
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="relative px-5 py-5 border-b border-gray-100 flex items-center gap-3">
        {/* Pin button – desktop only */}
        {!isMobile && isHovering && (
          <button
            onClick={(e) => { e.stopPropagation(); togglePin() }}
            className={`absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${isPinned ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600'
              } shadow-sm`}
            title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
          >
            <Pin size={15} />
          </button>
        )}

        {/* Close button – mobile only */}
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        )}

        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-orange-200">
          <GraduationCap className="text-white" size={22} />
        </div>
        {(!collapsed || isMobile) && (
          <div className="overflow-hidden">
            <h1 className="text-lg font-black text-gray-900 leading-none tracking-tight">NEXANOVA</h1>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Training Hub</p>
          </div>
        )}
      </div>

      {/* Role badge – mobile only */}
      {isMobile && (
        <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">{role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {isMobile && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pb-2">Navigation</p>
        )}
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/admin' || link.to === '/student' || link.to === '/trainer'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${isActive
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'text-gray-500 hover:bg-orange-50 hover:text-orange-600'
              } ${collapsed && !isMobile ? 'justify-center' : ''}`
            }
            title={collapsed && !isMobile ? link.label : ''}
          >
            <link.icon size={20} className="shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="font-medium text-sm whitespace-nowrap flex-1">{link.label}</span>
            )}
            {/* Arrow on mobile */}
            {isMobile && (
              <ChevronRight size={14} className="text-current opacity-40 shrink-0" />
            )}
            {/* Tooltip – desktop collapsed only */}
            {collapsed && !isMobile && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none shadow-lg">
                {link.label}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer: user info (desktop expanded) + Logout */}
      <div className="px-3 py-3 border-t border-gray-100 space-y-1">
        {/* User info – desktop expanded only */}
        {!collapsed && !isMobile && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-orange-50">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] font-medium text-orange-500 truncate">{role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors group relative ${collapsed && !isMobile ? 'justify-center' : ''
            }`}
          title={collapsed && !isMobile ? 'Logout' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {(!collapsed || isMobile) && <span className="font-medium text-sm">Logout</span>}
          {collapsed && !isMobile && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-[60] pointer-events-none shadow-lg">
              Logout
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────────── */}
      <aside
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`hidden md:block fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm z-50 transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'
          }`}
      >
        <SidebarContent isMobile={false} />
      </aside>

      {/* ── Mobile Backdrop ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ───────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-[70] md:hidden transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <SidebarContent isMobile={true} />
      </aside>
    </>
  )
}

export default Sidebar
