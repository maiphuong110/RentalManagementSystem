import api from './axiosInstance'

export const userApi = {
  // Lấy thông tin profile của user đang đăng nhập
  getProfile: () => api.get('/api/v1/users/me'),

  // Cập nhật thông tin cá nhân
  updateProfile: (data) => api.put('/api/v1/users/me', data),

  // Upload ảnh đại diện (multipart/form-data)
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Upload QR code ngân hàng (chỉ Owner)
  uploadQrCode: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/v1/users/me/qr-code', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Xóa tài khoản (soft delete)
  deleteAccount: () => api.delete('/api/v1/users/me'),

  // Lấy thông tin user bất kỳ theo ID (công khai)
  getById: (id) => api.get(`/api/v1/users/${id}`),
}
