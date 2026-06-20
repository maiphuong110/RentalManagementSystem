import api from './axiosInstance'

export const billApi = {
  // Tạo hóa đơn từ bản ghi chỉ số điện/nước
  generateFromRecord: (roomId, month, year, elecCurrent, waterCurrent, elecPrevious, waterPrevious) =>
    api.post('/api/bills/generate-from-record', null, {
      params: { roomId, month, year, elecCurrent, waterCurrent, elecPrevious, waterPrevious },
    }),

  // Lấy bản ghi chỉ số điện nước mới nhất
  getLatestRecord: (roomId) =>
    api.get('/api/bills/latest-record', {
      params: { roomId },
    }),

  // Lấy tất cả hóa đơn của khách thuê
  getBillsForTenant: (tenantId) =>
    api.get(`/api/bills/tenant/${tenantId}`),

  // Lấy tất cả hóa đơn của phòng trọ
  getBillsForRoom: (roomId) =>
    api.get(`/api/bills/room/${roomId}`),

  // Cập nhật trạng thái thanh toán hóa đơn
  updateBillStatus: (billId, status, paymentProofUrl) =>
    api.put(`/api/bills/${billId}/status`, null, {
      params: { status, paymentProofUrl },
    }),

  // Lấy chi tiết hóa đơn theo ID
  getById: (billId) =>
    api.get(`/api/bills/${billId}`),

  // Upload ảnh minh chứng chuyển khoản (multipart/form-data)
  uploadProof: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/bills/upload-proof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

