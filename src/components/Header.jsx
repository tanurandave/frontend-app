import { useState, useEffect, useRef } from 'react'
import { Search, Bell, Settings, X, Check, User as UserIcon, Calendar, BookOpen } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationAPI } from '../api'

const Header = ({ title }) => {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showNotifications, setShowNotifications] = useState(false)
    const notificationRef = useRef(null)

    useEffect(() => {
        if (user?.id) {
            fetchNotifications()
            // Optional: Poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [user?.id])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await notificationAPI.getUserNotifications(user.id)
            setNotifications(res.data)
            setUnreadCount(res.data.filter(n => !n.read).length)
        } catch (error) {
            console.error("Failed to fetch notifications", error)
        }
    }

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id)
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark notification as read", error)
        }
    }

    const markAllRead = async () => {
        try {
            await notificationAPI.markAllAsRead(user.id)
            setNotifications(notifications.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Failed to mark all as read", error)
        }
    }

    // Helper for time ago - if date-fns not available, use simple formatter or just date string
    const timeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search.."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6 ml-4">
                <div className="flex items-center gap-4 relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-12 right-0 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        <Check size={12} /> Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Bell size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-sm">No notifications yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 ${!notification.read ? 'bg-orange-50/30' : ''}`}
                                            >
                                                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Bell size={14} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm leading-snug mb-1 ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">
                                                            {timeAgo(notification.createdAt)}
                                                        </span>
                                                        {!notification.read && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(notification.id);
                                                                }}
                                                                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-gray-50 bg-gray-50/50 text-center">
                                <button className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                                    View Service Status
                                </button>
                            </div>
                        </div>
                    )}

                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
                        <Settings size={20} />
                    </button>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                        {/* Placeholder for user image */}
                        <div className="w-full h-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header
