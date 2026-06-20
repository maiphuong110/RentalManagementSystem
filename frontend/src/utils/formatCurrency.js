/**
 * Định dạng số tiền thành chuỗi tiền tệ VND
 * @param {number} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng, ví dụ: "3.500.000đ"
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '0đ'
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

/**
 * Định dạng số tiền đầy đủ với đơn vị VNĐ
 * @param {number} amount
 * @returns {string} Ví dụ: "3.500.000 VNĐ"
 */
export function formatCurrencyFull(amount) {
  if (amount == null || isNaN(amount)) return '0 VNĐ'
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ'
}
