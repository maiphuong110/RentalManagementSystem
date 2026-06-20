import api from './axiosInstance'

export const contractApi = {
  // Tạo hợp đồng nháp (Owner tạo khi chốt phòng)
  create: (data, ownerId) =>
    api.post('/api/contracts/create', data, { params: { ownerId } }),

  // Ký hợp đồng bằng mã OTP
  sign: (data) => api.post('/api/contracts/sign', data),

  // Lấy hợp đồng active của Tenant
  getActiveForTenant: (tenantId) => api.get(`/api/contracts/tenant/${tenantId}`),

  // Lấy hợp đồng active của Room (kèm thông tin khách thuê)
  getActiveForRoom: (roomId) => api.get(`/api/contracts/room/${roomId}/active`),
}
