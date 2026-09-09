import { cn } from '@/lib/utils'

/**
 * The raptor motif, abstracted: the logo's five-feather swept wing reduced to
 * five diagonals. Design system §3 allows this once in the hero background
 * and as the loading mark. No bird illustrations.
 */
export function WingMark({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 240 120"
      fill="none"
      aria-hidden
      className={cn('overflow-visible', className)}
      preserveAspectRatio="none"
    >
      <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
        <path d="M4 108 C 70 96, 138 62, 236 6" opacity="0.9" />
        <path d="M4 96 C 66 86, 128 56, 214 8" opacity="0.7" />
        <path d="M4 84 C 62 76, 118 50, 192 10" opacity="0.5" />
        <path d="M4 72 C 58 66, 108 44, 170 12" opacity="0.34" />
        <path d="M4 60 C 54 56, 98 38, 148 14" opacity="0.2" />
      </g>
    </svg>
  )
}
