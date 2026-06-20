import { useState, useEffect } from 'react'
import {
  Receipt,
  CreditCard,
  Phone,
  MessageCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Zap,
  Droplets,
  Wifi,
  DollarSign,
  Printer,
  Share2,
  X,
  Send,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { billApi } from '../../api/billApi'
import { userApi } from '../../api/userApi'
import { chatApi } from '../../api/chatApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatCurrency'

export default function MyBillsPage() {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Selected bill for receipt detailed view
  const [selectedBill, setSelectedBill] = useState(null)
  
  // Payment Modal state
  const [paymentBill, setPaymentBill] = useState(null)
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState('')
  const [submittingPayment, setSubmittingPayment] = useState(false)

  // Owner public profile info for QR code
  const [ownerProfile, setOwnerProfile] = useState(null)
  const [loadingOwner, setLoadingOwner] = useState(false)

  useEffect(() => {
    if (user?.userId) {
      fetchTenantBills()
    }
  }, [user])

  useEffect(() => {
    if (paymentBill?.ownerId) {
      fetchOwnerProfile(paymentBill.ownerId)
    } else {
      setOwnerProfile(null)
    }
  }, [paymentBill])

  const fetchTenantBills = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await billApi.getBillsForTenant(user.userId)
      const list = res.data?.data || res.data
      setBills(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error(err)
      setError('Không thể tải danh sách hóa đơn.')
    } finally {
      setLoading(false)
    }
  }

  const fetchOwnerProfile = async (ownerId) => {
    try {
      setLoadingOwner(true)
      const res = await userApi.getById(ownerId)
      setOwnerProfile(res.data?.data || res.data)
    } catch (err) {
      console.error('Error fetching owner profile:', err)
    } finally {
      setLoadingOwner(false)
    }
  }

  const handleProofFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProofFile(file)
      setProofPreview(URL.createObjectURL(file))
    } else {
      setProofFile(null)
      setProofPreview('')
    }
  }

  const handlePaySubmit = async (e) => {
    e.preventDefault()
    if (!paymentBill || !proofFile) return

    try {
      setSubmittingPayment(true)

      // 1. Upload proof image first
      const uploadRes = await billApi.uploadProof(proofFile)
      const uploadedUrl = uploadRes.data?.data || uploadRes.data

      // 2. Update status and save proof URL
      await billApi.updateBillStatus(paymentBill.billId, 'pending_approval', uploadedUrl)

      // 3. Send notification message to the owner conversation
      try {
        const convoRes = await chatApi.getOrCreate({ receiverId: paymentBill.ownerId, postId: null })
        const convo = convoRes.data?.data || convoRes.data
        if (convo?.conversationId) {
          const messageContent = `[BILL_PROOF:${paymentBill.billId}]`
          await chatApi.sendMessage(convo.conversationId, { content: messageContent })
        }
      } catch (chatErr) {
        console.error('Failed to send billing proof message via chat:', chatErr)
      }

      alert('Đã gửi thông tin thanh toán & hình ảnh minh chứng thành công!')
      setPaymentBill(null)
      setProofFile(null)
      setProofPreview('')
      fetchTenantBills()
    } catch (err) {
      console.error(err)
      alert('Gửi thông tin thanh toán thất bại. Vui lòng thử lại.')
    } finally {
      setSubmittingPayment(false)
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" text="Đang tải danh sách hóa đơn..." />
      </div>
    )
  }

  const unpaidBills = bills.filter(b => b.status?.toLowerCase() === 'unpaid' || b.status?.toLowerCase() === 'overdue')
  const totalUnpaid = unpaidBills.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0)

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
          <Receipt className="text-primary-600" size={24} />
          Hóa đơn của tôi
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          Theo dõi và thực hiện thanh toán hóa đơn thuê phòng hàng tháng.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 text-danger-600 text-sm rounded-xl flex items-start gap-2.5 print:hidden">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {selectedBill ? (
        /* DETAIL RECEIPT MODE */
        <div className="space-y-6">
          <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-surface-100/50 relative overflow-hidden print:border-none print:shadow-none print:p-0">
            {/* Top decoration */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-accent-400 print:hidden" />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-6 border-b border-surface-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-400">Chi tiết hóa đơn phòng</span>
                <h2 className="text-xl font-bold text-surface-950 mt-1">Phòng {selectedBill.roomNumber || 'Trống'}</h2>
                <p className="text-sm text-surface-500 mt-0.5">Tháng {selectedBill.billingMonth}/{selectedBill.billingYear}</p>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedBill.status).bg}`}>
                  {getStatusBadge(selectedBill.status).label}
                </span>
                <span className="text-xs text-surface-400 mt-2">Mã hóa đơn: #{selectedBill.billId}</span>
              </div>
            </div>

            {/* Bill Details */}
            <div className="py-6 space-y-4">
              <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider">Chi tiết các khoản thu</h3>
              
              <div className="space-y-3">
                {/* Room rent */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
                      <FileText size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Tiền thuê phòng</p>
                      <p className="text-xs text-surface-400">Giá thuê phòng cố định</p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(selectedBill.roomBill)}</span>
                </div>

                {/* Electricity */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-warning-50 text-warning-600 rounded-lg">
                      <Zap size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Tiền điện</p>
                      <p className="text-xs text-surface-400">
                        Chỉ số: {selectedBill.elecPrevious} → {selectedBill.elecCurrent} ({selectedBill.elecCurrent - selectedBill.elecPrevious} kWh) × {formatCurrency(selectedBill.elecAmount)}/kWh
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(selectedBill.elecBill)}</span>
                </div>

                {/* Water */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Droplets size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Tiền nước</p>
                      <p className="text-xs text-surface-400">
                        Chỉ số: {selectedBill.waterPrevious} → {selectedBill.waterCurrent} ({selectedBill.waterCurrent - selectedBill.waterPrevious} m³) × {formatCurrency(selectedBill.waterAmount)}/m³
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(selectedBill.waterBill)}</span>
                </div>

                {/* Amenities */}
                <div className="flex justify-between items-center text-sm py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-accent-50 text-accent-600 rounded-lg">
                      <Wifi size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-surface-800">Dịch vụ tiện ích khác</p>
                      <p className="text-xs text-surface-400">Phí dịch vụ cố định (rác, mạng, vệ sinh...)</p>
                    </div>
                  </div>
                  <span className="font-semibold text-surface-900">{formatCurrency(selectedBill.amenityBill)}</span>
                </div>
              </div>
            </div>

            {/* Total Section */}
            <div className="pt-6 border-t border-surface-100 flex justify-between items-center">
              <span className="text-base font-bold text-surface-800">Tổng cộng thanh toán</span>
              <span className="text-2xl font-extrabold text-primary-600">{formatCurrency(selectedBill.totalAmount)}</span>
            </div>

            {selectedBill.paymentProofUrl && (
              <div className="mt-6 pt-4 border-t border-surface-100 text-xs text-surface-500">
                <span className="font-semibold block text-surface-700 mb-2">Ảnh minh chứng chuyển khoản đã gửi:</span>
                <div className="max-w-xs border border-surface-200 rounded-lg overflow-hidden">
                  <img
                    src={selectedBill.paymentProofUrl}
                    alt="Minh chứng giao dịch"
                    className="w-full h-auto max-h-48 object-cover cursor-pointer"
                    onClick={() => window.open(selectedBill.paymentProofUrl)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center print:hidden">
            <button
              onClick={() => setSelectedBill(null)}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
            >
              Quay lại danh sách
            </button>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => window.print()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
              >
                <Printer size={16} />
                In hóa đơn
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `HÓA ĐƠN PHÒNG ${selectedBill.roomNumber} - Tháng ${selectedBill.billingMonth}/${selectedBill.billingYear}\n` +
                    `--------------------------------------\n` +
                    `- Tiền thuê phòng: ${formatCurrency(selectedBill.roomBill)}\n` +
                    `- Tiền điện (${selectedBill.elecCurrent - selectedBill.elecPrevious} kWh): ${formatCurrency(selectedBill.elecBill)}\n` +
                    `- Tiền nước (${selectedBill.waterCurrent - selectedBill.waterPrevious} m³): ${formatCurrency(selectedBill.waterBill)}\n` +
                    `- Dịch vụ & Tiện ích: ${formatCurrency(selectedBill.amenityBill)}\n` +
                    `======================================\n` +
                    `TỔNG CỘNG: ${formatCurrency(selectedBill.totalAmount)}\n` +
                    `- Trạng thái: ${getStatusBadge(selectedBill.status).label}`
                  )
                  alert('Đã sao chép nội dung hóa đơn!')
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
              >
                <Share2 size={16} />
                Sao chép text
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* BILLS DASHBOARD LIST */
        <>
          {/* Summary KPI Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 print:hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-500/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-rose-100 uppercase tracking-wider">Hóa đơn chưa thanh toán</p>
                  <h3 className="text-3xl font-extrabold mt-2">{formatCurrency(totalUnpaid)}</h3>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <AlertTriangle size={24} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-rose-100/80 mt-4">
                Bạn đang có {unpaidBills.length} hóa đơn quá hạn hoặc chưa hoàn tất thanh toán.
              </p>
            </div>

            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-6 text-white shadow-lg shadow-primary-500/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-primary-100 uppercase tracking-wider">Hóa đơn tháng này</p>
                  <h3 className="text-3xl font-extrabold mt-2">
                    {bills.length > 0 ? formatCurrency(bills[0].totalAmount) : '0 ₫'}
                  </h3>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Receipt size={24} className="text-white" />
                </div>
              </div>
              <p className="text-xs text-primary-100/80 mt-4">
                Kỳ hóa đơn mới nhất: {bills.length > 0 ? `Tháng ${bills[0].billingMonth}/${bills[0].billingYear}` : 'Chưa có'}
              </p>
            </div>
          </div>

          {/* Bills List Panel */}
          <div className="bg-white border border-surface-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-surface-100/50">
            <h2 className="text-lg font-bold text-surface-900 mb-6 flex items-center gap-2">
              <FileText className="text-primary-600" size={20} />
              Lịch sử các hóa đơn phòng trọ
            </h2>

            {bills.length === 0 ? (
              <div className="text-center py-12 text-surface-400 text-sm bg-surface-50 rounded-2xl border border-dashed border-surface-200">
                <Receipt className="mx-auto text-surface-300 mb-3" size={36} />
                Bạn hiện tại chưa có hóa đơn nào được tạo.
              </div>
            ) : (
              <div className="space-y-4">
                {bills.map((b) => (
                  <div
                    key={b.billId}
                    className="bg-white hover:bg-surface-50/30 border border-surface-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="p-3 bg-primary-50 text-primary-600 rounded-xl shrink-0">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900">Hóa đơn Kỳ tháng {b.billingMonth}/{b.billingYear}</h3>
                        <p className="text-xs text-surface-450 mt-0.5">Phòng {b.roomNumber || 'Trống'} • Ngày lập: {new Date(b.billingDate).toLocaleDateString('vi-VN')}</p>
                        <p className="text-sm font-bold text-surface-950 mt-1.5">{formatCurrency(b.totalAmount)}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(b.status).bg}`}>
                        {getStatusBadge(b.status).label}
                      </span>
                      
                      <button
                        onClick={() => setSelectedBill(b)}
                        className="px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 text-xs font-semibold rounded-xl transition-colors"
                      >
                        Chi tiết
                      </button>

                      {(b.status?.toLowerCase() === 'unpaid' || b.status?.toLowerCase() === 'overdue') && (
                        <button
                          onClick={() => setPaymentBill(b)}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl shadow-md shadow-primary-500/10 transition-colors flex items-center gap-1.5"
                        >
                          <CreditCard size={14} />
                          Thanh toán
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick FAQ / Billing info */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-3xl border border-primary-100 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="text-warning-500" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Thanh toán đúng hạn hàng tháng</h3>
                <p className="text-xs text-surface-500 mt-0.5 max-w-xl">
                  Để đảm bảo các dịch vụ hoạt động ổn định, vui lòng hoàn tất chuyển khoản và gửi thông tin xác nhận cho chủ nhà trước ngày 5 hàng tháng. Liên hệ qua mục trò chuyện nếu có thắc mắc.
                </p>
              </div>
            </div>
            <a
              href="/chat"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-sm shrink-0"
            >
              <MessageCircle size={16} />
              Trò chuyện với chủ
            </a>
          </div>
        </>
      )}

      {/* TRANSACTION PAYMENT MODAL */}
      {paymentBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-surface-200 max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Title */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-surface-100">
              <h3 className="font-bold text-surface-950 flex items-center gap-2">
                <CreditCard className="text-primary-600" size={20} />
                Thanh toán hóa đơn tháng {paymentBill.billingMonth}/{paymentBill.billingYear}
              </h3>
              <button
                onClick={() => {
                  setPaymentBill(null)
                  setProofFile(null)
                  setProofPreview('')
                }}
                className="p-1 hover:bg-surface-100 rounded-lg text-surface-450 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handlePaySubmit} className="p-6 space-y-5">
              <div className="bg-surface-50 border border-surface-150 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs text-surface-500">
                  <span>Tiền thuê phòng:</span>
                  <span className="font-medium text-surface-800">{formatCurrency(paymentBill.roomBill)}</span>
                </div>
                <div className="flex justify-between text-xs text-surface-500">
                  <span>Tiền điện nước & dịch vụ:</span>
                  <span className="font-medium text-surface-800">
                    {formatCurrency(paymentBill.elecBill + paymentBill.waterBill + paymentBill.amenityBill)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-surface-900 pt-2 border-t border-surface-200">
                  <span>Số tiền cần chuyển:</span>
                  <span className="text-primary-600">{formatCurrency(paymentBill.totalAmount)}</span>
                </div>
              </div>

              {/* Owner's QR Code Display */}
              <div className="space-y-2 text-center">
                <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider text-left">Quét mã QR thanh toán</h4>
                {loadingOwner ? (
                  <div className="py-8 flex justify-center">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : ownerProfile?.qrCodeUrl ? (
                  <div className="p-2 border border-surface-200 rounded-2xl inline-block bg-white shadow-sm">
                    <img
                      src={ownerProfile.qrCodeUrl}
                      alt="Mã QR thanh toán của chủ nhà"
                      className="w-44 h-44 object-contain mx-auto rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="py-6 px-4 text-xs text-surface-500 bg-surface-50 rounded-2xl border border-dashed border-surface-200 text-center">
                    <AlertTriangle size={16} className="text-warning-500 mx-auto mb-1.5" />
                    Chủ nhà chưa cấu hình ảnh QR thanh toán trong trang cá nhân.
                  </div>
                )}
              </div>

              {/* Bank instructions details */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Thông tin tài khoản</h4>
                <div className="bg-primary-50/50 border border-primary-100 p-4 rounded-2xl text-xs space-y-1.5">
                  <p className="text-surface-700">Chủ tài khoản: <span className="font-bold text-surface-900">{ownerProfile?.fullName || 'Chủ trọ'}</span></p>
                  <p className="text-surface-700">Số điện thoại liên hệ: <span className="font-bold text-surface-900">{ownerProfile?.phone || 'Chưa cung cấp'}</span></p>
                  <p className="text-surface-700">Nội dung chuyển khoản: <span className="font-bold text-primary-600">Thanh toan hoa don phong {paymentBill.roomNumber || ''} thang {paymentBill.billingMonth}</span></p>
                </div>
              </div>

              {/* Image upload selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-surface-750 uppercase tracking-wider">
                  Tải lên ảnh minh chứng chuyển khoản (Bắt buộc)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleProofFileChange}
                  className="w-full text-xs text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-750 hover:file:bg-primary-100 transition-all border border-surface-200 rounded-xl p-2 cursor-pointer"
                />
                {proofPreview && (
                  <div className="mt-2 relative rounded-lg border border-surface-200 overflow-hidden max-h-36">
                    <img src={proofPreview} alt="Preview minh chứng" className="w-full h-auto object-cover" />
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentBill(null)
                    setProofFile(null)
                    setProofPreview('')
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-surface-700 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-xl shadow-lg shadow-primary-500/10 transition-colors"
                >
                  <Send size={14} />
                  {submittingPayment ? 'Đang gửi...' : 'Gửi xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
