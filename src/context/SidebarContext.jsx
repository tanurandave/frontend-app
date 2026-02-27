import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export const SidebarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isPinned, setIsPinned] = useState(() => {
        try {
            const v = localStorage.getItem('sidebar.pinned')
            return v === 'true'
        } catch (e) {
            return false
        }
    })

    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        try {
            localStorage.setItem('sidebar.pinned', isPinned ? 'true' : 'false')
        } catch (e) {
            // ignore
        }
    }, [isPinned])

    const toggleSidebar = () => setIsCollapsed(prev => !prev)
    const togglePin = () => {
        setIsPinned(prev => {
            const next = !prev
            if (next) {
                // when pinned, ensure sidebar is expanded
                setIsCollapsed(false)
            }
            return next
        })
    }

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar, isPinned, setIsPinned, togglePin, isHovering, setIsHovering }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}
