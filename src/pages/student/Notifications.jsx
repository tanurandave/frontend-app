import { useState, useEffect } from 'react'
import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'
import { useAuth } from '../../context/AuthContext'
import { Bell, Check, CheckCheck, Clock, BookOpen, Calendar, Info } from 'lucide-react'
import { notificationAPI } from '../../api'
import { toast } from 'react-toastify'

const Notifications = () => {
    const { user } = useAuth()
    const { isCollapsed } = useSidebar()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user?.id) fetchNotifications()
    }, [user?.id])

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            const res = await notificationAPI.getUserNotifications(user.id)
            setNotifications(res.data || [])
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (notifId) => {
        try {
            await notificationAPI.markAsRead(notifId)
            setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true } : n))
        } catch (error) {
            toast.error('Failed to mark notification as read')
        }
    }

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'course': return <BookOpen size={18} className="text-blue-500" />
            case 'schedule': return <Calendar size={18} className="text-purple-500" />
            default: return <Info size={18} className="text-gray-500" />
        }
    }

    return (
        <div className="flex bg-gray-50 min-h-screen font-sans">
            <Sidebar />
            <main className={`flex-1 ${isCollapsed ? 'ml-20' : 'ml-64'} p-8 transition-all duration-300`}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-gray-500 text-sm">Stay updated with the latest alerts</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
                            <Bell size={48} className="mx-auto text-gray-200 mb-4" />
                            <h3 className="text-lg font-bold text-gray-400">No notifications yet</h3>
                            <p className="text-gray-400 text-sm mt-1">You'll see updates here when they arrive</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`bg-white rounded-2xl p-5 border transition-all ${notif.read ? 'border-gray-100 opacity-70' : 'border-primary-100 shadow-sm'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? 'bg-gray-50' : 'bg-primary-50'}`}>
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-sm ${notif.read ? 'text-gray-500' : 'text-gray-900'}`}>
                                                {notif.title || 'Notification'}
                                            </h4>
                                            <p className="text-gray-500 text-sm mt-1">{notif.message}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(notif.createdAt).toLocaleString()}
                                                </span>
                                                {notif.read ? (
                                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                                        <CheckCheck size={12} /> Read
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                                                    >
                                                        <Check size={12} /> Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Notifications
