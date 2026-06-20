import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Receipt,
  Building2,
  Calendar,
  Zap,
  Droplets,
  Wifi,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  FileText,
  Printer,
  Share2,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { propertyApi } from '../../api/propertyApi'
import { roomApi } from '../../api/roomApi'
import { billApi } from '../../api/billApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatCurrency'

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]

export default function BillsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [properties, setProperties] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  
  // Form values
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(CURRENT_YEAR)
  
  // Meter readings values
  const [elecPrevious, setElecPrevious] = useState('')
  const [elecCurrent, setElecCurrent] = useState('')
  const [waterPrevious, setWaterPrevious] = useState('')
  const [waterCurrent, setWaterCurrent] = useState('')
  const [fetchingLatest, setFetchingLatest] = useState(false)

  // Room bills history
  const [roomBills, setRoomBills] = useState([])
  const [loadingBills, setLoadingBills] = useState(false)
  
  // Loading & state
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Generated bill response
  const [generatedBill, setGeneratedBill] = useState(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  // Auto-populate from state if navigated with state
  useEffect(() => {
    if (location.state?.propertyId) {
      setSelectedPropertyId(Number(location.state.propertyId))
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

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

  useEffect(() => {
    if (selectedPropertyId) {
      fetchRoomsOfProperty(selectedPropertyId)
    } else {
      setRooms([])
      setSelectedRoomId('')
    }
  }, [selectedPropertyId])

  const fetchRoomsOfProperty = async (propertyId) => {
    try {
      const res = await roomApi.getByProperty(propertyId)
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      const roomList = Array.isArray(rawData) ? rawData : []
      setRooms(roomList)
      
      // Auto-select room ID if present in location state
      if (location.state?.roomId) {
        const hasRoom = roomList.some(r => r.roomId === Number(location.state.roomId))
        if (hasRoom) {
          setSelectedRoomId(Number(location.state.roomId))
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (selectedRoomId) {
      fetchLatestRecord(selectedRoomId)
      fetchRoomBills(selectedRoomId)
    } else {
      setElecPrevious('')
      setElecCurrent('')
      setWaterPrevious('')
      setWaterCurrent('')
      setRoomBills([])
    }
  }, [selectedRoomId])

  const fetchLatestRecord = async (roomId) => {
    try {
      setFetchingLatest(true)
      const res = await billApi.getLatestRecord(roomId)
      const record = res.data?.data || res.data
      if (record) {
        setElecPrevious(record.elecCurrent !== undefined ? record.elecCurrent : 0)
        setWaterPrevious(record.waterCurrent !== undefined ? record.waterCurrent : 0)
      } else {
        setElecPrevious(0)
        setWaterPrevious(0)
      }
    } catch (err) {
      console.error('Error fetching latest record', err)
      setElecPrevious(0)
      setWaterPrevious(0)
    } finally {
      setFetchingLatest(false)
    }
  }

  const fetchRoomBills = async (roomId) => {
    try {
      setLoadingBills(true)
      const res = await billApi.getBillsForRoom(roomId)
      const list = res.data?.data || res.data
      setRoomBills(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('Error fetching room bills', err)
    } finally {
      setLoadingBills(false)
    }
  }

  const handleConfirmPayment = async (billId) => {
    try {
      if (!window.confirm('Xác nhận khách thuê đã thanh toán hóa đơn này?')) return
      await billApi.updateBillStatus(billId, 'paid')
      alert('Đã xác nhận thanh toán thành công!')
      if (selectedRoomId) {
        fetchRoomBills(selectedRoomId)
      }
    } catch (err) {
      console.error(err)
      alert('Không thể xác nhận thanh toán.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedRoomId || !month || !year) {
      setError('Vui lòng chọn phòng, tháng và năm.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setGeneratedBill(null)
      
      const res = await billApi.generateFromRecord(
        Number(selectedRoomId),
        Number(month),
        Number(year),
        elecCurrent !== '' ? Number(elecCurrent) : null,
        waterCurrent !== '' ? Number(waterCurrent) : null,
        elecPrevious !== '' ? Number(elecPrevious) : null,
        waterPrevious !== '' ? Number(waterPrevious) : null
      )
      
      setGeneratedBill(res.data?.data || res.data)
      if (selectedRoomId) {
        fetchRoomBills(Number(selectedRoomId))
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Không thể tạo hóa đơn. Vui lòng kiểm tra lại thông tin chỉ số điện nước hoặc đảm bảo phòng đã được thuê ký hợp đồng.'
      )
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setGeneratedBill(null)
    setError('')
    setElecCurrent('')
    setWaterCurrent('')
  }

  const getStatusBadge = (status) => {
    const key = status?.toLowerCase() || 'unpaid'
    const statusMap = {
      unpaid: { label: 'Chưa thanh toán', bg: 'bg-danger-50 text-danger-600 border border-danger-100' },
      pending_confirm: { label: 'Chờ duyệt', bg: 'bg-warning-50 text-warning-600 border border-warning-100' },
      pending_approval: { label: 'Chờ duyệt', bg: 'bg-warning-50 text-warning-600 border border-warning-100' },
      paid: { label: 'Đã thanh toán', bg: 'bg-accent-50 text-accent-700 border border-accent-100' },
      overdue: { label: 'Quá hạn', bg: 'bg-red-100 text-red-700 border border-red-200' },
    }
    return statusMap[key] || { label: status, bg: 'bg-surface-50 text-surface-600' }
  }

  const handlePrint = () => {
    window.print()
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
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <Receipt className="text-primary-600" size={24} />
          Xuất hóa đơn tháng
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Tạo hóa đơn tiền phòng, điện, nước và dịch vụ hàng tháng từ chỉ số ghi nhận trước đó.
        </p>
      </div>

      {generatedBill ? (
        /* BILL RECEIPT DISPLAY */
        <div className="space-y-6">
          <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-surface-100/50 relative overflow-hidden print:border-none print:shadow-none print:p-0">
            {/* Top border decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-accent-400 print:hidden" />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-6 border-b border-surface-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Hóa đơn dịch vụ</span>
                <h2 className="text-xl font-bold text-surface-950 mt-1">Phòng {rooms.find(r => r.roomId === Number(selectedRoomId))?.roomNumber}</h2>
                <p className="text-sm text-surface-500 mt-0.5">Tháng {month}/{year}</p>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(generatedBill.status).bg}`}>
                  {getStatusBadge(generatedBill.status).label}
                </span>
                <span className="text-xs text-surface-400 mt-2">Mã hóa đơn: #{generatedBill.billId}</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="py-6 space-y-4">
              <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">Chi tiết khoản thu</h3>
              
              <div className="space-y-3">
                {/* Room bill */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Tiền thuê phòng</p>
                      <p className="text-xs text-surface-400">Giá phòng cố định hàng tháng</p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(generatedBill.roomBill)}</span>
                </div>

                {/* Elec bill */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-warning-50 text-warning-600 rounded-lg">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Tiền điện</p>
                      <p className="text-xs text-surface-400">Tính theo chỉ số điện năng tiêu thụ</p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(generatedBill.elecBill)}</span>
                </div>

                {/* Water bill */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Droplets size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Tiền nước</p>
                      <p className="text-xs text-surface-400">Tính theo thể tích nước sạch tiêu thụ</p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(generatedBill.waterBill)}</span>
                </div>

                {/* Amenities bill */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-accent-50 text-accent-600 rounded-lg">
                      <Wifi size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Dịch vụ & Tiện ích bổ sung</p>
                      <p className="text-xs text-surface-400">Phí mạng Internet, dọn dẹp, xe cộ...</p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(generatedBill.amenityBill)}</span>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="pt-6 border-t border-surface-100 flex justify-between items-center">
              <span className="text-base font-bold text-surface-800">Tổng cộng thanh toán</span>
              <span className="text-2xl font-extrabold text-primary-600">{formatCurrency(generatedBill.totalAmount)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center print:hidden">
            <button
              onClick={handleReset}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
            >
              Quay lại
            </button>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
              >
                <Printer size={16} />
                In hóa đơn
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `HÓA ĐƠN TIỀN PHÒNG - Tháng ${month}/${year}\n` +
                    `--------------------------------------\n` +
                    `- Tiền phòng: ${formatCurrency(generatedBill.roomBill)}\n` +
                    `- Tiền điện: ${formatCurrency(generatedBill.elecBill)}\n` +
                    `- Tiền nước: ${formatCurrency(generatedBill.waterBill)}\n` +
                    `- Dịch vụ: ${formatCurrency(generatedBill.amenityBill)}\n` +
                    `======================================\n` +
                    `TỔNG CỘNG: ${formatCurrency(generatedBill.totalAmount)}\n` +
                    `- Trạng thái: Chưa thanh toán`
                  )
                  alert('Đã sao chép nội dung hóa đơn vào bộ nhớ tạm!')
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
              >
                <Share2 size={16} />
                Chia sẻ text
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* GENERATE FORM */
        <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-surface-100/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-danger-50 text-danger-600 text-sm rounded-xl flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Property and Room selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <Building2 size={16} className="text-surface-400" />
                  Khu trọ
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
                  Chọn phòng xuất hóa đơn
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                  disabled={!selectedPropertyId}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((r) => (
                    <option key={r.roomId} value={r.roomId}>
                      Phòng {r.roomNumber} ({r.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Month and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-surface-400" />
                  Tháng thanh toán
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                  required
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={16} className="text-surface-400" />
                  Năm thanh toán
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                  required
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ghi nhận chỉ số điện nước trực tiếp */}
            {selectedRoomId && (
              <div className="bg-surface-50 border border-surface-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-surface-200/60">
                  <Zap size={18} className="text-primary-600" />
                  <h3 className="text-sm font-semibold text-surface-850">
                    Chỉ số điện & nước tháng {month}/{year}
                  </h3>
                </div>

                {fetchingLatest ? (
                  <div className="flex items-center gap-2 text-sm text-surface-500 py-2">
                    <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                    Đang tìm chỉ số cũ...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Electricity Readings */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider">Điện năng (kWh)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-surface-600 mb-1">Số cũ</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={elecPrevious}
                            onChange={(e) => setElecPrevious(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm outline-none focus:border-primary-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-600 mb-1">Số mới</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={elecCurrent}
                            onChange={(e) => setElecCurrent(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm outline-none focus:border-primary-500"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Water Readings */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-surface-500 uppercase tracking-wider">Nước sạch (m³)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-surface-600 mb-1">Số cũ</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={waterPrevious}
                            onChange={(e) => setWaterPrevious(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm outline-none focus:border-primary-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-surface-600 mb-1">Số mới</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={waterCurrent}
                            onChange={(e) => setWaterCurrent(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm outline-none focus:border-primary-500"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info card */}
            <div className="bg-surface-50 border border-surface-200 p-4 rounded-2xl flex items-start gap-3">
              <FileText className="text-primary-500 shrink-0 mt-0.5 animate-pulse-soft" size={18} />
              <p className="text-xs text-surface-600 leading-relaxed">
                Hệ thống sẽ tự động tính toán tổng số tiền dựa trên đơn giá điện/nước đã cấu hình cho phòng và tiền thuê cố định hàng tháng.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-surface-150">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/10"
              >
                {submitting ? 'Đang xuất hóa đơn...' : 'Tạo hóa đơn'}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bill History List */}
      {!generatedBill && selectedRoomId && (
        <div className="mt-8 bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-surface-100/50">
          <h3 className="text-lg font-bold text-surface-905 mb-4 flex items-center gap-2">
            <FileText className="text-primary-600" size={20} />
            Lịch sử hóa đơn phòng trọ
          </h3>

          {loadingBills ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : roomBills.length === 0 ? (
            <div className="text-center py-8 text-surface-400 text-sm bg-surface-50 rounded-2xl border border-dashed border-surface-200">
              Phòng trọ này chưa có hóa đơn nào được lập.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-surface-600 border-collapse">
                <thead>
                  <tr className="border-b border-surface-150 text-surface-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">Kỳ hóa đơn</th>
                    <th className="py-3 px-4">Tổng tiền</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {roomBills.map((b) => (
                    <tr key={b.billId} className="border-b border-surface-100 hover:bg-surface-50/50 transition-colors">
                      <td className="py-4 px-4 font-medium text-surface-850">
                        Tháng {b.billingMonth}/{b.billingYear}
                      </td>
                      <td className="py-4 px-4 font-semibold text-surface-950">
                        {formatCurrency(b.totalAmount)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(b.status).bg}`}>
                          {getStatusBadge(b.status).label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Duyệt thanh toán */}
                          {(b.status?.toLowerCase() === 'pending_confirm' || b.status?.toLowerCase() === 'pending_approval') && (
                            <button
                              onClick={() => handleConfirmPayment(b.billId)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                            >
                              Duyệt thanh toán
                            </button>
                          )}
                          
                          {/* Chi tiết */}
                          <button
                            onClick={() => setGeneratedBill(b)}
                            className="px-3 py-1 bg-surface-100 hover:bg-surface-200 text-surface-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
