import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { DoorOpen, Plus, ArrowRightLeft, ChevronDown, Maximize2, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { propertyApi } from '../../api/propertyApi'
import { roomApi } from '../../api/roomApi'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatCurrency'

const ELEC_KINDS = [
  { value: 'elec_normal', label: 'Điện sinh hoạt' },
  { value: 'elec_service', label: 'Điện kinh doanh' },
]

const STATUS_MAP = {
  available: { label: 'Còn trống', bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500' },
  AVAILABLE: { label: 'Còn trống', bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500' },
  unavailable: { label: 'Đã cho thuê', bg: 'bg-danger-50', text: 'text-danger-500', dot: 'bg-danger-500' },
  UNAVAILABLE: { label: 'Đã cho thuê', bg: 'bg-danger-50', text: 'text-danger-500', dot: 'bg-danger-500' },
}

const emptyForm = {
  roomNumber: '',
  areaSqm: '',
  maxCapacity: '',
  bedrooms: 1,
  basePrice: '',
  elecPriceKwh: '',
  waterPriceM3: '',
  elecKind: 'elec_normal',
}

const PROPERTY_TYPE_LABELS = {
  studio: 'Studio',
  apartment: 'Chung cư',
  mini_apartment: 'Chung cư mini',
  house: 'Nhà nguyên căn',
}

export default function RoomsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryPropertyId = searchParams.get('propertyId')

  const [properties, setProperties] = useState([])
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(false)
  const [error, setError] = useState('')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (selectedPropertyId) {
      fetchRooms(selectedPropertyId)
    } else {
      setRooms([])
    }
  }, [selectedPropertyId])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const res = await propertyApi.getAll(user.userId)
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      const props = Array.isArray(rawData) ? rawData : []
      setProperties(props)
      if (queryPropertyId) {
        setSelectedPropertyId(queryPropertyId)
      } else if (props.length > 0) {
        setSelectedPropertyId(props[0].propertyId)
      }
    } catch (err) {
      setError('Không thể tải danh sách khu trọ.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRooms = async (propertyId) => {
    try {
      setRoomsLoading(true)
      setError('')
      const res = await roomApi.getByProperty(propertyId)
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      setRooms(Array.isArray(rawData) ? rawData : [])
    } catch (err) {
      setError('Không thể tải danh sách phòng.')
      console.error(err)
    } finally {
      setRoomsLoading(false)
    }
  }

  const openCreate = () => {
    setForm({ ...emptyForm })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.roomNumber.trim() || !selectedPropertyId) return

    try {
      setSaving(true)
      const selectedProperty = properties.find((p) => p.propertyId === selectedPropertyId)
      const isStudioOrMini = selectedProperty?.type === 'studio' || selectedProperty?.type === 'mini_apartment'

      const payload = {
        propertyId: selectedPropertyId,
        roomNumber: form.roomNumber,
        areaSqm: parseFloat(form.areaSqm) || 0,
        maxCapacity: parseInt(form.maxCapacity) || 1,
        bedrooms: isStudioOrMini ? 1 : parseInt(form.bedrooms) || 1,
        basePrice: parseFloat(form.basePrice) || 0,
        elecPriceKwh: parseFloat(form.elecPriceKwh) || 0,
        waterPriceM3: parseFloat(form.waterPriceM3) || 0,
        elecKind: form.elecKind,
      }
      await roomApi.create(payload)
      setShowModal(false)
      fetchRooms(selectedPropertyId)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Không thể tạo phòng. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async (room) => {
    const newStatus = room.status === 'available' || room.status === 'AVAILABLE' ? 'unavailable' : 'available'
    try {
      await roomApi.updateStatus(room.roomId, newStatus)
      fetchRooms(selectedPropertyId)
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Không thể đổi trạng thái phòng.')
    }
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Đang tải..." />
  }

  const selectedProperty = properties.find((p) => p.propertyId === selectedPropertyId)
  const isStudioOrMini = selectedProperty?.type === 'studio' || selectedProperty?.type === 'mini_apartment'

  return (
    <div className="animate-fade-in space-y-6 p-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-sm text-surface-500">
        <Link to="/owner/properties" className="hover:text-primary-600 transition-colors">Khu trọ</Link>
        <span>/</span>
        <span className="font-medium text-surface-900">Phòng trọ</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 rounded-xl">
            <DoorOpen className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Danh sách phòng trọ</h1>
            <p className="text-sm text-surface-500">
              {selectedProperty ? `Khu trọ: ${selectedProperty.name}` : 'Quản lý phòng theo từng khu trọ'}
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedPropertyId}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Thêm phòng
        </button>
      </div>

      {/* Property Selector & Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 animate-fade-in">
        <div className="flex-1 min-w-0 space-y-2">
          <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider">Khu trọ đang chọn</label>
          <div className="relative max-w-md">
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full appearance-none px-3.5 py-2.5 pr-10 border border-surface-200 rounded-xl text-sm font-semibold text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-50 transition-shadow cursor-pointer"
            >
              <option value="">-- Chọn khu trọ --</option>
              {properties.map((p) => (
                <option key={p.propertyId} value={p.propertyId}>
                  {p.name} — {p.street}, {p.district}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
          </div>
        </div>

        {selectedProperty && (
          <div className="border-t md:border-t-0 md:border-l border-surface-100 pt-4 md:pt-0 md:pl-6 flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary-50 text-primary-600">
                {PROPERTY_TYPE_LABELS[selectedProperty.type] || selectedProperty.type}
              </span>
              <span className="text-xs text-surface-400 font-medium">Số phòng: {rooms.length}</span>
            </div>
            <p className="text-sm text-surface-500 flex items-center gap-1.5 truncate">
              <MapPin size={14} className="shrink-0 text-surface-400" />
              {selectedProperty.street}, {selectedProperty.ward}, {selectedProperty.district}, {selectedProperty.city}
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger-50 text-danger-600 rounded-xl p-4 text-center text-sm">
          {error}
        </div>
      )}

      {/* Rooms Grid */}
      {roomsLoading ? (
        <LoadingSpinner text="Đang tải phòng..." />
      ) : !selectedPropertyId ? (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-12 text-center">
          <DoorOpen size={48} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">Vui lòng chọn một khu trọ để xem danh sách phòng</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-12 text-center">
          <DoorOpen size={48} className="text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700">Chưa có phòng nào</h3>
          <p className="text-sm text-surface-400 mt-1">Khu trọ "{selectedProperty?.name}" chưa có phòng</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const statusInfo = STATUS_MAP[room.status] || STATUS_MAP.available
            return (
              <div
                key={room.roomId}
                className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  {/* Room number + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-surface-900">Phòng {room.roomNumber}</h3>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-surface-600">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Diện tích</span>
                      <span className="font-medium">{room.areaSqm} m²</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Sức chứa</span>
                      <span className="font-medium">{room.maxCapacity} người</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-surface-400">Giá phòng</span>
                      <span className="font-semibold text-primary-600">{formatCurrency(room.basePrice)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-100">
                    <button
                      onClick={() => navigate(`/owner/rooms/${room.roomId}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
                    >
                      <Maximize2 size={14} />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => handleStatusToggle(room)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-warning-50 text-warning-600 hover:bg-warning-50/80 transition-colors"
                    >
                      <ArrowRightLeft size={14} />
                      Đổi trạng thái
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Thêm phòng mới"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Số phòng *</label>
              <input
                type="text"
                value={form.roomNumber}
                onChange={(e) => handleChange('roomNumber', e.target.value)}
                placeholder="VD: P101"
                required
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Diện tích (m²)</label>
              <input
                type="number"
                step="0.1"
                value={form.areaSqm}
                onChange={(e) => handleChange('areaSqm', e.target.value)}
                placeholder="VD: 25"
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Sức chứa (người)</label>
              <input
                type="number"
                value={form.maxCapacity}
                onChange={(e) => handleChange('maxCapacity', e.target.value)}
                placeholder="VD: 2"
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Số phòng ngủ</label>
              <select
                value={isStudioOrMini ? 1 : form.bedrooms || 1}
                onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 1)}
                disabled={isStudioOrMini}
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed"
              >
                <option value={1}>1 phòng ngủ</option>
                <option value={2}>2 phòng ngủ</option>
                <option value={3}>3 phòng ngủ</option>
                <option value={4}>4 phòng ngủ</option>
                <option value={5}>5 phòng ngủ</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Giá phòng (VNĐ)</label>
              <input
                type="number"
                value={form.basePrice}
                onChange={(e) => handleChange('basePrice', e.target.value)}
                placeholder="VD: 3500000"
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Giá điện (₫/kWh)</label>
              <input
                type="number"
                step="100"
                value={form.elecPriceKwh}
                onChange={(e) => handleChange('elecPriceKwh', e.target.value)}
                placeholder="VD: 3500"
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Giá nước (₫/m³)</label>
              <input
                type="number"
                step="1000"
                value={form.waterPriceM3}
                onChange={(e) => handleChange('waterPriceM3', e.target.value)}
                placeholder="VD: 15000"
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Loại điện</label>
              <select
                value={form.elecKind}
                onChange={(e) => handleChange('elecKind', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                {ELEC_KINDS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2.5 text-sm font-medium rounded-xl border border-surface-300 text-surface-700 hover:bg-surface-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Đang tạo...' : 'Tạo phòng'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
