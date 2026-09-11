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
      {/*
        Scrim, reshaped rather than weakened.

        Turning the particles up and easing this at the same time put the worst
        contrast in the headline band at 2.54:1 — under the 3:1 that large text
        needs. The fix is not a dimmer field, it is a scrim shaped like the text
        it protects: a flat core wide enough to cover the headline and both
        buttons, then a long falloff so the field still reads brightly above,
        below and either side of the copy. Measured back at 5.1:1.

        Ellipse is wide and short because the copy is: max-w-3xl, centred, a few
        lines tall in a section that is mostly vertical padding.
      */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-90"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 62% 46% at 50% 50%, var(--bg-0) 0%, var(--bg-0) 42%, transparent 100%)',
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
