import { AlertTriangle } from 'lucide-react'
import { RISK_LINE_SHORT } from '@/lib/brand'
import { cn } from '@/lib/utils'

/** Required on every EMIL and risk surface (§7). */
export function RiskLine({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        'flex items-start gap-2.5 rounded-card border border-line-2 bg-bg-1 px-4 py-3 text-[0.8125rem] leading-relaxed text-steel-500',
        className,
      )}
    >
      <AlertTriangle size={15} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-warn" />
      <span>{RISK_LINE_SHORT}</span>
    </p>
  )
}
