import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userApi } from '../api/userApi'
import { getAssetUrl } from '../api/axiosInstance'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Upload,
  Camera,
  QrCode,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function ProfilePage() {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [cccdNumber, setCccdNumber] = useState('')

  // Upload states
  const [avatarFile, setAvatarFile] = useState(null)
  const [qrFile, setQrFile] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingQr, setUploadingQr] = useState(false)

  // Account deletion state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await userApi.getProfile()
      const data = res.data?.data || res.data
      setProfile(data)
      setFullName(data.fullName || '')
      setPhone(data.phone || '')
      setCccdNumber(data.cccdNumber || '')
    } catch (err) {
      setError('Không thể tải thông tin tài khoản.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      const payload = {
        fullName,
        phone,
        cccdNumber: cccdNumber || null,
      }
      
      const res = await userApi.updateProfile(payload)
      const updated = res.data?.data || res.data
      setProfile(updated)
      
      // Update local storage and AuthContext state
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setSuccess('Cập nhật thông tin hồ sơ thành công!')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật hồ sơ.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploadingAvatar(true)
      setError('')
      setSuccess('')
      const res = await userApi.uploadAvatar(file)
      const updated = res.data?.data || res.data
      setProfile(updated)
      
      // Update local storage and AuthContext state
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setSuccess('Cập nhật ảnh đại diện thành công!')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải ảnh đại diện lên.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleQrChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploadingQr(true)
      setError('')
      setSuccess('')
      const res = await userApi.uploadQrCode(file)
      const updated = res.data?.data || res.data
      setProfile(updated)
      
      // Update local storage and AuthContext state
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setSuccess('Cập nhật mã QR ngân hàng thành công!')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải mã QR lên.')
    } finally {
      setUploadingQr(false)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await userApi.deleteAccount()
      localStorage.clear()
      window.location.href = '/login'
    } catch (err) {
      setError('Không thể xóa tài khoản. Vui lòng liên hệ quản trị viên.')
      console.error(err)
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Đang tải thông tin hồ sơ..." />
  }

  const isOwner = profile?.role === 'owner' || profile?.role === 'OWNER'

  return (
    <div className="animate-fade-in max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Hồ sơ cá nhân</h1>
        <p className="text-sm text-surface-500 mt-1">Quản lý và cập nhật thông tin tài khoản của bạn</p>
      </div>

      {error && (
        <div className="p-3.5 bg-danger-50 text-danger-600 text-sm rounded-xl flex items-start gap-2.5">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-accent-50 text-accent-700 text-sm rounded-xl flex items-start gap-2.5">
          <CheckCircle size={18} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & QR Code */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-surface-100 border-2 border-surface-200 flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <img
                    src={getAssetUrl(profile.avatarUrl)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-surface-400" />
                )}
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            
            {uploadingAvatar && <p className="text-xs text-primary-600 mt-2 animate-pulse">Đang tải lên...</p>}
            
            <h3 className="font-bold text-surface-900 mt-4">{profile?.fullName}</h3>
            <p className="text-xs text-surface-400 mt-1">{profile?.email}</p>
            
            <div className="flex flex-col items-center gap-1.5 mt-3">
              <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary-700 uppercase">
                {profile?.role === 'owner' ? 'Chủ nhà (Owner)' : 'Người thuê (Tenant)'}
              </span>
              <span className="text-[11px] text-surface-500 font-medium px-2 py-0.5 bg-surface-100 rounded-md border border-surface-200">
                ID tài khoản: {profile?.userId}
              </span>
            </div>
          </div>

          {/* QR Code Card (Owner only) */}
          {isOwner && (
            <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm flex flex-col items-center text-center">
              <h4 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                <QrCode size={16} /> QR nhận thanh toán
              </h4>
              <div className="relative w-40 h-40 bg-surface-50 border border-surface-200 rounded-xl flex items-center justify-center overflow-hidden">
                {profile?.qrCodeUrl ? (
                  <img
                    src={getAssetUrl(profile.qrCodeUrl)}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-surface-400 p-4">
                    <QrCode size={36} className="stroke-1 mb-2" />
                    <span className="text-xs">Chưa có mã QR</span>
                  </div>
                )}
                
                <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="flex flex-col items-center text-xs gap-1">
                    <Upload size={18} />
                    Tải QR lên
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrChange}
                    className="hidden"
                    disabled={uploadingQr}
                  />
                </label>
              </div>
              
              {uploadingQr && <p className="text-xs text-primary-600 mt-2 animate-pulse">Đang tải lên...</p>}
              
              <p className="text-[11px] text-surface-400 mt-3 max-w-xs">
                Mã QR này sẽ hiển thị cho người thuê để quét chuyển khoản thanh toán tiền phòng/hóa đơn hàng tháng.
              </p>
            </div>
          )}

          {/* Delete Account */}
          <div className="bg-danger-50/50 rounded-2xl border border-danger-100 p-5 shadow-sm text-center">
            <h4 className="text-sm font-semibold text-danger-700">Yêu cầu xóa tài khoản</h4>
            <p className="text-xs text-surface-500 mt-1.5 leading-relaxed">
              Bạn có thể yêu cầu ngừng hoạt động và xóa thông tin tài khoản. Hành động này không thể khôi phục.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-4 flex items-center justify-center gap-1.5 px-4 py-2 mx-auto bg-danger-600 text-white text-xs font-semibold rounded-xl hover:bg-danger-700 transition-colors shadow-sm"
            >
              <Trash2 size={13} /> Xóa tài khoản
            </button>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-surface-900 pb-4 border-b border-surface-100 mb-5">
              Thông tin chi tiết
            </h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
                  <User size={16} className="text-surface-400" /> Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                  placeholder="Nhập họ và tên..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
                  <Mail size={16} className="text-surface-400" /> Địa chỉ Email
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-surface-400 text-sm outline-none cursor-not-allowed"
                />
                <span className="text-[11px] text-surface-400 block mt-1">
                  Email là tài khoản đăng nhập và không thể tự chỉnh sửa.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
                    <Phone size={16} className="text-surface-400" /> Số điện thoại *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                    placeholder="VD: 0912345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-2">
                    <CreditCard size={16} className="text-surface-400" /> Số CCCD / CMND
                  </label>
                  <input
                    type="text"
                    value={cccdNumber}
                    onChange={(e) => setCccdNumber(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                    placeholder="VD: 001085012345"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-surface-150 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-primary-600 text-white font-medium text-sm rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors shadow-lg shadow-primary-500/10"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản của mình? Mọi dữ liệu cá nhân liên quan của bạn sẽ bị gỡ bỏ. Hành động này không thể hoàn tác."
        confirmText="Xóa vĩnh viễn"
        danger
      />
    </div>
  )
}
