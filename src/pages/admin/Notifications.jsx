import Sidebar from '../../components/Sidebar'
import { useSidebar } from '../../context/SidebarContext'

const AdminNotifications = () => {
    const { isPinned, isHovering } = useSidebar()
    return (
        <div className="flex bg-gray-50 min-h-screen overflow-hidden">
            <Sidebar userRole="ADMIN" />
            <div className={`flex-1 ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'} p-8 transition-all duration-300`}>
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-2">Manage your notifications here.</p>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No new notifications</h3>
                        <p className="text-gray-500 mt-2">You're all caught up!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminNotifications
