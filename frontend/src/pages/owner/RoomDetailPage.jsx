import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, DoorOpen, Plus, Trash2, Zap, Droplets, Users, Ruler, Tag,
  Calendar, Mail, Phone, MessageSquare, FileText, PlusCircle, User, ShieldAlert
} from 'lucide-react'
import { roomApi } from '../../api/roomApi'
import { amenityApi } from '../../api/amenityApi'
import { contractApi } from '../../api/contractApi'
import { chatApi } from '../../api/chatApi'
import { getAssetUrl } from '../../api/axiosInstance'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import AmenityIcon from '../../components/ui/AmenityIcon'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const getAmenityEmoji = (iconName) => {
  const emojis = {
    ac_unit: '❄️',
    hot_tub: '🚿',
    kitchen: '🧊',
    local_laundry_service: '🧺',
    wifi: '📶',
    two_wheeler: '🛵',
    directions_car: '🚗',
    balcony: '🌅',
    security: '🛡️',
    videocam: '📹',
    elevator: '🛗',
    stairs: '🪜'
  }
  return emojis[iconName] || '🏠'
}

const STATUS_MAP = {
  available: { label: 'Còn trống', bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500' },
  AVAILABLE: { label: 'Còn trống', bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500' },
  unavailable: { label: 'Đã cho thuê', bg: 'bg-danger-50', text: 'text-danger-500', dot: 'bg-danger-500' },
  UNAVAILABLE: { label: 'Đã cho thuê', bg: 'bg-danger-50', text: 'text-danger-500', dot: 'bg-danger-500' },
}

export default function RoomDetailPage() {
  const { roomId: id } = useParams()
  const navigate = useNavigate()

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Renting details
  const [activeRent, setActiveRent] = useState(null)
  const [loadingRent, setLoadingRent] = useState(false)

  // Amenities
  const [allAmenities, setAllAmenities] = useState([])
  const [showAddAmenity, setShowAddAmenity] = useState(false)
  const [selectedAmenityId, setSelectedAmenityId] = useState('')
  const [amenityMonthlyFee, setAmenityMonthlyFee] = useState('')
  const [addingAmenity, setAddingAmenity] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)

  useEffect(() => {
    fetchRoom()
    fetchAllAmenities()
  }, [id])

  const fetchRoom = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await roomApi.getById(id)
      const data = res.data?.data !== undefined ? res.data.data : res.data
      setRoom(data)
      if (data.status === 'unavailable' || data.status === 'UNAVAILABLE') {
        fetchActiveRent(id)
      }
    } catch (err) {
      setError('Không thể tải thông tin phòng.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveRent = async (roomId) => {
    try {
      setLoadingRent(true)
      const res = await contractApi.getActiveForRoom(roomId)
      const data = res.data?.data || res.data
      setActiveRent(data)
    } catch (err) {
      console.log('Room is vacant or active contract load failed')
      setActiveRent(null)
    } finally {
      setLoadingRent(false)
    }
  }

  const fetchAllAmenities = async () => {
    try {
      const res = await amenityApi.getAll()
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      setAllAmenities(Array.isArray(rawData) ? rawData : [])
    } catch (err) {
      console.error('Không thể tải danh sách tiện ích:', err)
    }
  }

  const handleAddAmenity = async (e) => {
    e.preventDefault()
    if (!selectedAmenityId) return

    try {
      setAddingAmenity(true)
      await roomApi.patchAmenity(id, {
        amenityId: selectedAmenityId,
        monthlyFee: parseFloat(amenityMonthlyFee) || 0,
      })
      setShowAddAmenity(false)
      setSelectedAmenityId('')
      setAmenityMonthlyFee('')
      fetchRoom()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Không thể thêm tiện ích.')
    } finally {
      setAddingAmenity(false)
    }
  }

  const handleRemoveAmenity = async () => {
    if (!removeTarget) return
    try {
      await roomApi.removeAmenity(id, removeTarget)
      fetchRoom()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Không thể xóa tiện ích.')
    }
    setRemoveTarget(null)
  }

  // Lọc amenities chưa được gán vào phòng
  const assignedIds = new Set((room?.amenities || []).map((a) => a.amenityId))
  const availableAmenities = allAmenities.filter((a) => !assignedIds.has(a.amenityId))

  if (loading) {
    return <LoadingSpinner size="lg" text="Đang tải thông tin phòng..." />
  }

  if (error || !room) {
    return (
      <div className="animate-fade-in p-6">
        <div className="bg-danger-50 text-danger-600 rounded-xl p-4 text-center">
          {error || 'Không tìm thấy phòng.'}
          <button onClick={() => navigate('/owner/rooms')} className="ml-3 underline font-medium">
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = STATUS_MAP[room.status] || STATUS_MAP.available

  return (
    <div className="animate-fade-in space-y-6 p-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/owner/rooms')}
          className="p-2 rounded-xl border border-surface-200 text-surface-500 hover:text-surface-700 hover:bg-surface-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 rounded-xl">
            <DoorOpen className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Phòng {room.roomNumber}</h1>
            <p className="text-sm text-surface-500">{room.propertyName}</p>
          </div>
        </div>
      </div>

      {/* Room Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-surface-900">Thông tin phòng</h2>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <InfoItem icon={Ruler} label="Diện tích" value={`${room.areaSqm} m²`} />
          <InfoItem icon={Users} label="Sức chứa" value={`${room.maxCapacity} người`} />
          <InfoItem icon={DoorOpen} label="Số phòng ngủ" value={`${room.bedrooms || 1} phòng ngủ`} />
          <InfoItem icon={Tag} label="Giá phòng" value={formatCurrency(room.basePrice)} highlight />
          <InfoItem icon={Zap} label="Giá điện" value={`${formatCurrency(room.elecPriceKwh)}/kWh`} />
          <InfoItem icon={Droplets} label="Giá nước" value={`${formatCurrency(room.waterPriceM3)}/m³`} />
          <InfoItem icon={Zap} label="Loại điện" value={room.elecKind === 'business' || room.elecKind === 'elec_service' ? 'Điện kinh doanh' : 'Điện sinh hoạt'} />
        </div>

        <div className="mt-4 pt-4 border-t border-surface-100 text-sm text-surface-400">
          Ngày tạo: {formatDate(room.createdAt)}
        </div>
      </div>

      {/* Renting Details Section */}
      {room.status === 'unavailable' || room.status === 'UNAVAILABLE' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
              <Users className="text-primary-600" size={20} />
              Thông tin thuê phòng & Hợp đồng
            </h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-accent-50 text-accent-700">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
              Đang hiệu lực
            </span>
          </div>

          {loadingRent ? (
            <LoadingSpinner size="sm" text="Đang tải thông tin khách thuê..." />
          ) : activeRent ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tenant Profile */}
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <User size={16} className="text-primary-500" />
                    Khách thuê hiện tại
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    {activeRent.tenant?.avatarUrl ? (
                      <img
                        src={getAssetUrl(activeRent.tenant.avatarUrl)}
                        alt={activeRent.tenant.fullName}
                        className="w-14 h-14 rounded-full object-cover border border-surface-200"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                        {activeRent.tenant?.fullName?.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-surface-900 text-sm">
                        {activeRent.tenant?.fullName}
                      </p>
                      <p className="text-xs text-surface-400">
                        Mã số người dùng: {activeRent.tenant?.userId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-surface-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-surface-400" />
                      <span>SĐT: <span className="font-semibold text-surface-900">{activeRent.tenant?.phone || 'Chưa cập nhật'}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-surface-400" />
                      <span>Email: <span className="font-semibold text-surface-900">{activeRent.tenant?.email || 'Chưa cập nhật'}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={14} className="text-surface-400" />
                      <span>Số CCCD: <span className="font-semibold text-surface-955">{activeRent.tenant?.cccdNumber || 'Chưa cập nhật'}</span></span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-150 flex gap-2">
                  <button
                    onClick={async () => {
                      if (!activeRent?.tenant?.userId) return
                      try {
                        const res = await chatApi.getOrCreate({ receiverId: activeRent.tenant.userId })
                        const conversation = res.data?.data || res.data
                        navigate('/chat', { state: { conversationId: conversation?.conversationId } })
                      } catch (err) {
                        alert('Không thể mở cuộc trò chuyện.')
                      }
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-white border border-surface-200 text-surface-700 hover:bg-surface-50 hover:text-surface-900 transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageSquare size={14} />
                    Nhắn tin trao đổi
                  </button>
                </div>
              </div>

              {/* Lease & Billing */}
              <div className="bg-surface-50 rounded-xl p-5 border border-surface-100 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" />
                    Chi tiết hợp đồng thuê
                  </h3>
                  <div className="space-y-3 text-xs text-surface-600">
                    <div className="flex justify-between items-center py-1 border-b border-surface-150">
                      <span className="text-surface-500">Mã hợp đồng:</span>
                      <span className="font-semibold text-surface-900">#HD{activeRent.contract?.contractId}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-surface-150">
                      <span className="text-surface-500">Ngày bắt đầu:</span>
                      <span className="font-semibold text-surface-900 flex items-center gap-1">
                        <Calendar size={13} className="text-surface-400" />
                        {formatDate(activeRent.contract?.startDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-surface-150">
                      <span className="text-surface-500">Ngày kết thúc:</span>
                      <span className="font-semibold text-surface-900 flex items-center gap-1">
                        <Calendar size={13} className="text-surface-400" />
                        {formatDate(activeRent.contract?.endDate)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-surface-500">Tiền cọc đảm bảo:</span>
                      <span className="font-bold text-primary-600">
                        {formatCurrency(activeRent.contract?.depositAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-surface-150 flex gap-2">
                  <button
                    onClick={() => {
                      navigate('/owner/bills', {
                        state: {
                          roomId: room.roomId,
                          propertyId: room.propertyId
                        }
                      })
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle size={14} />
                    Lập hóa đơn tháng mới
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-surface-400 italic">
              Không thể tải chi tiết hợp đồng thuê của phòng trọ.
            </div>
          )}
        </div>
      ) : (
        /* Vacant Room Actions */
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-surface-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-ping shrink-0" />
              Phòng đang trống & sẵn sàng cho thuê
            </h2>
            <p className="text-xs text-surface-400 mt-1">
              Bạn có thể xuất hợp đồng thuê phòng trọ hoặc đăng bài tin tìm kiếm khách thuê cho căn phòng này.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => navigate('/owner/contracts', {
                state: {
                  roomId: room.roomId,
                  propertyId: room.propertyId
                }
              })}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white transition-all shadow-md cursor-pointer"
            >
              <PlusCircle size={14} />
              Tạo hợp đồng mới
            </button>
             <button
              onClick={() => navigate('/owner/posts', {
                state: {
                  prefillRoomId: room.roomId,
                  prefillPropertyId: room.propertyId,
                  prefillRoomNumber: room.roomNumber,
                  prefillBasePrice: room.basePrice,
                  prefillAreaSqm: room.areaSqm,
                  prefillMaxCapacity: room.maxCapacity,
                  prefillAmenities: room.amenities
                }
              })}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-xl bg-white border border-surface-200 text-surface-700 hover:bg-surface-50 transition-colors shadow-sm cursor-pointer"
            >
              <DoorOpen size={14} />
              Đăng tin bài đăng
            </button>
          </div>
        </div>
      )}

      {/* Amenities Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-surface-900">
            Tiện ích ({room.amenities?.length || 0})
          </h2>
          <button
            onClick={() => setShowAddAmenity(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
          >
            <Plus size={16} />
            Thêm tiện ích
          </button>
        </div>

        {(!room.amenities || room.amenities.length === 0) ? (
          <div className="py-8 text-center">
            <p className="text-surface-400 text-sm">Phòng chưa có tiện ích nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {room.amenities.map((amenity) => (
              <div
                key={amenity.amenityId}
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-50 border border-surface-100 hover:bg-surface-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AmenityIcon iconName={amenity.icon} />
                  <div>
                    <p className="text-sm font-medium text-surface-800">{amenity.name}</p>
                    <p className="text-xs text-surface-400">
                      {amenity.monthlyFee > 0 ? formatCurrency(amenity.monthlyFee) + '/tháng' : 'Miễn phí'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setRemoveTarget(amenity.amenityId)}
                  className="p-1.5 rounded-lg text-surface-300 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                  title="Xóa tiện ích"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Amenity Modal */}
      <Modal
        isOpen={showAddAmenity}
        onClose={() => setShowAddAmenity(false)}
        title="Thêm tiện ích cho phòng"
      >
        {availableAmenities.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-surface-500 text-sm">Tất cả tiện ích đã được gán cho phòng này</p>
          </div>
        ) : (
          <form onSubmit={handleAddAmenity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Chọn tiện ích</label>
              <select
                value={selectedAmenityId}
                onChange={(e) => setSelectedAmenityId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="">-- Chọn tiện ích --</option>
                {availableAmenities.map((a) => (
                  <option key={a.amenityId} value={a.amenityId}>
                    {getAmenityEmoji(a.icon)} {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Phí hàng tháng (VNĐ)</label>
              <input
                type="number"
                step="1000"
                value={amenityMonthlyFee}
                onChange={(e) => setAmenityMonthlyFee(e.target.value)}
                placeholder="VD: 50000 (0 nếu miễn phí)"
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAmenity(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-surface-300 text-surface-700 hover:bg-surface-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={addingAmenity}
                className="px-5 py-2.5 text-sm font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {addingAmenity ? 'Đang thêm...' : 'Thêm tiện ích'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Remove Confirm */}
      <ConfirmDialog
        isOpen={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemoveAmenity}
        title="Xóa tiện ích"
        message="Bạn có chắc muốn xóa tiện ích này khỏi phòng?"
        confirmText="Xóa"
        danger
      />
    </div>
  )
}

// Helper component for info items
function InfoItem({ icon: Icon, label, value, highlight = false }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50">
      <div className="p-2 bg-white rounded-lg shadow-sm">
        <Icon size={18} className="text-primary-500" />
      </div>
      <div>
        <p className="text-xs text-surface-400">{label}</p>
        <p className={`text-sm font-semibold ${highlight ? 'text-primary-600' : 'text-surface-800'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
