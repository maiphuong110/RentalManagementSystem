import api from './axiosInstance'

export const chatApi = {
  // Tạo hoặc lấy cuộc trò chuyện đã tồn tại
  getOrCreate: (data) => api.post('/api/v1/conversations', data),

  // Lấy danh sách cuộc trò chuyện của user hiện tại
  getMyConversations: () => api.get('/api/v1/conversations'),

  // Lấy chi tiết 1 cuộc hội thoại
  getOne: (id) => api.get(`/api/v1/conversations/${id}`),

  // Lấy tin nhắn trong cuộc hội thoại (phân trang)
  getMessages: (id, page = 0, size = 20) =>
    api.get(`/api/v1/conversations/${id}/messages`, {
      params: { page, size },
    }),

  // Gửi tin nhắn
  sendMessage: (id, data) =>
    api.post(`/api/v1/conversations/${id}/messages`, data),

  // Lấy tổng số tin nhắn chưa đọc
  getUnreadCount: () => api.get('/api/v1/conversations/unread-count'),
}
