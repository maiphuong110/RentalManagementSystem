import api from './axiosInstance'

export const authApi = {
  // Đăng ký tài khoản mới
  register: (data) => api.post('/api/v1/auth/register', data),

  // Đăng nhập
  login: (data) => api.post('/api/v1/auth/login', data),

  // Làm mới token
  refresh: (data) => api.post('/api/v1/auth/refresh', data),

  // Đăng xuất (thu hồi refresh token hiện tại)
  logout: (data) => api.post('/api/v1/auth/logout', data),

  // Đăng xuất tất cả thiết bị
  logoutAll: () => api.post('/api/v1/auth/logout-all'),
}
