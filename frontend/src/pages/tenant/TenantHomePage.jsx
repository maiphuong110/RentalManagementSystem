import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postApi } from '../../api/postApi'
import { roomApi } from '../../api/roomApi'
import { propertyApi } from '../../api/propertyApi'
import { chatApi } from '../../api/chatApi'
import { getAssetUrl } from '../../api/axiosInstance'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency } from '../../utils/formatCurrency'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import AuthModal from '../../components/auth/AuthModal'

// ===================== INLINE ICONS =====================
const BedIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12V7a1 1 0 011-1h6v6M3 12h18M3 12v5m18-5V7a1 1 0 00-1-1h-6v6m6 0v5" /></svg>;
const BathIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12a2 2 0 01-2-2V6a2 2 0 012-2h3m13 8v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3" /></svg>;
const WifiIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>;

const PRICE_RANGES = [
  { label: "Dưới 3 triệu", min: 0, max: 3000000 },
  { label: "3 – 7 triệu", min: 3000000, max: 7000000 },
  { label: "Trên 7 triệu", min: 7000000, max: Infinity },
]

// Local in-memory caching to avoid N+1 duplicate database requests for property details
const propertyCache = {}

export default function TenantHomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // State
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [checkedRanges, setCheckedRanges] = useState([])
  const [bedroomFilter, setBedroomFilter] = useState(0)
  const [sortBy, setSortBy] = useState('default')
  const [page, setPage] = useState(1)
  const PER_PAGE = 5

  // Auth intercept state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [pendingPostForChat, setPendingPostForChat] = useState(null)

  useEffect(() => {
    fetchActivePosts()
  }, [])

  const fetchActivePosts = async () => {
    setLoading(true)
    try {
      // 1. Fetch active posts
      const res = await postApi.getAll('active')
      const rawData = res.data?.data !== undefined ? res.data.data : res.data
      const postsData = Array.isArray(rawData) ? rawData : []

      // 2. Fetch room & property details in parallel with batch optimization
      const postsWithDetails = await Promise.all(
        postsData.map(async (post) => {
          let room = null
          let property = null

          if (post.roomId) {
            try {
              // Fetch room
              const roomRes = await roomApi.getById(post.roomId)
              room = roomRes.data?.data || roomRes.data

              // Fetch property using in-memory cache to prevent duplicate calls
              if (room?.propertyId) {
                const propId = room.propertyId
                if (propertyCache[propId]) {
                  property = propertyCache[propId]
                } else {
                  const propRes = await propertyApi.getById(propId)
                  property = propRes.data?.data || propRes.data
                  propertyCache[propId] = property
                }
              }
            } catch (err) {
              console.error(`Failed to load details for roomId ${post.roomId}:`, err)
            }
          }
          return { ...post, room, property }
        })
      )

      // Filter out posts that don't have a valid room object (sanity check)
      setPosts(postsWithDetails.filter(p => p.room !== null))
    } catch (err) {
      console.error('Failed to load active posts:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle price range checkbox toggling
  const toggleRange = (idx) => {
    setCheckedRanges((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    )
    setPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setCheckedRanges([])
    setPriceFrom('')
    setPriceTo('')
    setBedroomFilter(0)
    setSearch('')
    setSortBy('default')
    setPage(1)
  }

  // Map room capacity to bedroom count estimate based on property type
  const getBedrooms = (room, property) => {
    if (!room) return 1
    if (room.bedrooms && room.bedrooms > 0) {
      return room.bedrooms
    }
    const type = property?.type?.toLowerCase()
    
    // Studio và Chung cư mini mặc định chỉ có 1 phòng ngủ
    if (type === 'studio' || type === 'mini_apartment') {
      return 1
    }
    
    // Chung cư (apartment) và Nhà nguyên căn (house) ước lượng theo sức chứa
    if (room.maxCapacity <= 2) return 1
    if (room.maxCapacity <= 4) return 2
    return 3
  }

  // Contact / chat handler
  const handleContact = async (post, currentUser = user) => {
    const ownerId = post.property?.ownerId
    if (!ownerId) {
      alert('Không tìm thấy thông tin chủ nhà để nhắn tin.')
      return
    }

    if (!currentUser) {
      setPendingPostForChat(post)
      setIsAuthModalOpen(true)
      return
    }

    try {
      const res = await chatApi.getOrCreate({ receiverId: ownerId, postId: null })
      const conversation = res.data?.data || res.data
      navigate('/chat', {
        state: {
          conversationId: conversation?.conversationId,
          autoSendPostId: post.postId,
        },
      })
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể tạo cuộc trò chuyện.')
    }
  }

  // Filtering logic
  let filtered = posts.filter((item) => {
    const room = item.room
    const prop = item.property
    if (!room) return false

    // 1. Text Search (title, description, address, property name, room number)
    if (search) {
      const q = search.toLowerCase()
      const titleMatch = item.title?.toLowerCase().includes(q)
      const descMatch = item.description?.toLowerCase().includes(q)
      const propMatch = room.propertyName?.toLowerCase().includes(q)
      const roomNumMatch = room.roomNumber?.toLowerCase().includes(q)

      const streetMatch = prop?.street?.toLowerCase().includes(q)
      const wardMatch = prop?.ward?.toLowerCase().includes(q)
      const districtMatch = prop?.district?.toLowerCase().includes(q)
      const cityMatch = prop?.city?.toLowerCase().includes(q)

      if (
        !titleMatch &&
        !descMatch &&
        !propMatch &&
        !roomNumMatch &&
        !streetMatch &&
        !wardMatch &&
        !districtMatch &&
        !cityMatch
      ) {
        return false
      }
    }

    // 2. Price Inputs
    const price = room.basePrice ? Number(room.basePrice) : 0
    const from = priceFrom ? Number(priceFrom.replace(/\D/g, '')) : 0
    const to = priceTo ? Number(priceTo.replace(/\D/g, '')) : Infinity
    if (price < from || price > to) return false

    // 3. Price Checkboxes
    if (checkedRanges.length > 0) {
      const matchesRange = checkedRanges.some((idx) => {
        const range = PRICE_RANGES[idx]
        return price >= range.min && price < range.max
      })
      if (!matchesRange) return false
    }

    // 4. Bedrooms
    if (bedroomFilter > 0 && getBedrooms(room, prop) !== bedroomFilter) return false

    return true
  })

  // Sorting logic
  if (sortBy === 'asc') {
    filtered = [...filtered].sort((a, b) => Number(a.room?.basePrice) - Number(b.room?.basePrice))
  } else if (sortBy === 'desc') {
    filtered = [...filtered].sort((a, b) => Number(b.room?.basePrice) - Number(a.room?.basePrice))
  }

  // Pagination
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Construct formatted address
  const getDisplayAddress = (prop) => {
    if (!prop) return 'Đang tải địa chỉ...'
    const parts = [prop.street, prop.ward, prop.district, prop.city].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 py-8">
      {/* ── Search Bar ── */}
      <div className="w-full max-w-xl mx-auto mb-10">
        <div className="flex items-center bg-white border border-surface-200 rounded-full px-5 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search here"
            className="w-full bg-transparent focus:outline-none placeholder:text-surface-400 text-sm py-2"
          />
          <button className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all shrink-0 ml-2 cursor-pointer shadow-sm">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* ── Left Filter Panel ── */}
        <aside className="w-full md:w-56 shrink-0 bg-white rounded-2xl border border-surface-200 p-5 shadow-sm sticky top-20">
          <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Lọc theo giá</p>
          
          {/* Price Range inputs with red borders */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <span className="text-[10px] font-semibold text-surface-400 block mb-1">From</span>
              <input
                type="text"
                placeholder="0đ"
                value={priceFrom}
                onChange={(e) => {
                  setPriceFrom(e.target.value)
                  setPage(1)
                }}
                className="w-full border-1.5 border-primary-600 rounded-xl px-2.5 py-1.5 text-xs font-medium text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-surface-400 block mb-1">To</span>
              <input
                type="text"
                placeholder="20.000.000đ"
                value={priceTo}
                onChange={(e) => {
                  setPriceTo(e.target.value)
                  setPage(1)
                }}
                className="w-full border-1.5 border-primary-600 rounded-xl px-2.5 py-1.5 text-xs font-medium text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </div>

          {/* Checkboxes with pink accent */}
          <div className="border-t border-surface-100 py-4 space-y-2">
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Khoảng giá</p>
            {PRICE_RANGES.map((r, i) => (
              <label
                key={i}
                className="flex items-center gap-3.5 cursor-pointer text-xs font-medium text-surface-600 hover:text-primary-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checkedRanges.includes(i)}
                  onChange={() => toggleRange(i)}
                  className="accent-primary-500 w-4 h-4 rounded"
                />
                {r.label}
              </label>
            ))}
          </div>

          {/* Bedroom Filter buttons */}
          <div className="border-t border-surface-100 py-4">
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">Số phòng ngủ</p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setBedroomFilter(n)
                    setPage(1)
                  }}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                    bedroomFilter === n
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
                  }`}
                >
                  {n === 0 ? 'Tất cả' : `${n} PN`}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Option */}
          <div className="border-t border-surface-100 py-4">
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Sắp xếp</p>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value)
                setPage(1)
              }}
              className="w-full bg-surface-50 border border-surface-200 rounded-xl px-3 py-2 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
            >
              <option value="default">Mặc định</option>
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>

          {(checkedRanges.length > 0 || priceFrom || priceTo || bedroomFilter > 0 || search || sortBy !== 'default') && (
            <button
              onClick={clearFilters}
              className="w-full mt-2 py-2 text-xs font-bold text-primary-600 hover:text-white border border-primary-600 hover:bg-primary-600 rounded-xl transition-all cursor-pointer"
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </aside>

        {/* ── Right Content List ── */}
        <section className="flex-1 space-y-5 w-full">
          <div className="flex items-center justify-between text-xs text-surface-400 mb-1">
            <p>Tìm thấy <strong className="text-primary-600 font-bold">{filtered.length}</strong> bài đăng</p>
          </div>

          {loading ? (
            <div className="py-20">
              <LoadingSpinner text="Đang tải các phòng..." />
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-surface-200 shadow-sm">
              <span className="text-4xl">🔍</span>
              <h3 className="font-bold text-surface-800 mt-3 text-sm">Không tìm thấy bài đăng nào phù hợp</h3>
              <p className="text-xs text-surface-400 mt-1">Hãy thử chỉnh sửa hoặc xóa bộ lọc để xem các kết quả khác</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-sm cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paged.map((item) => {
                const room = item.room
                const coverImage = item.images?.length > 0
                  ? getAssetUrl(item.images.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.postImageUrl)
                  : null

                // Estimate beds and baths
                const beds = getBedrooms(room, item.property)
                const baths = room?.maxCapacity > 3 ? 2 : 1
                const hasWifi = room?.amenities?.some(a => a.amenityName?.toLowerCase().includes('wifi') || a.amenityName?.toLowerCase().includes('internet')) || true

                return (
                  <div
                    key={item.postId}
                    className="bg-white rounded-3xl border border-surface-200 overflow-hidden hover:shadow-lg transition-shadow p-5 flex flex-col md:flex-row gap-5 shadow-sm"
                  >
                    {/* Image */}
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={item.title}
                        className="w-full md:w-56 h-40 object-cover rounded-2xl shrink-0"
                      />
                    ) : (
                      <div className="w-full md:w-56 h-40 bg-surface-100 border border-surface-200 rounded-2xl flex flex-col items-center justify-center text-surface-400 shrink-0 select-none">
                        <svg className="w-8 h-8 text-surface-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] font-semibold text-surface-400">Không có hình ảnh</span>
                      </div>
                    )}

                    {/* Details in the Center */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-bold text-base text-surface-900 line-clamp-2 leading-snug mb-2">
                          {item.title}
                        </h3>
                        
                        {/* Meta items */}
                        <div className="flex items-center gap-4 text-surface-500 text-xs font-semibold mb-3 flex-wrap">
                          <span className="flex items-center gap-1.5"><BedIcon /> {beds} bedroom</span>
                          <span className="flex items-center gap-1.5"><BathIcon /> {baths} bath</span>
                          {hasWifi && <span className="flex items-center gap-1.5"><WifiIcon /> WiFi</span>}
                        </div>

                        <p className="text-xs text-surface-400 font-medium mb-3">
                          {getDisplayAddress(item.property)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3.5">
                        <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-[10px] font-bold tracking-wide">
                          Available {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '28 Nov 2021'}
                        </span>
                        <p className="text-xs text-surface-500 font-medium">
                          from <strong className="text-primary-600 text-base font-bold ml-1">{formatCurrency(room?.basePrice)}</strong>/month
                        </p>
                      </div>
                    </div>

                    {/* Stacked Action Buttons on the Right */}
                    <div className="flex flex-row md:flex-col gap-2 justify-center items-stretch shrink-0 w-full md:w-32">
                      <button
                        onClick={() => handleContact(item)}
                        className="flex-1 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-full transition-all cursor-pointer text-center"
                      >
                        Contact
                      </button>
                      <button
                        onClick={() => navigate(`/tenant/posts/${item.postId}`)}
                        className="flex-1 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-full transition-all cursor-pointer text-center"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                )
              })}

              {/* ── Pagination Buttons ── */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pt-4">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-xs font-bold hover:bg-surface-50 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
                  >
                    ← Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        n === page
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white border border-surface-200 hover:bg-surface-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white border border-surface-200 rounded-xl text-xs font-bold hover:bg-surface-50 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
                  >
                    Sau →
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Guest Auth Modal Interceptor ── */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false)
            setPendingPostForChat(null)
          }}
          onSuccess={(loggedInUser) => {
            setIsAuthModalOpen(false)
            if (pendingPostForChat) {
              handleContact(pendingPostForChat, loggedInUser)
              setPendingPostForChat(null)
            }
          }}
        />
      )}
    </div>
  )
}

// ===================== FOOTER COMPONENT =====================
function Footer() {
  return (
    <footer className="border-t border-surface-200 bg-white mt-20 pt-14 pb-8">
      <div className="flex flex-col md:flex-row justify-between gap-8 items-start mb-12">
        <div>
          <h3 className="text-xl font-bold text-primary-600 mb-1 leading-none tracking-wide">RENT+</h3>
          <p className="text-xs text-surface-400 mb-6">Nền tảng tìm kiếm và quản lý phòng trọ trực tuyến</p>
          <div className="flex gap-3">
            {/* FB */}
            <a href="#" className="w-8 h-8 rounded-full bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            {/* IN */}
            <a href="#" className="w-8 h-8 rounded-full bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
            {/* YT */}
            <a href="#" className="w-8 h-8 rounded-full bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.522 3.5 12 3.5 12 3.5s-7.522 0-9.388.556a3.002 3.002 0 00-2.11 2.107C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 002.11 2.107C4.478 20.5 12 20.5 12 20.5s7.522 0 9.388-.556a3.005 3.005 0 002.11-2.107C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            {/* IG */}
            <a href="#" className="w-8 h-8 rounded-full bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-600 hover:text-primary-600 hover:bg-primary-50 transition-all">
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>

        <div className="flex gap-12 sm:gap-20 flex-wrap">
          {[{ title: "Topic", items: ["Page", "Page", "Page"] }, { title: "Topic", items: ["Page", "Page", "Page"] }, { title: "Topic", items: ["Page", "Page", "Page"] }].map((group, i) => (
            <div key={i} className="min-w-[80px]">
              <h4 className="font-bold text-surface-900 mb-4 text-sm">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.items.map((item, j) => (
                  <li key={j}>
                    <a href="#" className="text-xs text-surface-500 hover:text-primary-600 transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-surface-100 pt-8 text-center text-xs text-surface-400 font-medium">
        © 2026 RENT+. Bảo lưu mọi quyền.
      </div>
    </footer>
  )
}
