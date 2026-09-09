'use client'

import { cn } from '@/lib/utils'

export type BrandConfig = { name: string; accent: string; logoDataUrl: string | null }

/**
 * Simulated client portal, recreated as live components so the white-label
 * demo can re-skin it in the browser. Never a screenshot (§3).
 */
export function PortalFrame({ brand, className }: { brand: BrandConfig; className?: string }) {
  const accentStyle = { '--brand': brand.accent } as React.CSSProperties

  return (
    <div
      style={accentStyle}
      className={cn('overflow-hidden rounded-card border border-line-2 bg-bg-1 shadow-soft', className)}
    >
      <header className="flex items-center justify-between border-b border-line-1 px-4 py-3">
        <div className="flex items-center gap-2.5">
          {brand.logoDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element -- client-side object URL, never uploaded */
            <img src={brand.logoDataUrl} alt="" className="h-6 w-auto max-w-[6rem] object-contain" />
          ) : (
            <span
              className="grid h-6 w-6 place-items-center rounded-[4px] text-[0.625rem] font-bold text-white"
              style={{ backgroundColor: 'var(--brand)' }}
              aria-hidden
            >
              {brand.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="font-display text-[0.9375rem] tracking-tight text-steel-100">
            {brand.name}
          </span>
        </div>
        <nav aria-label="Portal" className="hidden gap-4 text-[0.75rem] text-steel-500 sm:flex">
          <span style={{ color: 'var(--brand)' }}>Dashboard</span>
          <span>Funds</span>
          <span>Accounts</span>
          <span>Verification</span>
        </nav>
      </header>

      <div className="grid gap-px bg-line-1 sm:grid-cols-3">
        {[
          { label: 'Balance', value: '12,840.50' },
          { label: 'Equity', value: '12,927.30' },
          { label: 'Floating P&L', value: '+86.80' },
        ].map((stat, index) => (
          <div key={stat.label} className="bg-bg-1 px-4 py-3.5">
            <p className="text-[0.5625rem] uppercase tracking-[0.16em] text-steel-500">{stat.label}</p>
            <p
              className="mt-1 font-mono text-[1rem]"
              style={{ color: index === 2 ? 'var(--brand)' : 'var(--steel-100)' }}
              data-numeric
            >
              {stat.value} <span className="text-[0.625rem] text-steel-500">USD</span>
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-line-1 px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[0.5625rem] uppercase tracking-[0.16em] text-steel-500">
            Verification
          </p>
          <p className="text-[0.6875rem]" style={{ color: 'var(--brand)' }}>
            2 of 3 complete
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-3">
          <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: 'var(--brand)' }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="rounded-ui px-3 py-1.5 text-[0.75rem] text-white"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Deposit
          </button>
          <button
            type="button"
            disabled
            className="rounded-ui border border-line-2 px-3 py-1.5 text-[0.75rem] text-steel-300"
          >
            Withdraw
          </button>
          <button
            type="button"
            disabled
            className="rounded-ui border border-line-2 px-3 py-1.5 text-[0.75rem] text-steel-300"
          >
            Statements
          </button>
        </div>
      </div>
    </div>
  )
}
