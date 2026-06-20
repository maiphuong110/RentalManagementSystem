import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  FileSignature,
  Building2,
  Calendar,
  DollarSign,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { propertyApi } from '../../api/propertyApi'
import { roomApi } from '../../api/roomApi'
import { contractApi } from '../../api/contractApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const emptyForm = {
  roomId: '',
  tenantId: '',
  startDate: '',
  endDate: '',
  depositAmount: '',
  rentPricePerMonth: '',
}

export default function ContractsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [properties, setProperties] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  
  // State for form
  const [form, setForm] = useState({ ...emptyForm })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // State for created contract
  const [createdContract, setCreatedContract] = useState(null)

  // Đọc thông tin chuyển tiếp từ ChatPage nếu có
  useEffect(() => {
    if (location.state) {
      const { propertyId, tenantId } = location.state
      if (propertyId) {
        setSelectedPropertyId(propertyId.toString())
      }
      if (tenantId) {
        setForm((prev) => ({
          ...prev,
          tenantId: tenantId.toString(),
        }))
      }
      // Xoá router state để khi refresh không giữ thông tin cũ
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await propertyApi.getAll(user.userId)
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      setProperties(Array.isArray(rawData) ? rawData : [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách khu trọ.')
    } finally {
      setLoading(false)
    }
  }

  // Tải danh sách phòng khi khu trọ thay đổi
  useEffect(() => {
    if (selectedPropertyId) {
      const targetRoomId = location.state?.roomId
      fetchRoomsOfProperty(selectedPropertyId, targetRoomId)
    } else {
      setRooms([])
    }
  }, [selectedPropertyId])

  const fetchRoomsOfProperty = async (propertyId, targetRoomId) => {
    try {
      const res = await roomApi.getByProperty(propertyId)
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      const roomList = Array.isArray(rawData) ? rawData : []
      setRooms(roomList)
      
      if (targetRoomId) {
        const selectedRoom = roomList.find((r) => r.roomId === Number(targetRoomId))
        if (selectedRoom) {
          setForm((prev) => ({
            ...prev,
            roomId: targetRoomId.toString(),
            rentPricePerMonth: selectedRoom.basePrice.toString(),
            depositAmount: (selectedRoom.basePrice * 2).toString(), // Mặc định cọc 2 tháng
          }))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Tự động điền giá thuê khi phòng thay đổi
  const handleRoomChange = (e) => {
    const roomId = e.target.value
    const selectedRoom = rooms.find((r) => r.roomId === Number(roomId))
    
    setForm({
      ...form,
      roomId,
      rentPricePerMonth: selectedRoom ? selectedRoom.basePrice.toString() : '',
      depositAmount: selectedRoom ? (selectedRoom.basePrice * 2).toString() : '', // Mặc định cọc 2 tháng
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.roomId || !form.tenantId || !form.startDate || !form.endDate || !form.depositAmount || !form.rentPricePerMonth) {
      setError('Vui lòng điền đầy đủ các thông tin hợp đồng.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      const data = {
        roomId: Number(form.roomId),
        tenantId: Number(form.tenantId),
        startDate: form.startDate,
        endDate: form.endDate,
        depositAmount: Number(form.depositAmount),
        rentPricePerMonth: Number(form.rentPricePerMonth),
      }

      // Tạo hợp đồng nháp với ownerId của user đang đăng nhập
      const res = await contractApi.create(data, user.userId)
      const created = res.data?.data || res.data
      setCreatedContract({
        ...created,
        rentPricePerMonth: data.rentPricePerMonth
      })
      setForm({ ...emptyForm })
      setSelectedPropertyId('')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo hợp đồng nháp. Vui lòng kiểm tra lại thông tin.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateNew = () => {
    setCreatedContract(null)
    setError('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Đang tải dữ liệu khu trọ..." />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <FileSignature className="text-primary-600" size={24} />
          Tạo hợp đồng thuê phòng
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Lập hợp đồng thuê phòng nháp cho người thuê và phát hành mã OTP để ký kết điện tử.
        </p>
      </div>

      {createdContract ? (
        /* SUCCESS STATUS PANEL */
        <div className="bg-white border border-surface-200 rounded-3xl p-8 shadow-xl shadow-surface-100/50 animate-scale-in">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-accent-50 text-accent-600 rounded-full mb-4 animate-bounce-slow">
              <ShieldCheck size={48} className="stroke-2" />
            </div>
            <h2 className="text-xl font-bold text-surface-950">Tạo hợp đồng nháp thành công!</h2>
            <p className="text-sm text-surface-500 mt-1">Hợp đồng đã được lưu dưới dạng chờ ký (PENDING).</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-medium text-surface-400">Trạng thái hiện tại:</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-warning-50 text-warning-700 rounded-full uppercase border border-warning-200 animate-pulse">
                Chờ ký (Pending)
              </span>
            </div>
          </div>

          <div className="bg-surface-50 rounded-2xl p-6 mb-6 space-y-4 border border-surface-100">
            <h3 className="font-semibold text-surface-900 text-sm border-b border-surface-200 pb-2">
              Thông tin hợp đồng #{createdContract.contractId || createdContract.contract_id}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-surface-400">ID Hợp đồng</span>
                <p className="font-semibold text-primary-600 mt-0.5">#{createdContract.contractId || createdContract.contract_id}</p>
              </div>
              <div>
                <span className="text-surface-400">Trạng thái</span>
                <p className="font-semibold text-warning-600 mt-0.5 uppercase">{createdContract.status}</p>
              </div>
              <div>
                <span className="text-surface-400">ID Người thuê</span>
                <p className="font-semibold text-surface-800 mt-0.5">{createdContract.tenantId || createdContract.tenant_id}</p>
              </div>
              <div>
                <span className="text-surface-400">ID Phòng trọ</span>
                <p className="font-semibold text-surface-800 mt-0.5">{createdContract.roomId || createdContract.room_id}</p>
              </div>
              <div>
                <span className="text-surface-400">Giá thuê / tháng</span>
                <p className="font-semibold text-primary-600 mt-0.5">
                  {formatCurrency(createdContract.rentPricePerMonth || createdContract.rent_price_per_month)}
                </p>
              </div>
              <div>
                <span className="text-surface-400">Tiền đặt cọc</span>
                <p className="font-semibold text-surface-800 mt-0.5">
                  {formatCurrency(createdContract.depositAmount || createdContract.deposit_amount)}
                </p>
              </div>
              <div>
                <span className="text-surface-400">Ngày bắt đầu</span>
                <p className="font-semibold text-surface-800 mt-0.5">
                  {formatDate(createdContract.startDate || createdContract.start_date)}
                </p>
              </div>
              <div>
                <span className="text-surface-400">Ngày kết thúc</span>
                <p className="font-semibold text-surface-800 mt-0.5">
                  {formatDate(createdContract.endDate || createdContract.end_date)}
                </p>
              </div>
            </div>

            {/* OTP Section */}
            {(createdContract.eSignatureOtp || createdContract.esignatureOtp || createdContract.esignature_otp) && (
              <div className="mt-6 p-4 bg-primary-50 rounded-xl border border-primary-100 flex flex-col items-center">
                <span className="text-xs font-semibold text-primary-700 tracking-wider">MÃ KÝ HỢP ĐỒNG (OTP)</span>
                <span className="text-3xl font-extrabold text-primary-600 tracking-widest mt-1.5">
                  {createdContract.eSignatureOtp || createdContract.esignatureOtp || createdContract.esignature_otp}
                </span>
                <p className="text-xs text-primary-600 mt-2 text-center max-w-xs leading-relaxed">
                  Cung cấp mã số hợp đồng <strong>#{createdContract.contractId || createdContract.contract_id}</strong> và mã OTP này cho người thuê để họ thực hiện ký điện tử trên tài khoản của họ.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              <Plus size={18} />
              Tạo hợp đồng tiếp theo
            </button>
          </div>
        </div>
      ) : (
        /* CREATE FORM */
        <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-surface-100/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-danger-50 text-danger-600 text-sm rounded-xl flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Property and Room Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={16} className="text-surface-400" />
                  Chọn khu trọ
                </label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                  required
                >
                  <option value="">-- Chọn khu trọ --</option>
                  {properties.map((p) => (
                    <option key={p.propertyId} value={p.propertyId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={16} className="text-surface-400" />
                  Chọn phòng trọ
                </label>
                <select
                  value={form.roomId}
                  onChange={handleRoomChange}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                  disabled={!selectedPropertyId}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.roomId} value={r.roomId}>
                      Phòng {r.roomNumber} - {formatCurrency(r.basePrice)} ({r.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tenant ID and Monthly Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <User size={16} className="text-surface-400" />
                  ID Khách thuê (Tenant ID)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Nhập ID tài khoản khách thuê"
                  value={form.tenantId}
                  onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={16} className="text-surface-400" />
                  Giá thuê hàng tháng (VND)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Giá phòng hàng tháng"
                  value={form.rentPricePerMonth}
                  onChange={(e) => setForm({ ...form, rentPricePerMonth: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Deposit and Date bounds */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={16} className="text-surface-400" />
                  Tiền đặt cọc (VND)
                </label>
                <input
                  type="number"
                  required
                  placeholder="Tiền cọc giữ phòng"
                  value={form.depositAmount}
                  onChange={(e) => setForm({ ...form, depositAmount: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-surface-400" />
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-surface-400" />
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                />
              </div>
            </div>

            {/* Info Hint */}
            <div className="bg-surface-50 border border-surface-200 p-4 rounded-2xl flex items-start gap-3">
              <CheckCircle className="text-accent-500 shrink-0 mt-0.5 animate-pulse-soft" size={18} />
              <p className="text-xs text-surface-600 leading-relaxed">
                Sau khi tạo hợp đồng nháp, hệ thống sẽ phát sinh mã OTP ký hợp đồng. Khách thuê (Tenant) có thể ký điện tử bằng cách nhập mã này trong tài khoản của họ. Hợp đồng sẽ chuyển sang trạng thái hoạt động ngay khi ký.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-150">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/10"
              >
                {submitting ? 'Đang tạo hợp đồng...' : 'Tạo hợp đồng nháp'}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
