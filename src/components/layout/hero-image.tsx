import { heroImages } from '@/lib/brand-assets'
import { cn } from '@/lib/utils'

/**
 * Hero backdrop.
 *
 * Both theme variants are in the DOM and only the active one is visible, so
 * switching theme does not flash. Images are CSS backgrounds under a scrim; a
 * file that is not present is simply not referenced, so there is no request
 * and no console noise, and the section falls back to the gradient plus
 * hairline grid with headline contrast unchanged.
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
      {light ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.14] dark:opacity-0"
          style={{ backgroundImage: `url(${light.src})` }}
        />
      ) : null}
      {dark ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-0 dark:opacity-[0.22]"
          style={{ backgroundImage: `url(${dark.src})` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-0/60 via-bg-0/85 to-bg-0" />
      <div className="grid-field absolute inset-0" />
    </div>
  )
}
