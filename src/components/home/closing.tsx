import { ButtonLink } from '@/components/ui/button'
import { WingMark } from '@/components/ui/wing-mark'
import { ParticleBackdrop } from '@/components/backdrops/particle-backdrop'

/**
 * Closing band. The particle drift sits at -z-10 under a radial scrim, so the
 * headline is read against a settled centre rather than against movement —
 * the same treatment <HeroImage> gives the hero.
 */
export function Closing() {
  return (
    <section className="relative isolate overflow-hidden py-28 md:py-36">
      <ParticleBackdrop className="-z-10" />
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 62% 58% at 50% 50%, var(--bg-0) 12%, transparent 78%)',
        }}
      />
      <div className="grid-field pointer-events-none absolute inset-0" aria-hidden />
      <WingMark
        className="pointer-events-none absolute -right-20 bottom-0 h-[24rem] w-[42rem] text-steel-700 opacity-40"
        strokeWidth={1}
      />
      <div className="container-raptor relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <h2 className="text-h1 uppercase">
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
