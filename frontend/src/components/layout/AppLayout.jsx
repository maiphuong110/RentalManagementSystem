import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, isOwner } = useAuth()

  return (
    <div className={`min-h-screen bg-surface-50 ${isOwner ? 'owner-theme' : ''}`}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main content area */}
      <main className={`${isAuthenticated ? 'lg:ml-64' : ''} pt-16 min-h-screen`}>
        <div className="p-4 lg:p-6 max-w-7xl mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
