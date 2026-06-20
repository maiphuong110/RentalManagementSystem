import api from './axiosInstance'

export const notificationApi = {
  // Lấy danh sách thông báo (phân trang)
  getAll: (page = 0, size = 20) =>
    api.get('/api/v1/notifications', { params: { page, size } }),

  // Đếm thông báo chưa đọc
  getUnreadCount: () => api.get('/api/v1/notifications/unread-count'),

  // Đánh dấu 1 thông báo đã đọc
  markAsRead: (id) => api.put(`/api/v1/notifications/${id}/read`),

  // Đánh dấu tất cả đã đọc
  markAllAsRead: () => api.put('/api/v1/notifications/read-all'),
}
