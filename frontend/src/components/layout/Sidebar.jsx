import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  FileText,
  FileSignature,
  Receipt,
  MessageCircle,
  Search,
  Home,
  CreditCard,
  X,
} from 'lucide-react'

const ownerMenu = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { to: '/owner/properties', icon: Building2, label: 'Khu trọ' },
  { to: '/owner/posts', icon: FileText, label: 'Tin đăng' },
  { to: '/owner/contracts', icon: FileSignature, label: 'Hợp đồng' },
  { to: '/owner/bills', icon: Receipt, label: 'Hóa đơn' },
  { to: '/chat', icon: MessageCircle, label: 'Tin nhắn' },
]

const tenantMenu = [
  { to: '/tenant', icon: Search, label: 'Tìm phòng' },
  { to: '/tenant/my-room', icon: Home, label: 'Phòng của tôi' },
  { to: '/tenant/bills', icon: CreditCard, label: 'Hóa đơn' },
  { to: '/tenant/contracts', icon: FileSignature, label: 'Hợp đồng' },
  { to: '/chat', icon: MessageCircle, label: 'Tin nhắn' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { isOwner } = useAuth()
  const menu = isOwner ? ownerMenu : tenantMenu

  return (
    <>
      {/* Overlay trên mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-surface-200 pt-16 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Nút đóng trên mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 lg:hidden"
        >
          <X size={20} />
        </button>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/tenant'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
