import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Clock, MapPin, Maximize2, BedDouble, Zap, Droplets,
  MessageCircle, ImageOff, ChevronLeft, ChevronRight, Star, Shield, Wifi,
  Building2, DoorOpen, Users,
} from 'lucide-react'
import { postApi } from '../../api/postApi'
import { roomApi } from '../../api/roomApi'
import { propertyApi } from '../../api/propertyApi'
import { chatApi } from '../../api/chatApi'
import { getAssetUrl } from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import AuthModal from '../../components/auth/AuthModal'
import AmenityIcon from '../../components/ui/AmenityIcon'

export default function PostDetailPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [post, setPost] = useState(null)
  const [room, setRoom] = useState(null)
  const [ownerId, setOwnerId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const [suggestions, setSuggestions] = useState([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)

  const fetchSuggestions = async (currentPost, currentRoom, currentProperty) => {
    try {
      setSuggestionsLoading(true)
      const res = await postApi.getAll('active')
      const allPosts = res.data?.data || res.data || []
      
      if (!Array.isArray(allPosts)) return

      // Exclude current post
      let list = allPosts.filter(p => p.postId !== currentPost.postId)

      const currentPropId = currentRoom?.propertyId || currentProperty?.propertyId
      const currentDistrict = currentProperty?.district?.toLowerCase()?.trim()
      const currentCity = currentProperty?.city?.toLowerCase()?.trim()

      const getPriority = (p) => {
        const pRoom = p.room
        const pProp = p.property
        
        // 1. Same property, room is available
        const isSameProperty = currentPropId && pProp?.propertyId === currentPropId
        const isAvailable = pRoom?.status?.toLowerCase() === 'available' || pRoom?.status === 'AVAILABLE'
        if (isSameProperty && isAvailable) return 4
        
        // 2. Same property, room not available
        if (isSameProperty) return 3

        // 3. Same district
        if (currentDistrict && pProp?.district?.toLowerCase()?.trim() === currentDistrict) return 2

        // 4. Same city
        if (currentCity && pProp?.city?.toLowerCase()?.trim() === currentCity) return 1

        return 0
      }

      list = list
        .map(p => ({ post: p, priority: getPriority(p) }))
        .filter(item => item.priority > 0)
        .sort((a, b) => b.priority - a.priority)
        .map(item => item.post)
        .slice(0, 6)

      setSuggestions(list)
    } catch (err) {
      console.error('Không thể tải gợi ý phòng lân cận:', err)
    } finally {
      setSuggestionsLoading(false)
    }
  }

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await postApi.getById(postId)
      const postData = res.data?.data || res.data
      setPost(postData)

      // Fetch room details if roomId exists
      let roomData = null
      let propData = null
      if (postData?.roomId) {
        try {
          const roomRes = await roomApi.getById(postData.roomId)
          roomData = roomRes.data?.data || roomRes.data
          setRoom(roomData)

          if (roomData?.propertyId) {
            const propRes = await propertyApi.getById(roomData.propertyId)
            propData = propRes.data?.data || propRes.data
            setOwnerId(propData?.ownerId || null)
          }
        } catch {
          // Room fetch failed, continue without room data
        }
      }

      fetchSuggestions(postData, roomData, propData)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin bài đăng.')
    } finally {
      setLoading(false)
    }
  }

  const handleChat = async (currentUser = user) => {
    if (!post) return
    if (!ownerId) {
      alert('Không tìm thấy thông tin chủ nhà để nhắn tin.')
      return
    }

    if (!currentUser) {
      setIsAuthModalOpen(true)
      return
    }

    setChatLoading(true)
    try {
      const res = await chatApi.getOrCreate({ receiverId: ownerId, postId: null })
      const conversation = res.data?.data || res.data
      navigate('/chat', {
        state: {
          conversationId: conversation?.conversationId,
          autoSendPostId: post.postId
        }
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo cuộc trò chuyện.')
    } finally {
      setChatLoading(false)
    }
  }

  const sortedImages = post?.images?.length
    ? [...post.images].sort((a, b) => a.sortOrder - b.sortOrder)
    : []

  const prevImage = () => setActiveImage((i) => (i === 0 ? sortedImages.length - 1 : i - 1))
  const nextImage = () => setActiveImage((i) => (i === sortedImages.length - 1 ? 0 : i + 1))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" text="Đang tải bài đăng..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="animate-fade-in max-w-2xl mx-auto py-20 text-center">
        <div className="p-6 bg-danger-50 border border-danger-200 rounded-2xl">
          <p className="text-danger-600 font-medium mb-3">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mx-auto text-sm text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft size={16} /> Quay lại
          </button>
        </div>
      </div>
    )
  }

  if (!post) return null

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-surface-500 hover:text-primary-600 mb-5 transition-colors"
      >
        <ArrowLeft size={18} /> Quay lại tìm kiếm
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Images + Details ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            {sortedImages.length > 0 ? (
              <>
                <div className="relative h-72 sm:h-96 bg-surface-100">
                  <img
                    src={getAssetUrl(sortedImages[activeImage]?.postImageUrl)}
                    alt={`Ảnh ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {sortedImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/50 text-white text-xs rounded-lg">
                        {activeImage + 1} / {sortedImages.length}
                      </div>
                    </>
                  )}
                </div>
                {/* Thumbnails */}
                {sortedImages.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {sortedImages.map((img, idx) => (
                      <button
                        key={img.imageId}
                        onClick={() => setActiveImage(idx)}
                        className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                          idx === activeImage ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={getAssetUrl(img.postImageUrl)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex items-center justify-center bg-surface-50">
                <ImageOff size={48} className="text-surface-300" />
              </div>
            )}
          </div>

          {/* Post Info */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-surface-900">{post.title}</h1>
              <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-semibold ${
                post.status === 'active'
                  ? 'bg-accent-50 text-accent-700'
                  : 'bg-surface-100 text-surface-600'
              }`}>
                {post.status === 'active' ? 'Đang đăng' : post.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-surface-500 mb-6">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} className="text-surface-400" />
                  Đăng: {formatDate(post.publishedAt)}
                </span>
              )}
              {post.expiresAt && (
                <span className="flex items-center gap-1.5">
                  <Clock size={15} className="text-surface-400" />
                  Hết hạn: {formatDate(post.expiresAt)}
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-surface-700">
              <h3 className="text-base font-semibold text-surface-900 mb-2">Mô tả</h3>
              <p className="whitespace-pre-wrap">{post.description || 'Chưa có mô tả.'}</p>
            </div>

            {/* Rules */}
            {post.rules?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-surface-100">
                <h3 className="text-base font-semibold text-surface-900 mb-3 flex items-center gap-2">
                  <Shield size={18} className="text-warning-500" />
                  Nội quy phòng
                </h3>
                <ul className="space-y-2">
                  {post.rules.map((rule) => (
                    <li key={rule.ruleId} className="flex items-start gap-2 text-sm text-surface-600">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      {rule.ruleText}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-6">
          {/* Room Info Card */}
          {room ? (
            <div className="bg-white rounded-2xl border border-surface-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-surface-900 mb-1">
                Phòng {room.roomNumber}
              </h3>
              <p className="text-sm text-surface-500 flex items-center gap-1 mb-5">
                <Building2 size={14} /> {room.propertyName}
              </p>

              {/* Price */}
              <div className="bg-primary-50 rounded-xl p-4 mb-5">
                <p className="text-sm text-primary-600 font-medium">Giá thuê</p>
                <p className="text-2xl font-bold text-primary-700">
                  {formatCurrency(room.basePrice)}
                  <span className="text-sm font-normal text-primary-500">/tháng</span>
                </p>
              </div>

              {/* Details grid */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-surface-500">
                    <Maximize2 size={16} className="text-surface-400" /> Diện tích
                  </span>
                  <span className="font-medium text-surface-900">{room.areaSqm} m²</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-surface-500">
                    <Users size={16} className="text-surface-400" /> Sức chứa
                  </span>
                  <span className="font-medium text-surface-900">Tối đa {room.maxCapacity} người</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-surface-500">
                    <DoorOpen size={16} className="text-surface-400" /> Số phòng ngủ
                  </span>
                  <span className="font-medium text-surface-900">{room.bedrooms || 1} phòng ngủ</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-surface-500">
                    <Zap size={16} className="text-surface-400" /> Tiền điện
                  </span>
                  <span className="font-medium text-surface-900">
                    {formatCurrency(room.elecPriceKwh)}/kWh
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-surface-500">
                    <Droplets size={16} className="text-surface-400" /> Tiền nước
                  </span>
                  <span className="font-medium text-surface-900">
                    {formatCurrency(room.waterPriceM3)}/m³
                  </span>
                </div>
              </div>

              {/* Amenities */}
              {room.amenities?.length > 0 && (
                <div className="pb-5 mb-5 border-b border-surface-100">
                  <p className="text-sm font-semibold text-surface-700 mb-2">Tiện ích</p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((a) => (
                      <span
                        key={a.amenityId}
                        className="flex items-center gap-1 px-2.5 py-1 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-600"
                      >
                        <AmenityIcon iconName={a.icon} showBg={false} size={14} className="mr-0.5" />
                        {a.name}
                        {a.monthlyFee > 0 && (
                          <span className="text-surface-400 ml-0.5">
                            ({formatCurrency(a.monthlyFee)})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat button */}
              <button
                onClick={handleChat}
                disabled={chatLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 focus:ring-4 focus:ring-primary-200 disabled:opacity-60 transition-all"
              >
                {chatLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageCircle size={18} />
                    Nhắn tin cho chủ nhà
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-surface-200 p-6">
              <p className="text-sm text-surface-500">Thông tin phòng không khả dụng.</p>
              <button
                onClick={handleChat}
                disabled={chatLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-60 transition-all"
              >
                {chatLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageCircle size={18} />
                    Nhắn tin cho chủ nhà
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="pt-8 border-t border-surface-200 animate-fade-in">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-surface-900">Gợi ý phòng tương tự lân cận</h2>
            <p className="text-sm text-surface-500 mt-1">Các căn phòng trống khác ở cùng khu vực hoặc thuộc cùng khu trọ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((item) => {
              const coverImage = item.images?.length > 0
                ? getAssetUrl(item.images.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.postImageUrl)
                : null
              const isSameProp = item.property?.propertyId === (room?.propertyId)

              return (
                <div
                  key={item.postId}
                  onClick={() => {
                    navigate(`/posts/${item.postId}`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="bg-white rounded-3xl border border-surface-200 overflow-hidden hover:shadow-lg transition-all p-4 flex flex-col justify-between cursor-pointer group shadow-sm animate-fade-in"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-surface-100">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-surface-400 select-none">
                          <ImageOff size={24} className="text-surface-300 mb-1" />
                          <span className="text-[10px] font-semibold text-surface-400">Không có hình ảnh</span>
                        </div>
                      )}
                      
                      {/* Badge same property / prioritized */}
                      {isSameProp && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                          Cùng khu trọ
                        </span>
                      )}
                      
                      {/* Price badge */}
                      <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-xl">
                        {formatCurrency(item.room?.basePrice)}/tháng
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-surface-500 flex items-center gap-1">
                        <MapPin size={13} className="text-surface-400 shrink-0" />
                        <span className="truncate">{item.property?.district}, {item.property?.city}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-150 text-xs">
                    <span className="text-surface-400 font-medium">
                      {item.room?.areaSqm} m² • {item.room?.maxCapacity} người
                    </span>
                    <span className="text-primary-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Xem chi tiết &rarr;
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(loggedInUser) => {
          handleChat(loggedInUser)
        }}
      />
    </div>
  )
}
