import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/owner/DashboardPage'
import PropertiesPage from './pages/owner/PropertiesPage'
import RoomsPage from './pages/owner/RoomsPage'
import RoomDetailPage from './pages/owner/RoomDetailPage'
import PostsPage from './pages/owner/PostsPage'
import OwnerContractsPage from './pages/owner/ContractsPage'
import BillsPage from './pages/owner/BillsPage'
import TenantHomePage from './pages/tenant/TenantHomePage'
import PostDetailPage from './pages/tenant/PostDetailPage'
import MyRoomPage from './pages/tenant/MyRoomPage'
import MyBillsPage from './pages/tenant/MyBillsPage'
import TenantContractsPage from './pages/tenant/ContractsPage'
import ChatPage from './pages/ChatPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  const { loading, isAuthenticated, isOwner } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Đang khởi động TroSmart..." />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public: Login / Register */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={isOwner ? '/owner/dashboard' : '/tenant'} replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* App Layout (Available to both public visitors and logged-in users) */}
      <Route element={<AppLayout />}>
        {/* ===== PUBLIC TENANT Routes ===== */}
        <Route path="/tenant" element={<TenantHomePage />} />
        <Route path="/tenant/posts/:postId" element={<PostDetailPage />} />

        {/* ===== PROTECTED Routes ===== */}
        {/* OWNER Routes */}
        <Route path="/owner/dashboard" element={<ProtectedRoute requiredRole="owner"><DashboardPage /></ProtectedRoute>} />
        <Route path="/owner/properties" element={<ProtectedRoute requiredRole="owner"><PropertiesPage /></ProtectedRoute>} />
        <Route path="/owner/rooms" element={<ProtectedRoute requiredRole="owner"><RoomsPage /></ProtectedRoute>} />
        <Route path="/owner/rooms/:roomId" element={<ProtectedRoute requiredRole="owner"><RoomDetailPage /></ProtectedRoute>} />
        <Route path="/owner/posts" element={<ProtectedRoute requiredRole="owner"><PostsPage /></ProtectedRoute>} />
        <Route path="/owner/contracts" element={<ProtectedRoute requiredRole="owner"><OwnerContractsPage /></ProtectedRoute>} />
        <Route path="/owner/bills" element={<ProtectedRoute requiredRole="owner"><BillsPage /></ProtectedRoute>} />

        {/* TENANT Protected Routes */}
        <Route path="/tenant/my-room" element={<ProtectedRoute requiredRole="tenant"><MyRoomPage /></ProtectedRoute>} />
        <Route path="/tenant/bills" element={<ProtectedRoute requiredRole="tenant"><MyBillsPage /></ProtectedRoute>} />
        <Route path="/tenant/contracts" element={<ProtectedRoute requiredRole="tenant"><TenantContractsPage /></ProtectedRoute>} />

        {/* SHARED Protected Routes */}
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      </Route>

      {/* Redirect root */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={isOwner ? '/owner/dashboard' : '/tenant'} replace />
          ) : (
            <Navigate to="/tenant" replace />
          )
        }
      />

      {/* Redirect all other paths to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
