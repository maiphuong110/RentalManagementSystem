import api from './axiosInstance'

export const amenityApi = {
  // Lấy danh sách tất cả tiện ích
  getAll: () => api.get('/api/v1/amenities'),

  // Lấy chi tiết tiện ích
  getById: (id) => api.get(`/api/v1/amenities/${id}`),

  // Tạo tiện ích mới
  create: (data) => api.post('/api/v1/amenities', data),

  // Tạo nhiều tiện ích cùng lúc
  createBatch: (dataList) => api.post('/api/v1/amenities/batch', dataList),

  // Cập nhật tiện ích
  update: (id, data) => api.put(`/api/v1/amenities/${id}`, data),

  // Xóa tiện ích
  delete: (id) => api.delete(`/api/v1/amenities/${id}`),
}
