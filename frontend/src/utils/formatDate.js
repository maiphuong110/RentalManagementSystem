/**
 * Định dạng ngày tháng theo kiểu Việt Nam
 * @param {string|Date} dateStr - Chuỗi ngày hoặc Date object
 * @returns {string} Chuỗi đã định dạng, ví dụ: "03/06/2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Định dạng ngày giờ đầy đủ
 * @param {string|Date} dateStr
 * @returns {string} Ví dụ: "03/06/2026 14:30"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Định dạng thời gian tương đối (vừa xong, 5 phút trước, ...)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function timeAgo(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  if (diffHr < 24) return `${diffHr} giờ trước`
  if (diffDay < 7) return `${diffDay} ngày trước`
  return formatDate(dateStr)
}
