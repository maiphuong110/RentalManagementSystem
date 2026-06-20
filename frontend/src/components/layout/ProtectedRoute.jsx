import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

/**
 * Component bảo vệ route:
 * - Chuyển hướng đến /login nếu chưa đăng nhập
 * - Chuyển hướng nếu role không khớp
 * @param {string} requiredRole - 'owner' hoặc 'tenant' (không bắt buộc)
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole) {
    const userRole = user?.role?.toLowerCase()
    if (userRole !== requiredRole.toLowerCase()) {
      // Chuyển hướng về trang phù hợp với role
      const redirectPath = userRole === 'owner' ? '/owner/dashboard' : '/tenant'
      return <Navigate to={redirectPath} replace />
    }
  }

  return children
}
