import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationApi } from '../../api/notificationApi'
import { chatApi } from '../../api/chatApi'
import {
  Menu,
  Bell,
  MessageCircle,
  User,
  LogOut,
  ChevronDown,
  Check,
  CheckCheck,
  Home,
} from 'lucide-react'
import { timeAgo } from '../../utils/formatDate'
import { getAssetUrl } from '../../api/axiosInstance'

export default function Navbar({ onMenuClick }) {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const isOwner = user?.role?.toLowerCase() === 'owner'
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadNotifs, setUnreadNotifs] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  // Lấy số thông báo & tin nhắn chưa đọc
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchCounts = async () => {
      try {
        const [notifRes, chatRes] = await Promise.all([
          notificationApi.getUnreadCount(),
          chatApi.getUnreadCount(),
        ])
        setUnreadNotifs(notifRes.data?.data ?? 0)
        setUnreadMessages(chatRes.data?.data ?? 0)
      } catch {
        // Bỏ qua lỗi
      }
    }
    fetchCounts()
    const interval = setInterval(fetchCounts, 30000) // Cập nhật mỗi 30 giây
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lấy thông báo khi mở dropdown
  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      try {
        const res = await notificationApi.getAll(0, 10)
        setNotifications(res.data?.data?.content ?? [])
      } catch {
        // Bỏ qua
      }
    }
  }

  // Đánh dấu đã đọc tất cả
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setUnreadNotifs(0)
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
    } catch {
      // Bỏ qua
    }
  }

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationApi.markAsRead(notif.notificationId)
        setUnreadNotifs((p) => Math.max(0, p - 1))
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notif.notificationId
              ? { ...n, read: true }
              : n
          )
        )
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }

    setShowNotifications(false)

    const type = notif.type?.toLowerCase()
    const role = user?.role?.toLowerCase()
    const isOwner = role === 'owner'

    switch (type) {
      case 'new_message':
        navigate('/chat', { state: { conversationId: notif.refId } })
        break
      case 'bill_due':
        navigate('/tenant/bills')
        break
      case 'payment_received':
        navigate('/owner/bills')
        break
      case 'contract_expiry':
        if (isOwner) {
          navigate('/owner/contracts')
        } else {
          navigate('/tenant/contracts')
        }
        break
      default:
        break
    }
  }



  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-primary-600 border-b border-primary-700 shadow-md">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left: Logo & Menu Button */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-white/80 hover:bg-white/10 lg:hidden"
            >
              <Menu size={22} />
            </button>
          )}
          
          <div className="flex items-center gap-2.5">
            <div>
              <h1 className="text-xl font-bold text-white leading-none">
                RENT<span className="text-[#ffdc00]">+</span>
              </h1>
            </div>
          </div>
        </div>



        {/* Right: Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-1.5 text-sm font-bold text-primary-600 bg-white hover:bg-primary-50 rounded-lg transition-all shadow-sm cursor-pointer uppercase tracking-wider"
              >
                LOG IN
              </button>
            </div>
          ) : (
            <>
              {/* Chat */}
              <button
                onClick={() => navigate('/chat')}
                className="relative p-2.5 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                <MessageCircle size={20} />
                {unreadMessages > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ffdc00] text-primary-700 text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </button>
     
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={handleOpenNotifications}
                  className="relative p-2.5 rounded-xl text-white/90 hover:bg-white/10 transition-colors"
                >
                  <Bell size={20} />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#ffdc00] text-primary-700 text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {unreadNotifs > 99 ? '99+' : unreadNotifs}
                    </span>
                  )}
                </button>
     
                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-surface-200 animate-scale-in overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100">
                      <h3 className="font-semibold text-surface-950">Thông báo</h3>
                      {unreadNotifs > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                          <CheckCheck size={14} /> Đọc tất cả
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-sm text-surface-400 py-8">
                          Không có thông báo nào
                        </p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.notificationId}
                            className={`px-4 py-3 border-b border-surface-50 hover:bg-surface-50 transition-colors cursor-pointer ${
                              !notif.read ? 'bg-primary-50/50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notif)}
                          >
                            <div className="flex items-start gap-2">
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                              )}
                              <div className={!notif.read ? '' : 'pl-4'}>
                                <p className="text-sm font-medium text-surface-900">{notif.title}</p>
                                {notif.body && (
                                  <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{notif.body}</p>
                                )}
                                <p className="text-[11px] text-surface-400 mt-1">{timeAgo(notif.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
     
              <div ref={userMenuRef} className="relative ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/10 transition-colors text-white"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img
                        src={getAssetUrl(user.avatarUrl)}
                        alt="Avatar"
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <User size={16} className="text-white" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
                    {user?.fullName || 'Người dùng'}
                  </span>
                  <ChevronDown size={14} className="text-white/70" />
                </button>
    
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-surface-200 animate-scale-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-surface-100">
                      <p className="text-sm font-semibold text-surface-900 truncate">{user?.fullName}</p>
                      <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 uppercase">
                        {user?.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          navigate('/profile')
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
                      >
                        <User size={16} />
                        Hồ sơ cá nhân
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors border-t border-surface-100"
                      >
                        <LogOut size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
