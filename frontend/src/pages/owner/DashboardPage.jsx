import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { LayoutDashboard, Building2, DoorOpen, TrendingUp, PieChart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { propertyApi } from '../../api/propertyApi'
import { roomApi } from '../../api/roomApi'
import { billApi } from '../../api/billApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatCurrency'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState([])
  const [allRooms, setAllRooms] = useState([])
  const [allBills, setAllBills] = useState([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')
      const propRes = await propertyApi.getAll(user.userId)
      const propData = propRes.data?.data !== undefined ? propRes.data.data : propRes.data
      const props = Array.isArray(propData) ? propData : []
      setProperties(props)

      // Lấy danh sách phòng cho tất cả khu trọ
      const roomPromises = props.map((p) => roomApi.getByProperty(p.propertyId))
      const roomResults = await Promise.all(roomPromises)
      const rooms = roomResults.flatMap((r) => {
        const roomData = r.data?.data !== undefined ? r.data.data : r.data
        return Array.isArray(roomData) ? roomData : []
      })
      setAllRooms(rooms)

      // Lấy tất cả hóa đơn của các phòng này để tính toán doanh thu chính xác
      if (rooms.length > 0) {
        const billPromises = rooms.map((r) => billApi.getBillsForRoom(r.roomId))
        const billResults = await Promise.all(billPromises)
        const bills = billResults.flatMap((res) => {
          const billData = res.data?.data !== undefined ? res.data.data : res.data
          return Array.isArray(billData) ? billData : []
        })
        setAllBills(bills)
      } else {
        setAllBills([])
      }
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ===== Tính toán KPI =====
  const totalProperties = properties.length
  const totalRooms = allRooms.length
  const occupiedRooms = allRooms.filter((r) => r.status === 'unavailable' || r.status === 'UNAVAILABLE').length
  const availableRooms = allRooms.filter((r) => r.status === 'available' || r.status === 'AVAILABLE').length
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

  // 1. Doanh thu thực tế (Tổng giá trị các hóa đơn đã được thanh toán và phê duyệt)
  const paidRevenue = allBills
    .filter((b) => b.status?.toLowerCase() === 'paid')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)

  // 2. Doanh thu chờ duyệt (Tổng giá trị các hóa đơn khách đã trả nhưng chủ chưa duyệt)
  const pendingRevenue = allBills
    .filter((b) => b.status?.toLowerCase() === 'pending_confirm' || b.status?.toLowerCase() === 'pending_approval')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)

  // 3. Doanh thu chưa thanh toán (Tổng giá trị các hóa đơn chưa trả hoặc quá hạn)
  const unpaidRevenue = allBills
    .filter((b) => b.status?.toLowerCase() === 'unpaid' || b.status?.toLowerCase() === 'overdue')
    .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)

  // ===== Chart data =====
  // Doanh thu thực tế theo tháng của năm hiện tại
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
  const currentYear = new Date().getFullYear()

  const monthlyPaidData = months.map((_, index) => {
    const monthNum = index + 1
    return allBills
      .filter((b) => b.status?.toLowerCase() === 'paid' && Number(b.billingMonth) === monthNum && Number(b.billingYear) === currentYear)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
  })

  const monthlyPendingData = months.map((_, index) => {
    const monthNum = index + 1
    return allBills
      .filter((b) => (b.status?.toLowerCase() === 'pending_confirm' || b.status?.toLowerCase() === 'pending_approval') && Number(b.billingMonth) === monthNum && Number(b.billingYear) === currentYear)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
  })

  const monthlyUnpaidData = months.map((_, index) => {
    const monthNum = index + 1
    return allBills
      .filter((b) => (b.status?.toLowerCase() === 'unpaid' || b.status?.toLowerCase() === 'overdue') && Number(b.billingMonth) === monthNum && Number(b.billingYear) === currentYear)
      .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
  })

  const barChartData = {
    labels: months,
    datasets: [
      {
        label: 'Đã thu (VNĐ)',
        data: monthlyPaidData,
        backgroundColor: '#10b981',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Chờ duyệt (VNĐ)',
        data: monthlyPendingData,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'Chưa thu (VNĐ)',
        data: monthlyUnpaidData,
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: { size: 12 },
          color: '#475569',
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#64748b', font: { size: 12 } },
      },
      y: {
        stacked: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#64748b',
          font: { size: 11 },
          callback: (v) => {
            if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'tr'
            if (v >= 1_000) return (v / 1_000).toFixed(0) + 'k'
            return v
          },
        },
      },
    },
  }

  const doughnutData = {
    labels: ['Đã cho thuê', 'Còn trống'],
    datasets: [
      {
        data: [occupiedRooms, availableRooms],
        backgroundColor: ['#0a6fa2', '#10b981'],
        hoverBackgroundColor: ['#0e6496', '#059669'],
        borderWidth: 0,
        spacing: 4,
      },
    ],
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: { size: 13 },
          color: '#334155',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        cornerRadius: 8,
      },
    },
  }

  // ===== KPI Config =====
  const kpiCards = [
    {
      title: 'Tổng khu trọ',
      value: totalProperties,
      icon: Building2,
      color: 'bg-primary-50 text-primary-600',
      iconBg: 'bg-primary-100',
    },
    {
      title: 'Tổng phòng',
      value: totalRooms,
      icon: DoorOpen,
      color: 'bg-accent-50 text-accent-600',
      iconBg: 'bg-accent-100',
    },
    {
      title: 'Tỷ lệ lấp đầy',
      value: `${occupancyRate}%`,
      icon: PieChart,
      color: 'bg-warning-50 text-warning-600',
      iconBg: 'bg-warning-50',
    },
    {
      title: 'Doanh thu thực tế',
      value: formatCurrency(paidRevenue),
      icon: TrendingUp,
      color: 'bg-accent-50 text-accent-700',
      iconBg: 'bg-accent-100',
    },
    {
      title: 'Doanh thu chờ duyệt',
      value: formatCurrency(pendingRevenue),
      icon: TrendingUp,
      color: 'bg-warning-50 text-warning-600',
      iconBg: 'bg-warning-50',
    },
    {
      title: 'Doanh thu chưa thu',
      value: formatCurrency(unpaidRevenue),
      icon: TrendingUp,
      color: 'bg-danger-50 text-danger-500',
      iconBg: 'bg-danger-50',
    },
  ]

  if (loading) {
    return <LoadingSpinner size="lg" text="Đang tải dashboard..." />
  }

  if (error) {
    return (
      <div className="animate-fade-in p-6">
        <div className="bg-danger-50 text-danger-600 rounded-xl p-4 text-center">
          {error}
          <button onClick={fetchData} className="ml-3 underline font-medium">
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary-100 rounded-xl">
          <LayoutDashboard className="text-primary-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Tổng quan</h1>
          <p className="text-sm text-surface-500">Chào mừng trở lại, {user?.fullName || 'Chủ trọ'}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-3 rounded-xl ${card.iconBg}`}>
              <card.icon size={24} className={card.color.split(' ')[1]} />
            </div>
            <div>
              <p className="text-sm text-surface-500">{card.title}</p>
              <p className="text-xl font-bold text-surface-900 mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart - Doanh thu theo tháng */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Doanh thu theo tháng
          </h2>
          <div className="h-72">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Doughnut chart - Trạng thái phòng */}
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">
            Trạng thái phòng
          </h2>
          <div className="h-72 flex items-center justify-center">
            {totalRooms > 0 ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <p className="text-surface-400 text-sm">Chưa có phòng nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
          <h3 className="text-base font-semibold text-surface-900 mb-3">Danh sách khu trọ</h3>
          {properties.length === 0 ? (
            <p className="text-sm text-surface-400">Chưa có khu trọ nào</p>
          ) : (
            <div className="space-y-2">
              {properties.map((p) => {
                const rooms = allRooms.filter((r) => r.propertyId === p.propertyId)
                const occupied = rooms.filter((r) => r.status === 'unavailable' || r.status === 'UNAVAILABLE').length
                return (
                  <div
                    key={p.propertyId}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-surface-800">{p.name}</p>
                      <p className="text-xs text-surface-400">
                        {p.street}, {p.ward}, {p.district}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary-600">
                        {occupied}/{rooms.length} phòng
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-6">
          <h3 className="text-base font-semibold text-surface-900 mb-3">Phòng trống gần đây</h3>
          {availableRooms === 0 ? (
            <p className="text-sm text-surface-400">Tất cả phòng đã được thuê</p>
          ) : (
            <div className="space-y-2">
              {allRooms
                .filter((r) => r.status === 'available' || r.status === 'AVAILABLE')
                .slice(0, 5)
                .map((r) => (
                  <div
                    key={r.roomId}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-surface-800">Phòng {r.roomNumber}</p>
                      <p className="text-xs text-surface-400">{r.propertyName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-accent-600">{formatCurrency(r.basePrice)}</p>
                      <p className="text-xs text-surface-400">{r.areaSqm}m²</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
