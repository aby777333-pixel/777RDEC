import { ButtonLink } from '@/components/ui/button'
import { WingMark } from '@/components/ui/wing-mark'
import { LazySingularity } from '@/components/backdrops/lazy-singularity'

/**
 * Closing band. The singularity is the background outright — nothing sits over
 * it. The headline carries its own drop-shadow instead of a scrim.
 */
export function Closing() {
  return (
    <section className="relative isolate overflow-hidden py-24 md:py-32">
      <LazySingularity className="-z-10" />
      <div className="grid-field pointer-events-none absolute inset-0" aria-hidden />
      <WingMark
        className="pointer-events-none absolute -right-20 bottom-0 h-[24rem] w-[42rem] text-steel-700 opacity-40"
        strokeWidth={1}
      />
      <div className="container-raptor relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
          <h2
            /* Local clamp. The shared text-h1 caps at 8rem — 128px here. 7rem
               is one step quieter, not a different size of headline. */
            className="text-[clamp(1.875rem,6.6vw,7rem)] font-display font-bold uppercase leading-[0.92] tracking-[-0.02em]"
            /* Same treatment as the hero: shadow on the type, no layer over
               the particles. */
            style={{ filter: 'drop-shadow(0 2px 22px var(--bg-0)) drop-shadow(0 0 6px var(--bg-0))' }}
          >
            <span className="block text-chrome">Don&rsquo;t just trade the market.</span>
            <span className="block text-chrome">Understand what is moving it.</span>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href="/request-demo" variant="primary" size="lg">
              Request a demo
            </ButtonLink>
            <ButtonLink href="/platform/emil" variant="ghost" size="lg">
              How EMIL thinks
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
