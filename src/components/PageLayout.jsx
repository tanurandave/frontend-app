import { useSidebar } from '../context/SidebarContext'

const PageLayout = ({ children, className = '' }) => {
    const { isCollapsed } = useSidebar()

    return (
        <div
            className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-64'
                } ${className}`}
        >
            {children}
        </div>
    )
}

export default PageLayout
