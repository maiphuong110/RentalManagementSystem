import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { postApi } from '../../api/postApi'
import { propertyApi } from '../../api/propertyApi'
import { roomApi } from '../../api/roomApi'
import { getAssetUrl } from '../../api/axiosInstance'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import AmenityIcon from '../../components/ui/AmenityIcon'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const STATUS_MAP = {
  active: { label: 'Đang hiển thị', bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500' },
  ACTIVE: { label: 'Đang hiển thị', bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500' },
  hidden: { label: 'Đã ẩn', bg: 'bg-warning-50', text: 'text-warning-500', dot: 'bg-warning-500' },
  HIDDEN: { label: 'Đã ẩn', bg: 'bg-warning-50', text: 'text-warning-500', dot: 'bg-warning-500' },
  expired: { label: 'Hết hạn', bg: 'bg-danger-50', text: 'text-danger-500', dot: 'bg-danger-500' },
  EXPIRED: { label: 'Hết hạn', bg: 'bg-danger-50', text: 'text-danger-500', dot: 'bg-danger-500' },
}

const emptyForm = {
  roomId: '',
  title: '',
  description: '',
  status: 'active',
  publishedAt: '',
  expiresAt: '',
}

export default function PostsPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [posts, setPosts] = useState([])
  const [properties, setProperties] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [form, setForm] = useState({ ...emptyForm })

  // Image modal state
  const [selectedPost, setSelectedPost] = useState(null)
  const [postImages, setPostImages] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  // Image selection inside the creation/edit form
  const [selectedFiles, setSelectedFiles] = useState([])
  const [filePreviews, setFilePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [saveStatusText, setSaveStatusText] = useState('')
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (form.roomId) {
      fetchSelectedRoomDetails(form.roomId)
    } else {
      setSelectedRoomDetails(null)
    }
  }, [form.roomId])

  const fetchSelectedRoomDetails = async (roomId) => {
    try {
      const res = await roomApi.getById(roomId)
      const data = res.data?.data || res.data
      setSelectedRoomDetails(data)
    } catch (err) {
      console.error(err)
      setSelectedRoomDetails(null)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchProperties()
  }, [])

  useEffect(() => {
    if (location.state?.prefillRoomId) {
      const state = location.state
      setEditingId(null)
      setSelectedPropertyId(state.prefillPropertyId)

      setForm({
        roomId: state.prefillRoomId,
        title: `Cho thuê phòng trọ khép kín - Phòng ${state.prefillRoomNumber}`,
        description: `Cho thuê phòng trọ số ${state.prefillRoomNumber}, diện tích ${state.prefillAreaSqm}m², sức chứa tối đa ${state.prefillMaxCapacity} người. Giá thuê: ${formatCurrency(state.prefillBasePrice)}/tháng.`,
        status: 'active',
        publishedAt: new Date().toISOString().substring(0, 16),
        expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().substring(0, 16),
      })
      setSelectedFiles([])
      setFilePreviews([])
      setExistingImages([])
      setError('')
      setShowFormModal(true)

      // Clean window state so it doesn't reopen if refreshed or navigated back
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await postApi.getAll()
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      const postsData = Array.isArray(rawData) ? rawData : []

      // Fetch room details in parallel
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          let room = null
          if (post.roomId) {
            try {
              const roomRes = await roomApi.getById(post.roomId)
              room = roomRes.data?.data || roomRes.data
            } catch (err) {
              console.error(err)
            }
          }
          return { ...post, room }
        })
      )
      setPosts(postsWithDetails)
    } catch (err) {
      setError('Không thể tải danh sách tin đăng.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchProperties = async () => {
    try {
      const res = await propertyApi.getAll(user.userId)
      setProperties(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Lỗi tải danh sách khu trọ:', err)
    }
  }

  // Khi chọn khu trọ trong Form, tải danh sách phòng của khu trọ đó
  useEffect(() => {
    if (selectedPropertyId) {
      fetchRoomsOfProperty(selectedPropertyId)
    } else {
      setRooms([])
    }
  }, [selectedPropertyId])

  const fetchRoomsOfProperty = async (propertyId) => {
    try {
      const res = await roomApi.getByProperty(propertyId)
      setRooms(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Lỗi tải danh sách phòng:', err)
    }
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setSelectedPropertyId('')
    setForm({
      ...emptyForm,
      publishedAt: new Date().toISOString().substring(0, 16),
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().substring(0, 16),
    })
    setSelectedFiles([])
    setFilePreviews([])
    setExistingImages([])
    setError('')
    setShowFormModal(true)
  }

  const handleOpenEdit = async (post) => {
    setEditingId(post.postId)
    setError('')
    setSelectedFiles([])
    setFilePreviews([])
    setExistingImages(post.images || [])

    // Load fresh images list from server to be sure
    try {
      const imgRes = await postApi.getImages(post.postId)
      setExistingImages(imgRes.data?.data || imgRes.data || [])
    } catch (err) {
      console.error(err)
    }

    // Tìm phòng và khu trọ của bài đăng này để tự động select
    try {
      const roomRes = await roomApi.getById(post.roomId)
      const roomData = roomRes.data?.data || roomRes.data
      if (roomData?.propertyId) {
        setSelectedPropertyId(roomData.propertyId)
      }
    } catch (err) {
      console.error(err)
    }

    setForm({
      roomId: post.roomId,
      title: post.title,
      description: post.description || '',
      status: post.status?.toLowerCase() || 'active',
      publishedAt: post.publishedAt ? post.publishedAt.substring(0, 16) : '',
      expiresAt: post.expiresAt ? post.expiresAt.substring(0, 16) : '',
    })
    setShowFormModal(true)
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Validate image format and size
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/')
      const isLt5M = file.size <= 5 * 1024 * 1024
      if (!isValid) alert(`File ${file.name} không phải là ảnh.`)
      if (!isLt5M) alert(`File ${file.name} vượt quá 5MB.`)
      return isValid && isLt5M
    })

    const newFiles = [...selectedFiles, ...validFiles]
    setSelectedFiles(newFiles)

    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setFilePreviews([...filePreviews, ...newPreviews])
  }

  const handleRemoveSelectedFile = (index) => {
    const updatedFiles = [...selectedFiles]
    const updatedPreviews = [...filePreviews]

    URL.revokeObjectURL(updatedPreviews[index])

    updatedFiles.splice(index, 1)
    updatedPreviews.splice(index, 1)

    setSelectedFiles(updatedFiles)
    setFilePreviews(updatedPreviews)
  }

  const handleDeleteExistingImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này khỏi tin đăng?')) return
    try {
      await postApi.deleteImage(editingId, imageId)
      // Refresh existing images list
      setExistingImages(existingImages.filter(img => img.imageId !== imageId))
    } catch (err) {
      alert('Xóa ảnh thất bại.')
      console.error(err)
    }
  }

  const handleSavePost = async (e) => {
    e.preventDefault()
    if (!form.roomId) {
      setError('Vui lòng chọn phòng để đăng tin.')
      return
    }
    try {
      setSaving(true)
      setError('')
      setSaveStatusText(editingId ? 'Đang cập nhật tin đăng...' : 'Đang tạo tin đăng...')

      const formatLocalDateTime = (str) => {
        if (!str) return null
        if (str.includes('Z')) return str.substring(0, 19)
        const parts = str.split(':')
        if (parts.length === 2) return `${str}:00`
        return str
      }

      const postData = {
        roomId: Number(form.roomId),
        title: form.title,
        description: form.description,
        status: form.status,
        publishedAt: formatLocalDateTime(form.publishedAt),
        expiresAt: formatLocalDateTime(form.expiresAt),
      }

      let savedPostId = editingId
      if (editingId) {
        await postApi.update(editingId, postData)
      } else {
        const res = await postApi.create(postData)
        const resData = res.data?.data !== undefined ? res.data.data : res.data
        savedPostId = resData.postId
      }

      // Upload selected files
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setSaveStatusText(`Đang tải ảnh lên (${i + 1}/${selectedFiles.length})...`)
          await postApi.uploadImage(savedPostId, selectedFiles[i])
        }
      }

      // Clean up object URLs
      filePreviews.forEach(url => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setFilePreviews([])

      setShowFormModal(false)
      fetchPosts()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu tin đăng.')
    } finally {
      setSaving(false)
      setSaveStatusText('')
    }
  }

  const handleDeletePost = async () => {
    if (!deleteTarget) return
    try {
      setLoading(true)
      await postApi.delete(deleteTarget.postId)
      fetchPosts()
    } catch (err) {
      setError('Xóa tin đăng thất bại.')
      console.error(err)
    } finally {
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  // ===== Quản lý ảnh =====
  const handleOpenImages = async (post) => {
    setSelectedPost(post)
    setImageError('')
    setShowImageModal(true)
    await fetchPostImages(post.postId)
  }

  const fetchPostImages = async (postId) => {
    try {
      const res = await postApi.getImages(postId)
      setPostImages(res.data?.data || res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setUploadingImage(true)
      setImageError('')
      await postApi.uploadImage(selectedPost.postId, file)
      await fetchPostImages(selectedPost.postId)
    } catch (err) {
      setImageError('Tải ảnh lên thất bại. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleDeleteImage = async (imageId) => {
    try {
      await postApi.deleteImage(selectedPost.postId, imageId)
      await fetchPostImages(selectedPost.postId)
    } catch (err) {
      setImageError('Xóa ảnh thất bại.')
      console.error(err)
    }
  }

  const getStatusStyle = (status) => {
    const key = status?.toLowerCase() || 'active'
    return STATUS_MAP[key] || { label: status, bg: 'bg-surface-50', text: 'text-surface-600', dot: 'bg-surface-400' }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Quản lý tin đăng</h1>
          <p className="text-sm text-surface-500 mt-1">Đăng tin cho thuê các phòng trọ trống để tiếp cận người thuê</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/10"
        >
          <Plus size={18} />
          Tạo tin đăng mới
        </button>
      </div>

      {loading && posts.length === 0 ? (
        <LoadingSpinner size="lg" text="Đang tải danh sách tin đăng..." />
      ) : (
        <>
          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-200 p-12 text-center max-w-md mx-auto mt-8">
              <div className="p-4 bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-primary-600 mb-4">
                <Building2 size={32} />
              </div>
              <h3 className="text-lg font-semibold text-surface-900">Chưa có tin đăng nào</h3>
              <p className="text-sm text-surface-500 mt-2">
                Hãy bắt đầu tạo tin đăng cho thuê phòng để có thể kết nối với những khách hàng đang tìm phòng.
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-6 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
              >
                Tạo tin đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                const statusStyle = getStatusStyle(post.status)
                const hasImages = post.images && post.images.length > 0
                const coverImage = hasImages ? getAssetUrl(post.images[0].postImageUrl) : null

                return (
                  <div
                    key={post.postId}
                    className="bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-xl hover:border-surface-300 transition-all flex flex-col group"
                  >
                    {/* Cover image / placeholder */}
                    <div className="relative h-48 bg-surface-100 flex items-center justify-center overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-surface-400">
                          <ImageIcon size={40} className="stroke-1 mb-2" />
                          <span className="text-xs">Chưa có hình ảnh</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-surface-950 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-surface-500 mt-1 line-clamp-2 min-h-[40px]">
                        {post.description || 'Không có mô tả.'}
                      </p>

                      <div className="mt-4 pt-4 border-t border-surface-100 grid grid-cols-2 gap-4 text-xs text-surface-500">
                        <div>
                          <p className="text-surface-400">Phòng đăng tin</p>
                          <p className="font-semibold text-surface-700 mt-0.5">Phòng {post.room?.roomNumber || post.roomId}</p>
                        </div>
                        <div>
                          <p className="text-surface-400">Ngày đăng</p>
                          <p className="font-medium text-surface-700 mt-0.5">{formatDate(post.publishedAt)}</p>
                        </div>
                      </div>

                      {post.room?.amenities?.length > 0 && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5 border-t border-surface-100/70 pt-3">
                          {post.room.amenities.slice(0, 3).map((a) => (
                            <span key={a.amenityId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-50 border border-surface-150 rounded-lg text-[10px] text-surface-500 font-medium">
                              <AmenityIcon iconName={a.icon} showBg={false} size={10} />
                              {a.name}
                            </span>
                          ))}
                          {post.room.amenities.length > 3 && (
                            <span className="text-[10px] text-surface-400 font-medium self-center ml-1">
                              +{post.room.amenities.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-6 flex items-center gap-2">
                        <button
                          onClick={() => handleOpenImages(post)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border border-surface-200 text-surface-600 hover:bg-surface-50 transition-colors"
                        >
                          <ImageIcon size={14} />
                          Ảnh ({post.images?.length || 0})
                        </button>
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 rounded-xl border border-surface-200 text-surface-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Sửa tin đăng"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(post)}
                          className="p-2 rounded-xl border border-surface-200 text-surface-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                          title="Xóa tin đăng"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT POST MODAL */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingId ? 'Cập nhật tin đăng' : 'Tạo tin đăng mới'}
        size="lg"
      >
        <form onSubmit={handleSavePost} className="space-y-4">
          {error && (
            <div className="p-3.5 bg-danger-50 text-danger-600 text-sm rounded-xl flex items-start gap-2.5">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Khu trọ</label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                disabled={!!editingId}
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
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Phòng cần đăng</label>
              <select
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
                disabled={!selectedPropertyId || !!editingId}
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r) => (
                  <option key={r.roomId} value={r.roomId}>
                    Phòng {r.roomNumber} - {formatCurrency(r.basePrice)}/tháng ({r.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedRoomDetails?.amenities?.length > 0 && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-surface-700 mb-1.5">Tiện ích đi kèm phòng (hiển thị riêng trong tin đăng)</label>
              <div className="flex flex-wrap gap-2 p-3 bg-surface-50 border border-surface-150 rounded-xl">
                {selectedRoomDetails.amenities.map((a) => (
                  <span
                    key={a.amenityId}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white border border-surface-200 rounded-lg text-xs text-surface-600 shadow-sm"
                  >
                    <AmenityIcon iconName={a.icon} showBg={false} size={14} className="mr-0.5" />
                    {a.name}
                    {a.monthlyFee > 0 && (
                      <span className="text-surface-400 ml-0.5 text-[10px]">
                        ({formatCurrency(a.monthlyFee)})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Tiêu đề tin đăng</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Phòng trọ khép kín đầy đủ tiện nghi quận Cầu Giấy..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Mô tả chi tiết</label>
            <textarea
              rows={4}
              placeholder="Mô tả đặc điểm phòng, tiện ích, vị trí, quy định, thông tin liên hệ..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5 font-semibold">Hình ảnh tin đăng</label>

            {/* Grid of previews */}
            {((editingId && existingImages.length > 0) || filePreviews.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-3">
                {/* Existing Images */}
                {editingId && existingImages.map((img) => (
                  <div key={img.imageId} className="relative aspect-video rounded-xl overflow-hidden border border-surface-200 bg-surface-50 group">
                    <img
                      src={getAssetUrl(img.postImageUrl)}
                      alt="Existing image"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(img.imageId)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-danger-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Xoa anh"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Newly Selected Previews */}
                {filePreviews.map((previewUrl, index) => (
                  <div key={previewUrl} className="relative aspect-video rounded-xl overflow-hidden border border-surface-200 bg-surface-50 group">
                    <img
                      src={previewUrl}
                      alt="New preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-600/90 text-white text-[9px] font-bold rounded">Mới</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(index)}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-danger-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Bo chon"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File Upload Trigger */}
            <div className="border-2 border-dashed border-surface-200 hover:border-primary-400 hover:bg-surface-50/50 rounded-xl p-4 flex flex-col items-center justify-center bg-surface-50 cursor-pointer relative group transition-all">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="text-surface-400 group-hover:text-primary-500 mb-1 transition-colors" size={20} />
              <p className="text-xs font-semibold text-surface-700">Nhấp để chọn ảnh tải lên</p>
              <p className="text-[10px] text-surface-400 mt-0.5">Tải lên nhiều file ảnh PNG, JPG, JPEG (tối đa 5MB/file)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
              >
                <option value="active">Hiển thị</option>
                <option value="hidden">Ẩn tin</option>
                <option value="expired">Hết hạn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Ngày xuất bản</label>
              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Ngày hết hạn</label>
              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-150 items-center">
            {saveStatusText && (
              <span className="text-xs text-primary-600 animate-pulse flex items-center gap-1.5 mr-auto">
                <span className="h-2 w-2 rounded-full bg-primary-600 animate-ping" />
                {saveStatusText}
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-surface-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {saving ? 'Đang lưu...' : 'Lưu tin đăng'}
            </button>
          </div>
        </form>
      </Modal>

      {/* IMAGE MANAGEMENT MODAL */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title={`Quản lý hình ảnh: ${selectedPost?.title}`}
        size="lg"
      >
        <div className="space-y-6">
          {imageError && (
            <div className="p-3 bg-danger-50 text-danger-600 text-xs rounded-xl">
              {imageError}
            </div>
          )}

          {/* Upload Section */}
          <div className="p-6 border-2 border-dashed border-surface-200 rounded-2xl flex flex-col items-center justify-center bg-surface-50 group hover:border-primary-400 transition-colors relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={uploadingImage}
            />
            {uploadingImage ? (
              <LoadingSpinner size="sm" text="Đang tải ảnh lên..." />
            ) : (
              <>
                <Upload className="text-surface-400 group-hover:text-primary-500 mb-2 transition-colors" size={28} />
                <p className="text-sm font-semibold text-surface-700">Tải ảnh mới lên</p>
                <p className="text-xs text-surface-400 mt-1">Hỗ trợ các định dạng PNG, JPG, JPEG</p>
              </>
            )}
          </div>

          {/* Images Grid */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 mb-3">Danh sách hình ảnh hiện tại</h3>
            {postImages.length === 0 ? (
              <p className="text-xs text-surface-400 italic">Chưa có ảnh nào được tải lên cho bài viết này.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {postImages.map((img) => (
                  <div
                    key={img.imageId}
                    className="relative group aspect-video rounded-xl overflow-hidden border border-surface-200 bg-surface-100"
                  >
                    <img
                      src={getAssetUrl(img.postImageUrl)}
                      alt="Post attachment"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDeleteImage(img.imageId)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-danger-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Xóa ảnh này"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-surface-150">
            <button
              onClick={() => {
                setShowImageModal(false)
                fetchPosts() // Để update số ảnh ở list bên ngoài
              }}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePost}
        title="Xóa tin đăng"
        message={`Bạn có chắc chắn muốn xóa tin đăng "${deleteTarget?.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tin"
        danger
      />
    </div>
  )
}
