import { useState, useEffect } from 'react'
import {
  FileSignature,
  PenTool,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Hash,
  KeyRound,
  ShieldAlert,
  Printer,
  Building2,
  FileText,
  User,
  Calendar,
  DollarSign,
} from 'lucide-react'
import { contractApi } from '../../api/contractApi'
import { roomApi } from '../../api/roomApi'
import { propertyApi } from '../../api/propertyApi'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const SIGNING_STEPS = [
  {
    icon: Hash,
    title: '1. Nhập Mã hợp đồng',
    desc: 'Nhận mã số định danh hợp đồng do chủ nhà cung cấp khi chốt phòng.',
    color: 'bg-primary-50 text-primary-600',
  },
  {
    icon: KeyRound,
    title: '2. Nhập Mã ký kết (OTP)',
    desc: 'Nhập mã chữ/số xác thực đi kèm của hợp đồng nháp từ chủ trọ.',
    color: 'bg-accent-50 text-accent-600',
  },
  {
    icon: ShieldCheck,
    title: '3. Hoàn tất ký điện tử',
    desc: 'Hệ thống tự động kích hoạt hợp đồng và ghi nhận chữ ký điện tử hợp pháp.',
    color: 'bg-warning-50 text-warning-600',
  },
]

export default function ContractsPage() {
  const { user } = useAuth()
  const [contractId, setContractId] = useState('')
  const [otpCode, setOtpCode] = useState('')
  
  // Status states
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Active Contract states
  const [activeContract, setActiveContract] = useState(null)
  const [contractRoom, setContractRoom] = useState(null)
  const [contractProperty, setContractProperty] = useState(null)
  const [loadingActive, setLoadingActive] = useState(true)

  useEffect(() => {
    fetchActiveContract()
  }, [])

  const fetchActiveContract = async () => {
    setLoadingActive(true)
    try {
      const res = await contractApi.getActiveForTenant(user.userId)
      const contract = res.data?.data || res.data
      if (contract) {
        setActiveContract(contract)
        
        // Fetch room
        const roomRes = await roomApi.getById(contract.roomId)
        const roomData = roomRes.data?.data || roomRes.data
        setContractRoom(roomData)
        
        // Fetch property
        if (roomData?.propertyId) {
          const propRes = await propertyApi.getById(roomData.propertyId)
          const propData = propRes.data?.data || propRes.data
          setContractProperty(propData)
        }
      } else {
        setActiveContract(null)
      }
    } catch (err) {
      console.log('No active contract found:', err)
      setActiveContract(null)
    } finally {
      setLoadingActive(false)
    }
  }

  const handleSign = async (e) => {
    e.preventDefault()
    if (!contractId || !otpCode) {
      setError('Vui lòng điền đầy đủ Mã hợp đồng và Mã OTP.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      
      const payload = {
        contractId: Number(contractId),
        otpCode: otpCode.trim(),
      }
      
      const res = await contractApi.sign(payload)
      
      // Success response could be a string or object.
      // E.g. "Signature verified, contract is active."
      setSuccessMsg(res.data || 'Ký hợp đồng thành công!')
      setContractId('')
      setOtpCode('')
      await fetchActiveContract() // Load the signed contract details
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Xác thực chữ ký thất bại. Vui lòng kiểm tra lại Mã hợp đồng và Mã OTP từ chủ nhà.'
      )
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignPending = async (e) => {
    e.preventDefault()
    if (!otpCode) {
      setError('Vui lòng nhập mã OTP để ký số.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccessMsg('')
      
      const payload = {
        contractId: Number(activeContract.contractId || activeContract.contract_id),
        otpCode: otpCode.trim(),
      }
      
      const res = await contractApi.sign(payload)
      setSuccessMsg(res.data || 'Ký hợp đồng thành công!')
      setOtpCode('')
      await fetchActiveContract() // Refresh contract state
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Xác thực chữ ký số thất bại. Vui lòng kiểm tra lại mã OTP.'
      )
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSuccessMsg('')
    setError('')
  }

  const contractDate = activeContract 
    ? new Date(activeContract.signedAt || activeContract.createdAt || activeContract.created_at || Date.now()) 
    : new Date()

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Simple Print Styles */}
      <style>{`
        @media print {
          header, aside, footer, nav, button, .print\\:hidden {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            margin-left: 0 !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>

      {activeContract ? (
        <div className="space-y-6">
          {/* Action Header or Warning Banner */}
          {activeContract.status === 'active' ? (
            <div className="flex items-center justify-between bg-white border border-surface-200 p-4 rounded-2xl shadow-sm print:hidden">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-pulse" />
                <span className="text-sm font-semibold text-surface-800 text-xs sm:text-sm">Bạn đã ký hợp đồng điện tử thành công!</span>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm cursor-pointer"
              >
                <Printer size={15} />
                In hợp đồng / Tải bản mềm (PDF)
              </button>
            </div>
          ) : (
            <div className="bg-warning-50 border border-warning-200 p-4 rounded-2xl shadow-sm print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-warning-500 animate-ping mt-1.5 sm:mt-0 shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-warning-800 block">Hợp đồng thuê phòng đang chờ bạn ký số</span>
                  <span className="text-[11px] text-warning-600 block mt-0.5">Vui lòng đọc kỹ nội dung bên dưới và điền mã OTP để hoàn tất ký kết.</span>
                </div>
              </div>
            </div>
          )}

          {/* Actual Contract Document Paper */}
          <div className="bg-white border border-surface-300 rounded-3xl p-8 sm:p-12 shadow-xl print:border-none print:shadow-none print:p-0 max-w-3xl mx-auto">
            {/* National Motto */}
            <div className="text-center space-y-1 mb-8">
              <h2 className="text-sm font-bold tracking-widest text-surface-900 uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h2>
              <h3 className="text-xs font-semibold text-surface-800">Độc lập - Tự do - Hạnh phúc</h3>
              <div className="w-40 h-[1px] bg-surface-400 mx-auto mt-2" />
            </div>

            {/* Contract Title */}
            <div className="text-center space-y-2 mb-10">
              <h1 className="text-xl sm:text-2xl font-extrabold text-surface-950 uppercase tracking-wide">HỢP ĐỒNG THUÊ PHÒNG TRỌ</h1>
              <p className="text-xs text-surface-500 italic">Mã số hợp đồng điện tử: #{activeContract.contractId || activeContract.contract_id}</p>
            </div>

            {/* Contract Terms */}
            <div className="space-y-6 text-sm text-surface-800 leading-relaxed font-serif">
              {/* Introduction */}
              <p className="text-xs sm:text-sm">
                Hôm nay, ngày {contractDate.getDate()} tháng {contractDate.getMonth() + 1} năm {contractDate.getFullYear()}, chúng tôi gồm các bên dưới đây đã thực hiện thỏa thuận hợp đồng thuê phòng trọ điện tử tại hệ thống TroSmart:
              </p>

              {/* Side A: Landlord */}
              <div>
                <h4 className="font-bold uppercase text-surface-950 border-b border-surface-150 pb-1 mb-2">Bên Cho Thuê (Bên A - Chủ Nhà)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <p><span className="text-surface-500">Đại diện quản lý:</span> <strong>Chủ nhà khu trọ {contractProperty?.name || 'TroSmart'}</strong></p>
                  <p><span className="text-surface-500">Địa chỉ khu nhà:</span> <strong>{contractProperty ? `${contractProperty.street}, Phường ${contractProperty.ward}, Quận ${contractProperty.district}, ${contractProperty.city}` : 'Chưa cập nhật'}</strong></p>
                </div>
              </div>

              {/* Side B: Tenant */}
              <div>
                <h4 className="font-bold uppercase text-surface-950 border-b border-surface-150 pb-1 mb-2">Bên Thuê (Bên B - Khách Thuê)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <p><span className="text-surface-500">Họ và tên:</span> <strong>{user?.fullName}</strong></p>
                  <p><span className="text-surface-500">Địa chỉ Email:</span> <strong>{user?.email}</strong></p>
                  <p><span className="text-surface-500">Số điện thoại:</span> <strong>{user?.phone || 'Chưa cập nhật'}</strong></p>
                  <p><span className="text-surface-500">Số CCCD / CMND:</span> <strong>{user?.cccdNumber || 'Chưa cập nhật'}</strong></p>
                </div>
              </div>

              {/* Terms Section */}
              <div className="space-y-4 pt-4 border-t border-surface-150">
                <div>
                  <h4 className="font-bold text-surface-950">ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG</h4>
                  <p className="text-xs mt-1">
                    Bên A đồng ý cho Bên B thuê phòng số <strong>{contractRoom?.roomNumber || '...'}</strong> thuộc khu trọ <strong>{contractProperty?.name || '...'}</strong> tại địa chỉ {contractProperty ? `${contractProperty.street}, Phường ${contractProperty.ward}, Quận ${contractProperty.district}, ${contractProperty.city}` : '...'}. Diện tích sử dụng là <strong>{contractRoom?.areaSqm || '...'} m²</strong>.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-surface-950">ĐIỀU 2: THỜI HẠN THUÊ</h4>
                  <p className="text-xs mt-1">
                    Thời hạn thuê là từ ngày <strong>{formatDate(activeContract.startDate || activeContract.start_date)}</strong> đến hết ngày <strong>{formatDate(activeContract.endDate || activeContract.end_date)}</strong>. Hết thời hạn nêu trên, nếu Bên B muốn tiếp tục thuê thì phải thỏa thuận lại với Bên A.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-surface-950">ĐIỀU 3: GIÁ THUÊ, CHI PHÍ VÀ TIỀN ĐẶT CỌ</h4>
                  <ul className="list-disc list-inside text-xs mt-1 space-y-1 pl-2">
                    <li>Giá thuê phòng hàng tháng: <strong className="text-primary-700">{formatCurrency(activeContract.rentPricePerMonth || contractRoom?.basePrice || 0)}/tháng</strong>.</li>
                    <li>Tiền đặt cọc bảo đảm phòng: <strong>{formatCurrency(activeContract.depositAmount || activeContract.deposit_amount || 0)}</strong> (sẽ hoàn lại sau khi thanh lý hợp đồng và trừ đi các hao tổn hư hại nếu có).</li>
                    <li>Đơn giá điện sử dụng: <strong>{formatCurrency(contractRoom?.elecPriceKwh || 0)}/kWh</strong>.</li>
                    <li>Đơn giá nước sử dụng: <strong>{formatCurrency(contractRoom?.waterPriceM3 || 0)}/m³</strong>.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-surface-950">ĐIỀU 4: PHÁT LỰC KÝ KẾT</h4>
                  <p className="text-xs mt-1">
                    Bên A đồng ý bàn giao tài sản và Bên B có trách nhiệm bảo quản. Hai bên đồng ý thực hiện ký hợp đồng thông qua xác thực điện tử OTP trên hệ thống TroSmart.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 text-center pt-10 mt-10 border-t border-surface-150">
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-surface-500 uppercase block">ĐẠI DIỆN BÊN A (CHỦ NHÀ)</span>
                  <p className="text-xs italic text-surface-400">Đã phê duyệt bản nháp</p>
                  <div className="h-10" />
                  <p className="font-bold text-xs text-surface-700">{contractProperty?.name || 'TroSmart Owner'}</p>
                </div>
                <div className="space-y-1">
                  <span className="font-semibold text-xs text-surface-500 uppercase block">ĐẠI DIỆN BÊN B (KHÁCH THUÊ)</span>
                  {activeContract.status === 'active' ? (
                    <>
                      <div className="inline-block border-2 border-accent-300 bg-accent-50/50 rounded-xl px-4 py-1.5 text-accent-700 text-[10px] font-bold tracking-widest uppercase rotate-[-2deg] my-2 select-none">
                        Đã ký điện tử
                      </div>
                      <p className="text-[10px] text-surface-400">Thời gian ký: {activeContract.signedAt ? new Date(activeContract.signedAt).toLocaleString('vi-VN') : '...'}</p>
                    </>
                  ) : (
                    <>
                      <div className="inline-block border-2 border-dashed border-warning-400 bg-warning-50 rounded-xl px-4 py-1.5 text-warning-700 text-[10px] font-bold tracking-widest uppercase rotate-[-2deg] my-2 select-none animate-pulse">
                        Chờ ký số (Xác thực OTP)
                      </div>
                      <p className="text-[10px] text-surface-400">Trạng thái: Chưa ký</p>
                    </>
                  )}
                  <p className="font-bold text-xs text-surface-700">{user?.fullName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* OTP Signature Form for pending contracts */}
          {activeContract.status === 'pending' && (
            <div className="bg-white border border-warning-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-warning-50/20 max-w-3xl mx-auto mt-8 border-dashed print:hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-warning-50 text-warning-600 rounded-xl">
                  <FileSignature size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-surface-950">Xác thực ký hợp đồng điện tử</h3>
                  <p className="text-xs text-surface-500 mt-0.5">
                    Hợp đồng đã được chủ nhà {contractProperty?.name || 'TroSmart Owner'} tạo. Vui lòng kiểm tra kỹ mọi điều khoản hợp đồng ở trên và nhập mã OTP dưới đây để hoàn tất ký kết.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSignPending} className="space-y-4">
                {error && (
                  <div className="p-3.5 bg-danger-50 text-danger-600 text-xs rounded-xl flex items-start gap-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="p-3.5 bg-success-50 text-success-600 text-xs rounded-xl flex items-start gap-2">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Mã hợp đồng</label>
                    <div className="relative">
                      <input
                        type="text"
                        disabled
                        value={`#${activeContract.contractId || activeContract.contract_id}`}
                        className="w-full px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm font-semibold text-surface-600 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Nhập mã chữ ký điện tử (OTP)</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Mã OTP gồm 6 chữ số từ chủ nhà"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full pl-4 pr-10 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all font-semibold tracking-wider text-center"
                      />
                      <KeyRound size={16} className="absolute right-3.5 top-3 text-surface-400" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-surface-100 mt-6">
                  <div className="flex items-start gap-2 text-[11px] text-surface-500 max-w-md">
                    <ShieldAlert size={14} className="shrink-0 mt-0.5 text-warning-500" />
                    <p>
                      Mã OTP xác thực được hệ thống sinh tự động. Việc nhập chính xác mã OTP và ấn xác nhận tương đương với việc ký kết hợp đồng bằng chữ ký tay trực tiếp.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="sm:w-auto w-full px-6 py-3 bg-gradient-to-r from-warning-600 to-warning-700 text-white font-semibold rounded-xl hover:from-warning-700 hover:to-warning-800 disabled:opacity-60 transition-all shadow-lg shadow-warning-500/10 shrink-0 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Ký Hợp Đồng Ngay
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
              <FileSignature className="text-primary-600" size={24} />
              Ký hợp đồng điện tử
            </h1>
            <p className="text-sm text-surface-500 mt-1">
              Ký số hợp đồng thuê phòng bằng mã OTP xác thực do chủ nhà cung cấp để kích hoạt trạng thái ở trọ.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: GUIDELINES */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-xl shadow-surface-100/50">
                <h2 className="text-lg font-bold text-surface-950 flex items-center gap-2 mb-4">
                  <PenTool size={20} className="text-primary-600" />
                  Quy trình ký hợp đồng trực tuyến
                </h2>
                
                <div className="space-y-6">
                  {SIGNING_STEPS.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className={`p-3 rounded-2xl shrink-0 h-12 w-12 flex items-center justify-center ${step.color}`}>
                        <step.icon size={22} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-surface-900 text-sm">{step.title}</h3>
                        <p className="text-xs text-surface-500 mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-surface-100 flex items-start gap-2.5 text-xs text-warning-600 bg-warning-50/50 p-4 rounded-2xl border-dashed border-warning-200">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Lưu ý pháp lý:</strong> Ký số hợp đồng qua mã xác thực OTP trên TroSmart có giá trị cam kết thỏa thuận thuê nhà hợp pháp giữa Chủ nhà và Người thuê theo đúng pháp luật hiện hành.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: FORM OR SUCCESS PANEL */}
            <div className="lg:col-span-5">
              {successMsg ? (
                /* SUCCESS PANEL */
                <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-xl shadow-surface-100/50 text-center animate-scale-in">
                  <div className="p-3.5 bg-accent-50 text-accent-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={36} className="stroke-2" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-950">Ký hợp đồng thành công!</h2>
                  <p className="text-xs text-surface-500 mt-2 leading-relaxed">
                    Hợp đồng của bạn đã được kích hoạt. Bạn hiện có thể xem chi tiết phòng trọ và hóa đơn tương ứng của mình.
                  </p>
                  <div className="bg-surface-50 p-4 rounded-2xl text-xs text-surface-600 border border-surface-150 my-5 italic">
                    "{successMsg}"
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors text-sm"
                  >
                    Quay lại hợp đồng đã ký
                  </button>
                </div>
              ) : (
                /* SIGNING FORM */
                <div className="bg-white border border-surface-200 rounded-3xl p-6 shadow-xl shadow-surface-100/50">
                  <h2 className="text-lg font-bold text-surface-950 mb-5">Nhập mã xác thực</h2>
                  
                  <form onSubmit={handleSign} className="space-y-4">
                    {error && (
                      <div className="p-3.5 bg-danger-50 text-danger-600 text-xs rounded-xl flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Mã hợp đồng (Contract ID)</label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          placeholder="Ví dụ: 12"
                          value={contractId}
                          onChange={(e) => setContractId(e.target.value)}
                          className="w-full pl-4 pr-10 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                        />
                        <Hash size={16} className="absolute right-3.5 top-3 text-surface-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1.5">Mã chữ ký điện tử (OTP)</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Mã OTP gồm chữ và số"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full pl-4 pr-10 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all font-semibold tracking-wider"
                        />
                        <KeyRound size={16} className="absolute right-3.5 top-3 text-surface-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 transition-all shadow-lg shadow-primary-500/10 mt-6"
                    >
                      {submitting ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Xác nhận ký tên
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
