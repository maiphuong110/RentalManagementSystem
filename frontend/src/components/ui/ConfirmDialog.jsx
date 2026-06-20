import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Xác nhận', danger = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-scale-in p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`p-3 rounded-full ${danger ? 'bg-danger-50 text-danger-500' : 'bg-warning-50 text-warning-500'}`}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900">{title}</h3>
            <p className="mt-1 text-sm text-surface-500">{message}</p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-surface-300 text-surface-700 hover:bg-surface-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => { onConfirm(); onClose() }}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white transition-colors ${
                danger
                  ? 'bg-danger-500 hover:bg-danger-600'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
