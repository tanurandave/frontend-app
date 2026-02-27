import { useSidebar } from '../context/SidebarContext'

const PageLayout = ({ children, className = '' }) => {
    const { isPinned, isHovering } = useSidebar()

    return (
        <div
            className={`flex-1 transition-all duration-300 ease-in-out overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${(isPinned || isHovering) ? 'ml-64' : 'ml-20'
                } ${className}`}
        >
            {children}
        </div>
    )
}

export default PageLayout
