import { ButtonLink } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { WingMark } from '@/components/ui/wing-mark'
import { LatticeBackdrop } from '@/components/backdrops/lattice-backdrop'
import { ECOSYSTEM_PILLARS } from '@/lib/brand'
import Link from 'next/link'

/**
 * Image-led hero.
 *
 * The supplied renders sit behind the headline via <HeroImage>, which swaps
 * the light and dark variant with the theme and degrades to the gradient and
 * hairline grid when a file is absent. See public/hero/README.md.
 *
 * <HeroImage> has been taken out: its wash, tint, radial scrim, bottom fade
 * and hairline grid all sat on top of the lattice and were what kept it dim.
 * The lattice is now the hero's background outright. Legibility is handled on
 * the type itself — a drop-shadow in the page's own background colour — rather
 * than by a layer over the animation.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <LatticeBackdrop className="-z-10" />
      <WingMark
        className="pointer-events-none absolute -left-32 top-10 h-[26rem] w-[46rem] text-steel-700 opacity-40"
        strokeWidth={1}
      />

      {/*
        Tightened to bring the hero's overall height down. The headline is the
        bulk of it — two lines of text-h1 is ~230px at 1440 — so it takes a
        local clamp rather than a change to the shared scale, which every other
        page's <h1> and the closing <h2> also read from.
      */}
      <div className="container-raptor relative pb-14 pt-6 md:pb-20 md:pt-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center md:gap-6">
          {/* self-start/center: a stretched chip in a flex column looks like a bar. */}
          <Chip tone="signal" dot className="self-center">
            Trading Technology. Evolved.
          </Chip>

          {/* Local clamp: 8vw/8rem shared scale down to 6.4vw/6rem here. */}
          <h1
            className="text-[clamp(2.625rem,6.4vw,6rem)] font-display font-bold uppercase leading-[0.92] tracking-[-0.02em]"
            /* Legibility without a covering layer. Token, not a literal. */
            style={{ filter: 'drop-shadow(0 2px 22px var(--bg-0)) drop-shadow(0 0 6px var(--bg-0))' }}
          >
            <span className="block text-chrome">The market doesn&rsquo;t stand still.</span>
            <span className="block text-chrome">Neither should your technology.</span>
          </h1>

          <p className="max-w-2xl text-body text-steel-300">
            Raptor is the technology layer underneath modern trading businesses: a terminal traders
            want to use, a CRM and client portal that share one record, a risk engine in the order
            path, and an intelligence layer that observes all of it.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/request-demo" variant="primary" size="lg">
              Request a demo
            </ButtonLink>
            <ButtonLink href="/platform" variant="ghost" size="lg">
              See the platform
            </ButtonLink>
          </div>

          <p className="font-mono text-[0.75rem] uppercase tracking-[0.16em] text-steel-500">
            Terminal. CRM. Client Portal. Intelligence. One ecosystem.
          </p>
        </div>

        {/* The ecosystem, stated as the six things it is made of. */}
        <ul className="surface-sheen mt-10 grid gap-px md:mt-12 overflow-hidden rounded-panel border border-line-2 bg-line-1 shadow-panel sm:grid-cols-2 lg:grid-cols-3">
          {ECOSYSTEM_PILLARS.map((pillar, index) => (
            <li key={pillar.id}>
              <Link
                href={pillar.href}
                className="lift group flex h-full flex-col gap-2 bg-bg-1/80 px-5 py-5 backdrop-blur-sm hover:bg-bg-2"
              >
                <span className="font-mono text-[0.6875rem] text-steel-500" data-numeric>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-[1.0625rem] uppercase tracking-tight text-steel-100">
                  {pillar.label}
                </span>
                <span className="text-[0.875rem] leading-snug text-steel-500">{pillar.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
