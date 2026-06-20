import api from './axiosInstance'

export const propertyApi = {
  // Lấy danh sách khu trọ của một chủ trọ
  getAll: (ownerId) => api.get('/api/v1/properties', { params: { ownerId } }),

  // Lấy chi tiết một khu trọ
  getById: (id) => api.get(`/api/v1/properties/${id}`),

  // Tạo mới khu trọ
  create: (data) => api.post('/api/v1/properties', data),

  // Cập nhật khu trọ
  update: (id, data) => api.put(`/api/v1/properties/${id}`, data),

  // Xóa khu trọ
  delete: (id) => api.delete(`/api/v1/properties/${id}`),

  // Lấy danh sách tiện ích của khu trọ
  getAmenities: (id) => api.get(`/api/v1/properties/${id}/amenities`),
}
