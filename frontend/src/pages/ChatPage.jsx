import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  User,
  AlertTriangle,
  Clock,
  Sparkles,
  Building,
  Plus,
  FileSignature,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { chatApi } from '../api/chatApi'
import { postApi } from '../api/postApi'
import { roomApi } from '../api/roomApi'
import { billApi } from '../api/billApi'
import { formatCurrency } from '../utils/formatCurrency'
import { getAssetUrl } from '../api/axiosInstance'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { timeAgo } from '../utils/formatDate'

// Module-level caches to prevent duplicate/repeated API fetches
const postCache = {}
const roomCache = {}
const billCache = {}

function PostContextBubble({ postId, isOwner, partnerId, text, isMe }) {
  const cachedPost = postCache[postId]
  const cachedRoom = cachedPost?.roomId ? roomCache[cachedPost.roomId] : null

  const [post, setPost] = useState(cachedPost || null)
  const [room, setRoom] = useState(cachedRoom || null)
  const [loading, setLoading] = useState(!(cachedPost && (!cachedPost.roomId || cachedRoom)))
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDetails = async () => {
      if (postCache[postId]) {
        const cachedPostData = postCache[postId]
        if (cachedPostData.roomId && roomCache[cachedPostData.roomId]) {
          setRoom(roomCache[cachedPostData.roomId])
          setLoading(false)
          return
        }
      }

      try {
        let postData = postCache[postId]
        if (!postData) {
          const postRes = await postApi.getById(postId)
          postData = postRes.data?.data || postRes.data
          postCache[postId] = postData
          setPost(postData)
        }
        if (postData?.roomId) {
          let roomData = roomCache[postData.roomId]
          if (!roomData) {
            const roomRes = await roomApi.getById(postData.roomId)
            roomData = roomRes.data?.data || roomRes.data
            roomCache[postData.roomId] = roomData
          }
          setRoom(roomData)
        }
      } catch (err) {
        console.error('Error loading post context in bubble:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()
  }, [postId])

  const handleCreateContract = (e) => {
    e.stopPropagation()
    if (!room) return
    navigate('/owner/contracts', {
      state: {
        roomId: room.roomId,
        propertyId: room.propertyId,
        tenantId: partnerId,
      }
    })
  }

  if (loading) {
    return <div className="text-[10px] opacity-70 italic text-left">Đang tải thông tin phòng...</div>
  }

  if (!post || !room) {
    return <div className="text-xs text-left">{text}</div>
  }

  const firstImage = post.images?.[0]?.postImageUrl ? getAssetUrl(post.images[0].postImageUrl) : null

  return (
    <div className="space-y-2">
      {/* Post Preview Card */}
      <div className={`flex gap-3 rounded-xl p-2.5 shadow-sm text-surface-900 ${
        isMe ? 'bg-white text-surface-900' : 'bg-surface-50 border border-surface-200 text-surface-800'
      }`}>
        {firstImage ? (
          <img
            src={firstImage}
            alt={post.title}
            className="w-12 h-12 rounded-lg object-cover border border-surface-200 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-surface-200 flex items-center justify-center shrink-0">
            <Building className="text-surface-400" size={16} />
          </div>
        )}
        <div className="flex-1 min-w-0 text-left">
          <h4 className="font-bold text-[11px] truncate text-surface-900">{post.title}</h4>
          <p className="text-[9px] text-surface-500 truncate mt-0.5">
            Phòng {room.roomNumber} - {room.propertyName}
          </p>
          <div className="flex justify-between items-center mt-1">
            <span className="text-[10px] font-bold text-primary-600">
              {formatCurrency(room.basePrice)}
            </span>
            {isOwner && (
              <button
                type="button"
                onClick={handleCreateContract}
                className="px-2 py-0.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-[8px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                Tạo hợp đồng
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Text message */}
      <div className={`text-xs text-left ${isMe ? 'text-white' : 'text-surface-800'}`}>{text}</div>
    </div>
  )
}

function BillProofContextBubble({ billId, isOwner, isMe }) {
  const [bill, setBill] = useState(billCache[billId] || null)
  const [loading, setLoading] = useState(!billCache[billId])
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    const fetchBill = async () => {
      if (billCache[billId]) {
        setLoading(false)
        return
      }

      try {
        const res = await billApi.getById(billId)
        const billData = res.data?.data || res.data
        billCache[billId] = billData
        setBill(billData)
      } catch (err) {
        console.error('Error fetching bill details in chat bubble:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBill()
  }, [billId])

  const handleConfirm = async (e) => {
    e.stopPropagation()
    try {
      setConfirming(true)
      await billApi.updateBillStatus(billId, 'paid')
      alert('Đã duyệt thanh toán thành công!')
      // Refresh bill details and update cache
      const res = await billApi.getById(billId)
      const billData = res.data?.data || res.data
      billCache[billId] = billData
      setBill(billData)
    } catch (err) {
      console.error(err)
      alert('Duyệt thanh toán thất bại.')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return <div className="text-[10px] opacity-70 italic text-left">Đang tải minh chứng thanh toán...</div>
  }

  if (!bill) {
    return <div className="text-xs text-left text-rose-600 font-medium">Không thể hiển thị thông tin hóa đơn.</div>
  }

  const isPending = bill.status?.toLowerCase() === 'pending_confirm' || bill.status?.toLowerCase() === 'pending_approval'

  return (
    <div className="space-y-2 text-surface-900 min-w-[200px]">
      {/* Bill Card in bubble */}
      <div className={`rounded-xl p-3 shadow-sm text-left ${
        isMe ? 'bg-white text-surface-900 border border-surface-200' : 'bg-surface-50 border border-surface-200 text-surface-800'
      }`}>
        <div className="flex justify-between items-start border-b border-surface-150 pb-2 mb-2">
          <div>
            <h4 className="font-bold text-[11px] text-surface-900">Xác nhận thanh toán</h4>
            <p className="text-[9px] text-surface-500 mt-0.5">Phòng {bill.roomNumber} - Hóa đơn {bill.billingMonth}/{bill.billingYear}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
            bill.status === 'paid'
              ? 'bg-accent-50 text-accent-700 border border-accent-100'
              : isPending
              ? 'bg-warning-50 text-warning-600 border border-warning-100'
              : 'bg-danger-50 text-danger-600 border border-danger-100'
          }`}>
            {bill.status === 'paid' ? 'Đã thanh toán' : isPending ? 'Chờ duyệt' : 'Chưa thanh toán'}
          </span>
        </div>

        <div className="text-[11px] space-y-1">
          <p className="text-surface-700 flex justify-between">
            <span>Tổng cộng:</span>
            <span className="font-bold text-primary-600">{formatCurrency(bill.totalAmount)}</span>
          </p>
        </div>

        {bill.paymentProofUrl && (
          <div className="mt-2">
            <p className="text-[9px] font-bold text-surface-500 mb-1">Ảnh minh chứng chuyển khoản:</p>
            <a href={bill.paymentProofUrl} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-lg border border-surface-200">
              <img
                src={bill.paymentProofUrl}
                alt="Minh chứng giao dịch"
                className="w-full max-h-36 object-cover hover:scale-105 transition-transform duration-200"
              />
            </a>
          </div>
        )}

        {isOwner && isPending && (
          <button
            type="button"
            disabled={confirming}
            onClick={handleConfirm}
            className="w-full mt-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold rounded transition-colors cursor-pointer text-center block"
          >
            {confirming ? 'Đang duyệt...' : 'Duyệt thanh toán'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  const { user, isOwner } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Conversations list
  const [conversations, setConversations] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingConvos, setLoadingConvos] = useState(true)
  
  // Selected conversation
  const [selectedConvo, setSelectedConvo] = useState(null)
  const [convoRoom, setConvoRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState('')

  // Mobile responsiveness
  const [mobileView, setMobileView] = useState('list') // 'list' or 'chat'
  
  const messagesEndRef = useRef(null)
  const processedAutoSends = useRef(new Set())
  const pendingConvoIdRef = useRef(null)
  const pendingAutoSendPostIdRef = useRef(null)

  // Capture router state parameters and clear them immediately to prevent double processing
  if (location.state?.conversationId) {
    pendingConvoIdRef.current = Number(location.state.conversationId)
    if (location.state.autoSendPostId) {
      pendingAutoSendPostIdRef.current = location.state.autoSendPostId
    }
    window.history.replaceState({}, document.title)
  }

  // Polling intervals
  useEffect(() => {
    fetchConversations()
    const convoInterval = setInterval(fetchConversations, 10000) // Poll conversations every 10s
    return () => clearInterval(convoInterval)
  }, [])

  // Auto select conversation from router state when location updates (e.g. from notification click or post detail page)
  useEffect(() => {
    if (pendingConvoIdRef.current) {
      if (conversations.length > 0) {
        const found = conversations.find((c) => c.conversationId === pendingConvoIdRef.current)
        if (found) {
          handleSelectConversation(found)
          
          const autoSendId = pendingAutoSendPostIdRef.current
          if (autoSendId && !processedAutoSends.current.has(autoSendId)) {
            processedAutoSends.current.add(autoSendId)
            sendAutomaticMessage(found.conversationId, autoSendId)
          }
          
          // Clear pending refs as they have been successfully processed
          pendingConvoIdRef.current = null
          pendingAutoSendPostIdRef.current = null
        }
      } else {
        fetchConversations()
      }
    }
  }, [conversations])

  // Poll active conversation messages
  useEffect(() => {
    if (!selectedConvo) return
    
    fetchMessages(selectedConvo.conversationId, false)
    const msgInterval = setInterval(() => {
      fetchMessages(selectedConvo.conversationId, false)
    }, 5000) // Poll messages every 5s

    return () => clearInterval(msgInterval)
  }, [selectedConvo])

  // Auto scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch post & room details for active conversation context
  useEffect(() => {
    if (!selectedConvo) {
      setConvoRoom(null)
      return
    }

    const fetchConvoRoomDetails = async () => {
      if (selectedConvo.postId) {
        const cachedPost = postCache[selectedConvo.postId]
        const cachedRoom = cachedPost?.roomId ? roomCache[cachedPost.roomId] : null
        if (cachedPost && cachedRoom) {
          setConvoRoom(cachedRoom)
          return
        }

        try {
          let postData = cachedPost
          if (!postData) {
            const postRes = await postApi.getById(selectedConvo.postId)
            postData = postRes.data?.data || postRes.data
            postCache[selectedConvo.postId] = postData
          }
          if (postData?.roomId) {
            let roomData = roomCache[postData.roomId]
            if (!roomData) {
              const roomRes = await roomApi.getById(postData.roomId)
              roomData = roomRes.data?.data || roomRes.data
              roomCache[postData.roomId] = roomData
            }
            setConvoRoom(roomData)
          } else {
            setConvoRoom(null)
          }
        } catch (err) {
          console.error('Error fetching post/room details for chat context:', err)
          setConvoRoom(null)
        }
      } else {
        setConvoRoom(null)
      }
    }

    fetchConvoRoomDetails()
  }, [selectedConvo])

  const fetchConversations = async () => {
    try {
      const res = await chatApi.getMyConversations()
      const list = res.data?.data || res.data || []
      setConversations(list)
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoadingConvos(false)
    }
  }

  const fetchMessages = async (convoId, showSpinner = true) => {
    if (showSpinner) setLoadingMessages(true)
    try {
      const res = await chatApi.getMessages(convoId, 0, 50)
      const data = res.data?.data?.content || res.data?.content || res.data || []
      // Sắp xếp tin nhắn theo thời gian tăng dần (cũ đến mới)
      const sorted = [...data].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
      setMessages(sorted)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setChatError('Không thể tải tin nhắn.')
    } finally {
      if (showSpinner) setLoadingMessages(false)
    }
  }

  const handleSelectConversation = (convo) => {
    setSelectedConvo(convo)
    setMessages([])
    setChatError('')
    setMobileView('chat')
    fetchMessages(convo.conversationId, true)
  }

  const sendAutomaticMessage = async (convoId, postId) => {
    try {
      const content = `[POST:${postId}] Tôi muốn hỏi thông tin căn phòng này?`
      const res = await chatApi.sendMessage(convoId, { content })
      const newMsg = res.data?.data || res.data
      setMessages((prev) => [...prev, newMsg])
      fetchConversations()
    } catch (err) {
      console.error('Error sending automatic message:', err)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConvo) return

    const content = messageText.trim()
    setMessageText('')
    setSending(true)
    
    try {
      const res = await chatApi.sendMessage(selectedConvo.conversationId, { content })
      const newMsg = res.data?.data || res.data
      setMessages((prev) => [...prev, newMsg])
      
      // Update conversations list immediately to show latest message at top
      fetchConversations()
    } catch (err) {
      console.error('Error sending message:', err)
      setChatError('Gửi tin nhắn thất bại. Vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  const getOtherParticipant = (convo) => {
    if (!convo || !user) return { fullName: 'Người dùng', avatarUrl: null }
    // userA or userB
    return convo.userA?.userId === user.userId ? convo.userB : convo.userA
  }

  const handleBackToList = () => {
    setMobileView('list')
    setSelectedConvo(null)
  }

  const handleGoToCreateContract = () => {
    if (!convoRoom || !selectedConvo) return
    const partner = getOtherParticipant(selectedConvo)
    navigate('/owner/contracts', {
      state: {
        roomId: convoRoom.roomId,
        propertyId: convoRoom.propertyId,
        tenantId: partner?.userId,
      }
    })
  }

  // Lọc cuộc hội thoại theo tên người nhận hoặc tiêu đề bài viết
  const filteredConvos = conversations.filter((convo) => {
    const partner = getOtherParticipant(convo)
    const nameMatch = partner?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    const titleMatch = convo.postTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    return nameMatch || titleMatch
  })

  return (
    <div className="bg-white rounded-3xl border border-surface-200 shadow-xl overflow-hidden h-[calc(100vh-140px)] flex animate-fade-in">
      {/* LEFT COLUMN: CONVERSATION LIST */}
      <div
        className={`w-full lg:w-1/3 border-r border-surface-200 flex flex-col h-full ${
          mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Search header */}
        <div className="p-4 border-b border-surface-150">
          <h2 className="text-xl font-bold text-surface-950 mb-3 flex items-center gap-2">
            <MessageCircle className="text-primary-600" size={22} />
            Hội thoại
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm người nhắn, tin đăng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            <Search size={14} className="absolute left-3 top-3 text-surface-400" />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-surface-100">
          {loadingConvos && conversations.length === 0 ? (
            <LoadingSpinner size="sm" text="Đang tải hội thoại..." />
          ) : filteredConvos.length === 0 ? (
            <div className="p-8 text-center text-surface-400 text-xs italic">
              {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có cuộc trò chuyện nào'}
            </div>
          ) : (
            filteredConvos.map((convo) => {
              const partner = getOtherParticipant(convo)
              const isSelected = selectedConvo?.conversationId === convo.conversationId
              
              return (
                <button
                  key={convo.conversationId}
                  onClick={() => handleSelectConversation(convo)}
                  className={`w-full p-4 flex gap-3 text-left transition-colors hover:bg-surface-50 ${
                    isSelected ? 'bg-primary-50/50 hover:bg-primary-50/50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {partner?.avatarUrl ? (
                      <img
                        src={getAssetUrl(partner.avatarUrl)}
                        alt={partner.fullName}
                        className="w-11 h-11 rounded-full object-cover border border-surface-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                        {partner?.fullName?.substring(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent-500 border-2 border-white rounded-full" />
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-sm text-surface-900 truncate">
                        {partner?.fullName}
                      </span>
                      {convo.lastMessageAt && (
                        <span className="text-[10px] text-surface-400 shrink-0 mt-0.5">
                          {timeAgo(convo.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    
                    {convo.postTitle && (
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-primary-600 font-medium truncate">
                        <Building size={10} className="shrink-0" />
                        <span>Tin đăng: {convo.postTitle}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-surface-500 truncate pr-4">
                        Bấm để xem cuộc trò chuyện
                      </p>
                      {convo.unreadCount > 0 && (
                        <span className="bg-primary-600 text-white font-bold text-[10px] h-4.5 min-w-4.5 px-1 rounded-full flex items-center justify-center shrink-0 animate-pulse">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: ACTIVE CONVERSATION MESSAGES */}
      <div
        className={`w-full lg:w-2/3 flex flex-col h-full ${
          mobileView === 'list' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {selectedConvo ? (
          <>
            {/* Active chat header */}
            <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between shrink-0 bg-surface-50">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={handleBackToList}
                  className="lg:hidden p-1.5 rounded-xl hover:bg-surface-200 text-surface-600 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="relative shrink-0">
                  {getOtherParticipant(selectedConvo)?.avatarUrl ? (
                    <img
                      src={getAssetUrl(getOtherParticipant(selectedConvo).avatarUrl)}
                      alt={getOtherParticipant(selectedConvo).fullName}
                      className="w-10 h-10 rounded-full object-cover border border-surface-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                      {getOtherParticipant(selectedConvo)?.fullName?.substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent-500 border-2 border-white rounded-full" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-surface-950 text-sm leading-tight">
                      {getOtherParticipant(selectedConvo)?.fullName}
                    </h3>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-surface-200 text-surface-700 rounded-md shrink-0">
                      ID: {getOtherParticipant(selectedConvo)?.userId}
                    </span>
                  </div>
                  <span className="text-[10px] text-accent-600 flex items-center gap-1 font-medium mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                    Đang hoạt động
                  </span>
                </div>
              </div>
            </div>

            {/* Context Room Info Bar */}
            {convoRoom && (
              <div className="bg-surface-50 border-b border-surface-200 px-6 py-2.5 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0">
                    <Building size={16} />
                  </div>
                  <div className="truncate text-xs">
                    <span className="font-semibold text-surface-800">Phòng quan tâm:</span>{' '}
                    <span className="text-surface-600">
                      Phòng {convoRoom.roomNumber} - {convoRoom.propertyName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                    {formatCurrency(convoRoom.basePrice)}/tháng
                  </div>
                  {isOwner && (
                    <button
                      onClick={handleGoToCreateContract}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
                      title="Tạo hợp đồng nháp từ cuộc hội thoại này"
                    >
                      <FileSignature size={13} />
                      Tạo hợp đồng
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Messages box */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface-50/30">
              {loadingMessages && messages.length === 0 ? (
                <LoadingSpinner size="md" text="Đang tải tin nhắn..." />
              ) : (
                <>
                  {chatError && (
                    <div className="p-3 bg-danger-50 text-danger-600 text-xs rounded-xl flex items-center gap-2 max-w-sm mx-auto">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{chatError}</span>
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isMe = msg.senderId === user.userId
                    
                    return (
                      <div
                        key={msg.messageId}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] ${isMe ? 'order-1' : 'order-2'}`}>
                          {/* Chat Bubble */}
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words shadow-sm ${
                              isMe
                                ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-tr-none'
                                : 'bg-white text-surface-800 border border-surface-150 rounded-tl-none'
                            }`}
                          >
                            {(() => {
                              const postRegex = /^\[POST:(\d+)\]\s*(.*)/
                              const match = msg.content.match(postRegex)
                              if (match) {
                                const postId = Number(match[1])
                                const text = match[2]
                                const partner = getOtherParticipant(selectedConvo)
                                return (
                                  <PostContextBubble
                                    postId={postId}
                                    isOwner={isOwner}
                                    partnerId={partner?.userId}
                                    text={text}
                                    isMe={isMe}
                                  />
                                )
                              }

                              const billRegex = /^\[BILL_PROOF:(\d+)\]/
                              const billMatch = msg.content.match(billRegex)
                              if (billMatch) {
                                const billId = Number(billMatch[1])
                                return (
                                  <BillProofContextBubble
                                    billId={billId}
                                    isOwner={isOwner}
                                    isMe={isMe}
                                  />
                                )
                              }
                              
                              return msg.content
                            })()}
                          </div>
                          {/* Timestamp */}
                          <p className={`text-[10px] text-surface-400 mt-1 flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <Clock size={10} />
                            {new Date(msg.sentAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-surface-200 flex gap-2.5 items-center shrink-0 bg-white"
            >
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors shrink-0 shadow-lg shadow-primary-500/15"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-surface-50/20 text-center">
            <div className="p-4 bg-primary-50 text-primary-600 rounded-full mb-4 animate-bounce-slow">
              <MessageCircle size={36} />
            </div>
            <h3 className="text-base font-bold text-surface-900">Trò chuyện TroSmart</h3>
            <p className="text-xs text-surface-400 max-w-sm mt-2 leading-relaxed">
              Chọn một cuộc hội thoại từ danh sách bên trái hoặc nhắn tin cho chủ nhà từ tin đăng để bắt đầu trao đổi.
            </p>
            <div className="mt-6 flex items-center gap-1.5 text-[10px] text-accent-600 bg-accent-50/60 px-3.5 py-1.5 rounded-full border border-accent-100 font-medium">
              <Sparkles size={12} className="animate-pulse" />
              <span>Hỗ trợ trò chuyện thời gian thực</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
