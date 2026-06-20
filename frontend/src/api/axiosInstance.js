import axios from 'axios'

let rawURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
if (rawURL && !rawURL.startsWith('http://') && !rawURL.startsWith('https://') && !rawURL.startsWith('//')) {
  const protocol = rawURL.includes('localhost') || rawURL.includes('127.0.0.1') ? 'http' : 'https'
  rawURL = `${protocol}://${rawURL}`
}
const baseURL = rawURL

const api = axios.create({
  // Nếu không nhận biến môi trường, lấy luôn link Backend thật
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== Request Interceptor: Tự động đính kèm JWT Token =====
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ===== Response Interceptor: Auto Refresh Token khi 401 =====
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Không retry cho các endpoint auth
      if (originalRequest.url?.includes('/api/v1/auth/')) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Đợi refresh xong rồi retry
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        // Không có refresh token → logout
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
          refreshToken,
        })

        const newAccessToken = data.data.accessToken
        const newRefreshToken = data.data.refreshToken

        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export const getAssetUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${baseURL}${cleanPath}`
}

export default api
