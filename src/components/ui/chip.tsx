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
      // text-eyebrow is added after the merge on purpose: tailwind-merge reads
      // the custom size as a colour and drops it in favour of the tone's text
      // colour, which left every chip at body size.
      className={`${cn(
        'inline-flex items-center gap-1.5 rounded-full border bg-bg-1/60 px-2.5 py-1 uppercase',
        TONES[tone],
        className,
      )} text-eyebrow`}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden /> : null}
      {children}
    </span>
  )
}
