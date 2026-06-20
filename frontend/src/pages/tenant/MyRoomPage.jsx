import { useState, useEffect } from 'react'
import {
  Home, BedDouble, Maximize2, Zap, Droplets, Wifi, Phone, Mail,
  Building2, AlertCircle, Search, RefreshCw,
} from 'lucide-react'
import { roomApi } from '../../api/roomApi'
import { contractApi } from '../../api/contractApi'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import AmenityIcon from '../../components/ui/AmenityIcon'

export default function MyRoomPage() {
  const { user } = useAuth()
  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMyRoom()
  }, [])

  const fetchMyRoom = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Lấy hợp đồng đang hoạt động của khách thuê này
      const contractRes = await contractApi.getActiveForTenant(user.userId)
      const contract = contractRes.data?.data || contractRes.data
      
      if (contract && contract.status === 'active' && (contract.roomId || contract.room_id)) {
        const roomId = contract.roomId || contract.room_id
        // 2. Tải thông tin phòng trọ tương ứng từ hợp đồng
        const roomRes = await roomApi.getById(roomId)
        const roomData = roomRes.data?.data || roomRes.data
        setRoom(roomData)
      } else {
        setRoom(null)
      }
    } catch (err) {
      console.error('Error fetching tenant room:', err)
      setRoom(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" text="Đang tải thông tin phòng..." />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <Home size={24} className="text-primary-600" />
          Phòng của tôi
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Thông tin phòng trọ bạn đang thuê
        </p>
      </div>

      {room ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room details card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary-500 to-accent-500" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-surface-900">
                    Phòng {room.roomNumber}
                  </h2>
                  <p className="text-sm text-surface-500 flex items-center gap-1.5 mt-1">
                    <Building2 size={15} /> {room.propertyName}
                  </p>
                </div>
                <span className="px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-xs font-semibold">
                  Đang thuê
                </span>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 mb-1">
                    <Maximize2 size={16} />
                    <span className="text-xs font-medium">Diện tích</span>
                  </div>
                  <p className="text-lg font-bold text-surface-900">{room.areaSqm} m²</p>
                </div>
                <div className="bg-surface-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 mb-1">
                    <BedDouble size={16} />
                    <span className="text-xs font-medium">Sức chứa</span>
                  </div>
                  <p className="text-lg font-bold text-surface-900">Tối đa {room.maxCapacity} người</p>
                </div>
                <div className="bg-surface-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 mb-1">
                    <Zap size={16} />
                    <span className="text-xs font-medium">Tiền điện</span>
                  </div>
                  <p className="text-lg font-bold text-surface-900">
                    {formatCurrency(room.elecPriceKwh)}/kWh
                  </p>
                </div>
                <div className="bg-surface-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-surface-500 mb-1">
                    <Droplets size={16} />
                    <span className="text-xs font-medium">Tiền nước</span>
                  </div>
                  <p className="text-lg font-bold text-surface-900">
                    {formatCurrency(room.waterPriceM3)}/m³
                  </p>
                </div>
              </div>

              {/* Amenities */}
              {room.amenities?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                    <Wifi size={16} className="text-primary-500" />
                    Tiện ích phòng
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((a) => (
                      <div
                        key={a.amenityId}
                        className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 border border-primary-100 rounded-xl text-sm"
                      >
                        <AmenityIcon iconName={a.icon} showBg={false} size={16} />
                        <span className="text-primary-700 font-medium">{a.name}</span>
                        {a.monthlyFee > 0 && (
                          <span className="text-primary-400 text-xs">
                            {formatCurrency(a.monthlyFee)}/tháng
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <p className="text-sm text-surface-500 mb-1">Tiền thuê hàng tháng</p>
              <p className="text-3xl font-bold text-primary-600">
                {formatCurrency(room.basePrice)}
              </p>
              <p className="text-xs text-surface-400 mt-1">/tháng</p>
            </div>

            {/* Contact card */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border border-primary-100 p-6">
              <h3 className="text-sm font-semibold text-surface-700 mb-3">
                Liên hệ chủ nhà
              </h3>
              <p className="text-xs text-surface-500 mb-4">
                Nếu bạn cần hỗ trợ hoặc có thắc mắc, hãy liên hệ chủ nhà qua chức năng Chat.
              </p>
              <a
                href="/chat"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm"
              >
                <Phone size={16} /> Nhắn tin
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* No room found – informational view */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-surface-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary-50 rounded-2xl flex items-center justify-center">
              <Home size={32} className="text-primary-400" />
            </div>
            <h2 className="text-lg font-bold text-surface-900 mb-2">
              Chưa có thông tin phòng
            </h2>
            <p className="text-sm text-surface-500 max-w-md mx-auto mb-6">
              Hiện tại hệ thống chưa ghi nhận phòng trọ nào được liên kết với tài khoản của bạn.
              Nếu bạn đang thuê phòng, vui lòng liên hệ chủ nhà để được cập nhật.
            </p>
            <button
              onClick={fetchMyRoom}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm"
            >
              <RefreshCw size={16} /> Thử tải lại
            </button>
          </div>

          {/* Help cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <div className="w-10 h-10 mb-3 bg-accent-50 rounded-xl flex items-center justify-center">
                <Search size={20} className="text-accent-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-1">Tìm phòng mới</h3>
              <p className="text-sm text-surface-500 mb-3">
                Bạn chưa thuê phòng? Tìm kiếm phòng trọ phù hợp trên trang chủ.
              </p>
              <a
                href="/tenant"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Tìm phòng →
              </a>
            </div>
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <div className="w-10 h-10 mb-3 bg-warning-50 rounded-xl flex items-center justify-center">
                <AlertCircle size={20} className="text-warning-600" />
              </div>
              <h3 className="font-semibold text-surface-900 mb-1">Cần hỗ trợ?</h3>
              <p className="text-sm text-surface-500 mb-3">
                Nếu bạn đã ký hợp đồng nhưng chưa thấy phòng, hãy nhắn tin cho chủ nhà.
              </p>
              <a
                href="/chat"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Mở Chat →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
