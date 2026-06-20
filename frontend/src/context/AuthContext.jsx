import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/authApi'
import { userApi } from '../api/userApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Khôi phục session từ localStorage khi app khởi động
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.clear()
      }
    }
    setLoading(false)
  }, [])

  // Đăng nhập
  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password })
    const { accessToken, refreshToken, user: userData } = res.data.data
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  // Đăng ký
  const register = useCallback(async (data) => {
    const res = await authApi.register(data)
    return res.data
  }, [])

  // Đăng xuất
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authApi.logout({ refreshToken })
      }
    } catch {
      // Bỏ qua lỗi khi logout
    } finally {
      localStorage.clear()
      setUser(null)
    }
  }, [])

  // Cập nhật thông tin user trong context
  const refreshProfile = useCallback(async () => {
    try {
      const res = await userApi.getProfile()
      const userData = res.data.data
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch {
      return null
    }
  }, [])

  // Kiểm tra role
  const isOwner = user?.role === 'owner' || user?.role === 'OWNER'
  const isTenant = user?.role === 'tenant' || user?.role === 'TENANT'
  const isAuthenticated = !!user

  const value = {
    user,
    loading,
    isAuthenticated,
    isOwner,
    isTenant,
    login,
    register,
    logout,
    refreshProfile,
    setUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider')
  }
  return context
}
