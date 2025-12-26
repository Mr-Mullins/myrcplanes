interface SafetyStatusBadgeProps {
  status: 'GRØNN' | 'RØD'
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Safety Status Badge Component
 *
 * Visual indicator for location safety status:
 * - GRØNN (Green): Safe to fly (with NOTAM disclaimer)
 * - RØD (Red): Unsafe - inside restricted zone
 *
 * @example
 * <SafetyStatusBadge status="GRØNN" />
 * <SafetyStatusBadge status="RØD" size="lg" />
 */
export default function SafetyStatusBadge({
  status,
  size = 'md'
}: SafetyStatusBadgeProps) {
  const isGreen = status === 'GRØNN'

  // Size-based styling
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  }

  // Color styling
  const colorClasses = isGreen
    ? 'bg-green-100 text-green-800 border-green-300'
    : 'bg-red-100 text-red-800 border-red-300'

  const dotColor = isGreen ? 'bg-green-600' : 'bg-red-600'

  return (
    <div
      className={`
        inline-flex items-center gap-2 rounded-full border-2 font-semibold
        ${sizeClasses[size]}
        ${colorClasses}
      `}
    >
      <span className={`${dotSizes[size]} ${dotColor} rounded-full animate-pulse`} />
      <span>{status}</span>
    </div>
  )
}
