import { cn } from '@/lib/utils'

type ChipTone = 'steel' | 'signal' | 'up' | 'down' | 'armed' | 'warn'

const TONES: Record<ChipTone, string> = {
  steel: 'border-line-2 text-steel-300',
  signal: 'border-signal/40 text-signal',
  up: 'border-up/40 text-up',
  down: 'border-down/40 text-down',
  armed: 'border-armed/50 text-armed',
  warn: 'border-warn/50 text-warn',
}

export function Chip({
  children,
  tone = 'steel',
  dot = false,
  className,
}: {
  children: React.ReactNode
  tone?: ChipTone
  dot?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-bg-1/60 px-2.5 py-1 text-eyebrow uppercase',
        TONES[tone],
        className,
      )}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  )
}
