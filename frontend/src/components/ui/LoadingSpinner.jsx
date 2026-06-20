export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-primary-200 border-t-primary-600`}
      />
      {text && (
        <p className="text-sm text-surface-500 animate-pulse">{text}</p>
      )}
    </div>
  )
}
