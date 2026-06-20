import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Plus, Pencil, Trash2, MapPin, Home } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { propertyApi } from '../../api/propertyApi'
import { roomApi } from '../../api/roomApi'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const PROPERTY_TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Chung cư' },
  { value: 'mini_apartment', label: 'Chung cư mini' },
  { value: 'house', label: 'Nhà nguyên căn' },
]

const PROPERTY_TYPE_LABELS = {
  studio: 'Studio',
  apartment: 'Chung cư',
  mini_apartment: 'Chung cư mini',
  house: 'Nhà nguyên căn',
}

const emptyForm = {
  name: '',
  street: '',
  ward: '',
  district: '',
  city: '',
  type: 'studio',
}

export default function PropertiesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [roomCounts, setRoomCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...emptyForm })

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Vietnam Administrative Division States
  const [provinces, setProvinces] = useState([])
  const [districts, setDistricts] = useState([])
  const [wards, setWards] = useState([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('')
  const [selectedWardCode, setSelectedWardCode] = useState('')
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  useEffect(() => {
    fetchProperties()
    loadProvinces()
  }, [])

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true)
      const res = await fetch('https://provinces.open-api.vn/api/v1/p/')
      const data = await res.json()
      setProvinces(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load provinces:', err)
    } finally {
      setLoadingProvinces(false)
    }
  }

  const handleProvinceChange = async (provCode) => {
    setSelectedProvinceCode(provCode)
    setDistricts([])
    setSelectedDistrictCode('')
    setWards([])
    setSelectedWardCode('')
    
    if (!provCode) {
      setForm(prev => ({ ...prev, city: '', district: '', ward: '' }))
      return
    }

    const prov = provinces.find(p => String(p.code) === String(provCode))
    setForm(prev => ({ ...prev, city: prov ? prov.name : '', district: '', ward: '' }))

    setLoadingDistricts(true)
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/v1/p/${provCode}?depth=2`)
      const data = await res.json()
      setDistricts(data.districts || [])
    } catch (err) {
      console.error('Failed to fetch districts:', err)
    } finally {
      setLoadingDistricts(false)
    }
  }

  const handleDistrictChange = async (distCode) => {
    setSelectedDistrictCode(distCode)
    setWards([])
    setSelectedWardCode('')

    if (!distCode) {
      setForm(prev => ({ ...prev, district: '', ward: '' }))
      return
    }

    const dist = districts.find(d => String(d.code) === String(distCode))
    setForm(prev => ({ ...prev, district: dist ? dist.name : '', ward: '' }))

    setLoadingWards(true)
    try {
      const res = await fetch(`https://provinces.open-api.vn/api/v1/d/${distCode}?depth=2`)
      const data = await res.json()
      setWards(data.wards || [])
    } catch (err) {
      console.error('Failed to fetch wards:', err)
    } finally {
      setLoadingWards(false)
    }
  }

  const handleWardChange = (wardCode) => {
    setSelectedWardCode(wardCode)
    if (!wardCode) {
      setForm(prev => ({ ...prev, ward: '' }))
      return
    }
    const w = wards.find(ward => String(ward.code) === String(wardCode))
    setForm(prev => ({ ...prev, ward: w ? w.name : '' }))
  }

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await propertyApi.getAll(user.userId)
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      const props = Array.isArray(rawData) ? rawData : []
      setProperties(props)

      // Lấy số phòng cho từng khu trọ
      const counts = {}
      await Promise.all(
        props.map(async (p) => {
          try {
            const roomRes = await roomApi.getByProperty(p.propertyId)
            const rawRoomData = roomRes.data?.data !== undefined ? roomRes.data.data : roomRes.data
            const roomList = Array.isArray(rawRoomData) ? rawRoomData : []
            counts[p.propertyId] = roomList.length
          } catch {
            counts[p.propertyId] = 0
          }
        })
      )
      setRoomCounts(counts)
    } catch (err) {
      setError('Không thể tải danh sách khu trọ.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setSelectedProvinceCode('')
    setDistricts([])
    setSelectedDistrictCode('')
    setWards([])
    setSelectedWardCode('')
    setShowModal(true)
  }

  const openEdit = async (property) => {
    setEditingId(property.propertyId)
    setForm({
      name: property.name || '',
      street: property.street || '',
      ward: property.ward || '',
      district: property.district || '',
      city: property.city || '',
      type: property.type || 'studio',
    })
    setShowModal(true)

    // Prepopulate cascaded address selectors if matching options exist
    if (property.city) {
      let matchedProv = provinces.find(p => p.name === property.city)
      
      let currentProvinces = provinces
      if (currentProvinces.length === 0) {
        try {
          const res = await fetch('https://provinces.open-api.vn/api/v1/p/')
          currentProvinces = await res.json()
          setProvinces(Array.isArray(currentProvinces) ? currentProvinces : [])
          matchedProv = currentProvinces.find(p => p.name === property.city)
        } catch (err) {
          console.error(err)
        }
      }

      if (matchedProv) {
        setSelectedProvinceCode(matchedProv.code)
        setLoadingDistricts(true)
        try {
          const res = await fetch(`https://provinces.open-api.vn/api/v1/p/${matchedProv.code}?depth=2`)
          const data = await res.json()
          const distList = data.districts || []
          setDistricts(distList)

          if (property.district) {
            const matchedDist = distList.find(d => d.name === property.district)
            if (matchedDist) {
              setSelectedDistrictCode(matchedDist.code)
              setLoadingWards(true)
              const wRes = await fetch(`https://provinces.open-api.vn/api/v1/d/${matchedDist.code}?depth=2`)
              const wData = await wRes.json()
              const wardList = wData.wards || []
              setWards(wardList)

              if (property.ward) {
                const matchedWard = wardList.find(w => w.name === property.ward)
                if (matchedWard) {
                  setSelectedWardCode(matchedWard.code)
                }
              }
            }
          }
        } catch (err) {
          console.error('Error fetching details for edit prepopulate:', err)
        } finally {
          setLoadingDistricts(false)
          setLoadingWards(false)
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.street.trim() || !form.city.trim() || !form.district.trim() || !form.ward.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin tên và địa chỉ khu trọ.')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...form,
        ownerId: user.userId,
      }

      if (editingId) {
        await propertyApi.update(editingId, payload)
      } else {
        await propertyApi.create(payload)
      }

      setShowModal(false)
      fetchProperties()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await propertyApi.delete(deleteTarget)
      fetchProperties()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Không thể xóa khu trọ.')
    }
    setDeleteTarget(null)
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <LoadingSpinner size="lg" text="Đang tải danh sách khu trọ..." />
  }

  return (
    <div className="animate-fade-in space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 rounded-xl">
            <Building2 className="text-primary-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Khu trọ</h1>
            <p className="text-sm text-surface-500">Quản lý các khu trọ của bạn</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Thêm khu trọ
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger-50 text-danger-600 rounded-xl p-4 text-center">
          {error}
          <button onClick={fetchProperties} className="ml-3 underline font-medium">
            Thử lại
          </button>
        </div>
      )}

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-surface-100 p-12 text-center">
          <Building2 size={48} className="text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-700">Chưa có khu trọ nào</h3>
          <p className="text-sm text-surface-400 mt-1 mb-4">Bắt đầu bằng cách thêm khu trọ đầu tiên</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus size={18} />
            Thêm khu trọ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div
              key={property.propertyId}
              className="bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Clickable Card Body */}
              <div 
                onClick={() => navigate(`/owner/rooms?propertyId=${property.propertyId}`)}
                className="p-5 cursor-pointer flex-1 hover:bg-surface-50/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary-50 rounded-lg">
                      <Home size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-surface-900 hover:text-primary-600 transition-colors">{property.name}</h3>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary-600">
                        {PROPERTY_TYPE_LABELS[property.type] || property.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-sm text-surface-500 mb-2">
                  <MapPin size={15} className="mt-0.5 shrink-0" />
                  <span>
                    {property.street}, {property.ward}, {property.district}, {property.city}
                  </span>
                </div>
              </div>

              {/* Action Footer (not clickable) */}
              <div className="px-5 py-3.5 bg-surface-50/50 border-t border-surface-100 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-surface-500">Số phòng: </span>
                  <span className="font-semibold text-primary-600">
                    {roomCounts[property.propertyId] ?? '—'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEdit(property)}
                    className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(property.propertyId)}
                    className="p-2 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Chỉnh sửa khu trọ' : 'Thêm khu trọ mới'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1">Tên khu trọ <span className="text-danger-500">*</span></label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: Nhà trọ Bình An"
                required
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Loại hình</label>
              <select
                value={form.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow bg-white"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-surface-100 pt-4">
            <h4 className="text-xs font-semibold text-surface-450 uppercase tracking-wider mb-3">Địa chỉ khu trọ</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thành phố */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1">
                  Thành phố <span className="text-danger-500">*</span>
                </label>
                {provinces.length > 0 ? (
                  <select
                    value={selectedProvinceCode}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow bg-white"
                  >
                    <option value="">-- Chọn Thành phố --</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="VD: TP. Hồ Chí Minh"
                    required
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                )}
              </div>

              {/* Quận / Huyện */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1">
                  Quận / Huyện <span className="text-danger-500">*</span>
                </label>
                {provinces.length > 0 ? (
                  <select
                    value={selectedDistrictCode}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    disabled={!selectedProvinceCode || loadingDistricts}
                    required
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow bg-white disabled:opacity-60 disabled:bg-surface-50"
                  >
                    <option value="">
                      {loadingDistricts ? 'Đang tải...' : '-- Chọn Quận / Huyện --'}
                    </option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                    placeholder="VD: Quận 5"
                    required
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                )}
              </div>

              {/* Phường / Xã */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1">
                  Phường / Xã <span className="text-danger-500">*</span>
                </label>
                {provinces.length > 0 ? (
                  <select
                    value={selectedWardCode}
                    onChange={(e) => handleWardChange(e.target.value)}
                    disabled={!selectedDistrictCode || loadingWards}
                    required
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow bg-white disabled:opacity-60 disabled:bg-surface-50"
                  >
                    <option value="">
                      {loadingWards ? 'Đang tải...' : '-- Chọn Phường / Xã --'}
                    </option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.ward}
                    onChange={(e) => handleChange('ward', e.target.value)}
                    placeholder="VD: Phường 1"
                    required
                    className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  />
                )}
              </div>

              {/* Đường / Số nhà */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5 flex items-center gap-1">
                  Đường / Số nhà <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => handleChange('street', e.target.value)}
                  placeholder="VD: 123 Nguyễn Văn Cừ"
                  required
                  className="w-full px-3.5 py-2.5 border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-100">
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
              {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa khu trọ"
        message="Bạn có chắc muốn xóa khu trọ này? Thao tác này không thể hoàn tác."
        confirmText="Xóa"
        danger
      />
    </div>
  )
}
