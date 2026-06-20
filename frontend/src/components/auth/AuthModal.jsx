import { useState } from 'react'
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'

export default function AuthModal({ isOpen, onClose, onSuccess, initialTab = 'login' }) {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(initialTab === 'login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'tenant',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        const loggedInUser = await login(form.email, form.password)
        onSuccess?.(loggedInUser)
        onClose()
      } else {
        await register(form)
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
        setIsLogin(true)
        setForm({ ...form, password: '', fullName: '', phone: '' })
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data ||
        'Đã xảy ra lỗi. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const toggleTab = (loginTab) => {
    setIsLogin(loginTab)
    setError('')
    setSuccess('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLogin ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'} size="sm">
      <div className="w-full">
        {/* Toggle tabs */}
        <div className="flex bg-surface-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => toggleTab(true)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              isLogin
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => toggleTab(false)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              !isLogin
                ? 'bg-white text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-600 rounded-xl text-sm animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-accent-50 border border-accent-200 text-accent-700 rounded-xl text-sm animate-fade-in">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (register only) */}
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Họ và tên
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  required={!isLogin}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                required
                minLength={8}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Phone (register only) */}
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Role Selector (register only) */}
          {!isLogin && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
                Bạn là ai?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'tenant' })}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    form.role === 'tenant'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-surface-200 hover:border-surface-300 text-surface-600'
                  }`}
                >
                  <User size={20} className="mx-auto mb-1" />
                  <span className="text-xs font-semibold">Người thuê</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'owner' })}
                  className={`p-2 rounded-xl border-2 text-center transition-all ${
                    form.role === 'owner'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-surface-200 hover:border-surface-300 text-surface-600'
                  }`}
                >
                  <Home size={20} className="mx-auto mb-1" />
                  <span className="text-xs font-semibold">Chủ nhà trọ</span>
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 transition-all"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo accounts info */}
        {isLogin && (
          <div className="mt-4 p-3 bg-surface-100 rounded-xl">
            <p className="text-[10px] font-semibold text-surface-500 mb-1">TÀI KHOẢN DEMO</p>
            <div className="space-y-0.5 text-[11px] text-surface-600">
              <p><span className="font-medium">Chủ trọ:</span> owner@trosmart.vn / TroSmart@2026</p>
              <p><span className="font-medium">Người thuê:</span> khoa@gmail.com / TroSmart@2026</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
