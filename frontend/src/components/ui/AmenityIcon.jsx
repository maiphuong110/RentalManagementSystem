import React from 'react'
import {
  Wind,
  Flame,
  Tv,
  Wifi,
  Bike,
  Car,
  Shield,
  Video,
  ChevronUp,
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react'

const AMENITY_ICON_MAP = {
  ac_unit: { icon: Wind, color: 'text-sky-500 bg-sky-50 border-sky-100' },
  hot_tub: { icon: Flame, color: 'text-orange-500 bg-orange-50 border-orange-100' },
  kitchen: { icon: Tv, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  local_laundry_service: { icon: Sparkles, color: 'text-purple-500 bg-purple-50 border-purple-100' },
  wifi: { icon: Wifi, color: 'text-blue-500 bg-blue-50 border-blue-100' },
  two_wheeler: { icon: Bike, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
  directions_car: { icon: Car, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' },
  balcony: { icon: Wind, color: 'text-teal-500 bg-teal-50 border-teal-100' },
  security: { icon: Shield, color: 'text-red-500 bg-red-50 border-red-100' },
  videocam: { icon: Video, color: 'text-rose-500 bg-rose-50 border-rose-100' },
  elevator: { icon: ChevronUp, color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
  stairs: { icon: Layers, color: 'text-violet-500 bg-violet-50 border-violet-100' }
}

export default function AmenityIcon({ iconName, size = 18, showBg = true, className = '' }) {
  const match = AMENITY_ICON_MAP[iconName] || { icon: HelpCircle, color: 'text-surface-400 bg-surface-50 border-surface-100' }
  const IconComponent = match.icon

  if (!showBg) {
    return <IconComponent size={size} className={`${match.color.split(' ')[0]} ${className}`} />
  }

  return (
    <div className={`inline-flex items-center justify-center p-1.5 rounded-lg border ${match.color} ${className}`}>
      <IconComponent size={size} />
    </div>
  )
}
