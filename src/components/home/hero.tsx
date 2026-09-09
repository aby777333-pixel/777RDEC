import dynamic from 'next/dynamic'
import { ButtonLink } from '@/components/ui/button'
import { WingMark } from '@/components/ui/wing-mark'
import { Chip } from '@/components/ui/chip'

/**
 * The terminal scene is heavy (charts + worker), so it is loaded on the client
 * only, behind a static poster that matches its final geometry — no layout
 * shift, and the marketing copy is server-rendered for SEO.
 */
const TerminalFrame = dynamic(
  () => import('@/components/frames/terminal-frame').then((m) => m.TerminalFrame),
  { ssr: false, loading: () => <TerminalPoster /> },
)

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="grid-field pointer-events-none absolute inset-0" aria-hidden />
      <WingMark
        className="pointer-events-none absolute -left-32 top-8 h-[26rem] w-[46rem] text-steel-700 opacity-50"
        strokeWidth={1}
      />

      <div className="container-raptor relative">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <Chip tone="signal" dot>
            Trading Technology. Evolved.
          </Chip>

          <h1 className="text-h1 uppercase">
            <span className="block text-chrome">The market doesn&rsquo;t stand still.</span>
            <span className="block text-chrome">Neither should your technology.</span>
          </h1>

          <p className="max-w-2xl text-body text-steel-300">
            Raptor is the technology layer underneath modern trading businesses: a terminal traders
            want to use, a CRM and client portal that share one record, a risk engine in the order
            path, and an intelligence layer that observes all of it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/experience" variant="primary" size="lg">
              Experience Raptor
            </ButtonLink>
            <ButtonLink href="/request-demo" variant="ghost" size="lg">
              Request a demo
            </ButtonLink>
          </div>

          <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-steel-500">
            Terminal. CRM. Client Portal. Intelligence. One ecosystem.
          </p>
        </div>

        <div className="mt-14 [perspective:2000px]">
          <div className="origin-top [transform:rotateX(6deg)] md:[transform:rotateX(9deg)]">
            <TerminalFrame />
          </div>
        </div>
      </div>
    </section>
  )
}

/** Poster fallback: same shell, no charts, no worker. */
function TerminalPoster() {
  return (
    <div className="overflow-hidden rounded-panel border border-line-2 bg-bg-1 shadow-panel">
      <div className="flex items-center justify-between border-b border-line-1 bg-bg-2 px-4 py-2.5">
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-500">
          Raptor Terminal
        </span>
        <span className="rounded-full border border-line-2 px-2 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-500">
          Simulated
        </span>
      </div>
      <div className="grid gap-px bg-line-1 sm:grid-cols-2">
        {['EURUSD', 'XAUUSD', 'NAS100', 'BTCUSD'].map((symbol) => (
          <div key={symbol} className="h-[9.5rem] bg-bg-1 px-3 pt-2.5">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-steel-300">
              {symbol}
            </span>
          </div>
        ))}
      </div>
      <div className="h-24 border-t border-line-1 bg-bg-1" />
    </div>
  )
}
