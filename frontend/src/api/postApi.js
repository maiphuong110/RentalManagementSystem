import api from './axiosInstance'

export const postApi = {
  // Tạo tin đăng mới
  create: (data) => api.post('/api/posts', data),

  // Lấy danh sách tin đăng (lọc theo status)
  getAll: (status = 'all') => api.get('/api/posts', { params: { status } }),

  // Lấy chi tiết tin đăng
  getById: (postId) => api.get(`/api/posts/${postId}`),

  // Cập nhật tin đăng
  update: (postId, data) => api.put(`/api/posts/${postId}`, data),

  // Xóa tin đăng
  delete: (postId) => api.delete(`/api/posts/${postId}`),

  // Upload ảnh cho tin đăng (multipart/form-data)
  uploadImage: (postId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/api/posts/${postId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // Lấy danh sách ảnh của tin đăng
  getImages: (postId) => api.get(`/api/posts/${postId}/images`),

  // Xóa ảnh khỏi tin đăng
  deleteImage: (postId, imageId) =>
    api.delete(`/api/posts/${postId}/images/${imageId}`),
}
