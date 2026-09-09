import { heroImages } from '@/lib/brand-assets'
import { cn } from '@/lib/utils'

/**
 * Hero backdrop, built to blend a photographic render into a monochrome
 * steel palette without fighting the caption on top of it.
 *
 * The layering (see `.hero-media` / `.hero-tint` / `.hero-scrim` in
 * globals.css) desaturates the image toward the palette, tints it with the
 * accent so it reads as brand rather than stock, then lays a radial scrim that
 * is near-opaque behind the centred caption and clears toward the edges. The
 * result is legible copy over an image that is still visibly there.
 *
 * Both theme variants stay in the DOM and only the active one is visible, so
 * switching theme does not flash. Files are checked on the server, so one that
 * is absent is never referenced — no request, no 404 — and the section falls
 * back to the wash and hairline grid.
 *
 * Expected filenames and crops: public/hero/README.md.
 */
export function HeroImage({
  variant = 'default',
  className,
}: {
  /** `emil` prefers the cockpit render over the office one. */
  variant?: 'default' | 'emil'
  className?: string
}) {
  const available = heroImages()
  const light = available.find((image) => image.theme === 'light')
  const darkPool = available.filter((image) => image.theme === 'dark')
  const dark =
    darkPool.find((image) => image.src.includes('cockpit') === (variant === 'emil')) ?? darkPool[0]

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      aria-hidden
    >
      {/* Accent wash. Present whether or not an image is, so the section is
          never a flat void when the files have not been added yet. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 14% 0%, var(--wash-a), transparent 68%), radial-gradient(ellipse 60% 54% at 88% 14%, var(--wash-b), transparent 70%)',
        }}
      />

      {light ? (
        <div
          className="hero-media dark:!opacity-0"
          style={{ backgroundImage: `url(${light.src})` }}
        />
      ) : null}
      {dark ? (
        <div
          className="hero-media !opacity-0 dark:!opacity-[var(--hero-image-opacity)]"
          style={{ backgroundImage: `url(${dark.src})` }}
        />
      ) : null}

      {light || dark ? (
        <>
          <div className="hero-tint" />
          <div className="hero-scrim" />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 60%, var(--bg-0) 100%)' }}
        />
      )}

      <div className="grid-field absolute inset-0" />
    </div>
  )
}
