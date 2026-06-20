import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Home,
  Building2,
  Sparkles,
  CheckCircle2
} from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()

  // State
  const [isLogin, setIsLogin] = useState(location.state?.register ? false : true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Form State
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'tenant', // Default to tenant
  })
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleRoleChange = (selectedRole) => {
    setForm(prev => ({ ...prev, role: selectedRole }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!isLogin && form.password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const user = await login(form.email, form.password)
        const role = user?.role?.toLowerCase()
        if (location.state?.redirectTo) {
          navigate(location.state.redirectTo)
        } else {
          navigate(role === 'owner' ? '/owner/dashboard' : '/tenant')
        }
      } else {
        await register(form)
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập.')
        setIsLogin(true)
        setForm({ ...form, password: '', fullName: '', phone: '' })
        setConfirmPassword('')
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

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans selection:bg-primary-500 selection:text-white">
      {/* LEFT COLUMN: Showcases features & branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 text-white flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center justify-start z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide border border-white/5">
            <Sparkles size={12} className="text-[#ffdc00]" />
            Nền tảng quản lý phòng trọ thế hệ mới
          </span>
        </div>

        {/* Center Content: Big Logo & Left-aligned Text */}
        <div className="my-auto space-y-6 z-10 max-w-lg mx-auto text-left flex flex-col items-start w-full">
          {/* Huge Glowing Logo */}
          <div className="flex items-center gap-2 cursor-pointer select-none mb-2 animate-scale-in" onClick={() => navigate('/')}>
            <span className="text-6xl lg:text-7xl font-black text-white tracking-wider drop-shadow-md">RENT</span>
            <span className="text-6xl lg:text-7xl font-black text-[#ffdc00] drop-shadow-md">+</span>
          </div>

          <div className="space-y-4 w-full">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug text-white whitespace-nowrap">
              Quản lý thông minh, Tìm phòng dễ dàng.
            </h1>
            <p className="text-base text-white/80 font-medium leading-relaxed max-w-md">
              Giải pháp toàn diện hỗ trợ kết nối chủ nhà trọ và khách thuê phòng. Tự động hóa hóa đơn, số điện nước và quản lý hợp đồng điện tử nhanh chóng.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-white/60 z-10 flex justify-between items-center border-t border-white/10 pt-6">
          <span>© 2026 RENT+. Bảo lưu mọi quyền.</span>
          <a href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</a>
        </div>
      </div>

      {/* RIGHT COLUMN: Modern Clean Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white min-h-screen relative">
        {/* Back navigation button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-150 transition-colors border border-surface-200 shadow-sm flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft size={14} />
          Trở về trang chủ
        </button>

        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Header Description */}
          <div className="text-center md:text-left space-y-2">
            <h2 className="text-2xl font-extrabold text-surface-900 tracking-tight">
              {isLogin ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-sm text-surface-500 font-medium">
              {isLogin ? 'Nhập thông tin đăng nhập của bạn để tiếp tục' : 'Bắt đầu hành trình quản lý phòng trọ của bạn'}
            </p>
          </div>

          {/* Toggle pill: Đăng nhập / Đăng ký */}
          <div className="relative flex bg-surface-100 p-1.5 rounded-xl border border-surface-200">
            {/* Sliding backdrop */}
            <div
              className="absolute top-1.5 bottom-1.5 bg-white rounded-lg shadow-sm transition-all duration-300"
              style={{
                width: 'calc(50% - 6px)',
                left: isLogin ? '6px' : '50%',
              }}
            />
            <button
              type="button"
              onClick={() => {
                setIsLogin(true)
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-2 text-xs font-bold text-center z-10 transition-colors cursor-pointer rounded-lg ${
                isLogin ? 'text-primary-600' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              ĐĂNG NHẬP
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false)
                setError('')
                setSuccess('')
              }}
              className={`flex-1 py-2 text-xs font-bold text-center z-10 transition-colors cursor-pointer rounded-lg ${
                !isLogin ? 'text-primary-600' : 'text-surface-500 hover:text-surface-700'
              }`}
            >
              ĐĂNG KÝ
            </button>
          </div>

          {/* Success / Error Banners */}
          {error && (
            <div className="p-4 bg-danger-50 border border-danger-200 text-danger-600 text-xs font-semibold rounded-xl animate-scale-in">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-success-50 border border-success-200 text-success-600 text-xs font-semibold rounded-xl animate-scale-in">
              {success}
            </div>
          )}

          {/* Role selector tab: Khách thuê / Chủ trọ */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-450 uppercase tracking-wider">Vai trò của bạn</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('tenant')}
                className={`py-3 px-4 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  form.role === 'tenant'
                    ? 'border-primary-500 bg-primary-50/50 text-primary-600 shadow-sm'
                    : 'border-surface-200 bg-white text-surface-600 hover:bg-surface-50'
                }`}
              >
                <Home size={15} />
                KHÁCH THUÊ
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('owner')}
                className={`py-3 px-4 border rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                  form.role === 'owner'
                    ? 'border-primary-500 bg-primary-50/50 text-primary-600 shadow-sm'
                    : 'border-surface-200 bg-white text-surface-600 hover:bg-surface-50'
                }`}
              >
                <Building2 size={15} />
                CHỦ TRỌ
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fullname input (Only on register) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-450 uppercase tracking-wider">Họ và tên</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-surface-300 rounded-xl text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                </div>
              </div>
            )}

            {/* Phone input (Only on register) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-450 uppercase tracking-wider">Số điện thoại</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="0912345678"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-surface-300 rounded-xl text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                </div>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-450 uppercase tracking-wider">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-surface-300 rounded-xl text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-surface-450 uppercase tracking-wider">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-surface-300 rounded-xl text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password input (Only on register) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-surface-450 uppercase tracking-wider">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white border border-surface-300 rounded-xl text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                </div>
              </div>
            )}

            {/* Forgot password (Only on login) */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => alert('Chức năng quên mật khẩu tạm thời chưa hỗ trợ.')}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 active:scale-[0.98] transition-all shadow-md shadow-primary-500/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xử lý...
                </>
              ) : isLogin ? (
                'Đăng nhập'
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
