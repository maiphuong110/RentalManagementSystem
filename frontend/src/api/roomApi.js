import api from './axiosInstance'

export const roomApi = {
  // Tìm kiếm phòng trọ (dành cho Tenant)
  search: (params) => api.get('/api/v1/rooms/search', { params }),

  // Lấy danh sách phòng thuộc một khu trọ
  getByProperty: (propertyId) => api.get(`/api/v1/rooms/property/${propertyId}`),

  // Lấy chi tiết phòng
  getById: (id) => api.get(`/api/v1/rooms/${id}`),

  // Thêm phòng mới
  create: (data) => api.post('/api/v1/rooms', data),

  // Cập nhật toàn bộ thông tin phòng
  update: (id, data) => api.put(`/api/v1/rooms/${id}`, data),

  // Đổi trạng thái phòng nhanh
  updateStatus: (id, newStatus) =>
    api.patch(`/api/v1/rooms/${id}/status`, null, { params: { newStatus } }),

  // Cập nhật/thêm tiện ích cho phòng
  patchAmenity: (id, data) => api.patch(`/api/v1/rooms/${id}/amenities`, data),

  // Xóa tiện ích khỏi phòng
  removeAmenity: (roomId, amenityId) =>
    api.delete(`/api/v1/rooms/${roomId}/amenities/${amenityId}`),

  // Xóa mềm phòng
  delete: (id) => api.delete(`/api/v1/rooms/${id}`),

  // Lấy danh sách tiện ích của phòng
  getAmenities: (id) => api.get(`/api/v1/rooms/${id}/amenities`),
}
