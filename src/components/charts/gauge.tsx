import { cn } from '@/lib/utils'

/** Semi-circular utilisation gauge. Steel track, one accent for the value. */
export function Gauge({
  value,
  max = 100,
  label,
  caption,
  tone = 'signal',
  className,
}: {
  value: number
  max?: number
  label: string
  caption?: string
  tone?: 'signal' | 'warn' | 'down'
  className?: string
}) {
  const ratio = Math.max(0, Math.min(value / max, 1))
  const radius = 52
  const circumference = Math.PI * radius
  const stroke = `var(--${tone})`

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <svg viewBox="0 0 128 74" className="w-full max-w-[11rem]" role="img" aria-label={`${label}: ${value} of ${max}`}>
        <path
          d={`M 12 64 A ${radius} ${radius} 0 0 1 116 64`}
          fill="none"
          stroke="var(--bg-3)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={`M 12 64 A ${radius} ${radius} 0 0 1 116 64`}
          fill="none"
          stroke={stroke}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${circumference * ratio} ${circumference}`}
        />
        <text
          x="64"
          y="58"
          textAnchor="middle"
          className="fill-[var(--steel-100)] font-mono text-[1.375rem]"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {Math.round(ratio * 100)}%
        </text>
      </svg>
      <span className="text-eyebrow uppercase text-steel-500">{label}</span>
      {caption ? <span className="text-center text-[0.75rem] text-steel-500">{caption}</span> : null}
    </div>
  )
}
