import { appShot, type AppShot } from '@/lib/app-shots'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'
import { AppShotZoom } from './app-shot-zoom'

/**
 * A capture of the running application, framed.
 *
 * Renders nothing at all when the file has not been added — the presence check
 * happens on the server, so an absent screenshot costs no request and leaves
 * no gap. See `@/lib/app-shots` for why screenshots exist here when design
 * system §3 says they should not, and `public/app/README.md` for filenames.
 *
 * The frame is the site's own surface rather than a browser chrome mock: a
 * hairline, the card radius, and the shadow every other panel carries. A fake
 * address bar around a real product is a costume.
 *
 * The presence check has to stay on the server and the zoom has to run on the
 * client, so this component is the seam: it resolves the slot and hands the
 * resolved paths to <AppShotZoom>.
 */
export function AppShotFrame({
  id,
  eyebrow,
  className,
  priority = false,
}: {
  id: AppShot['id']
  /** Optional label above the frame. */
  eyebrow?: string
  className?: string
  /** Only for a shot high enough on the page to be worth pre-loading. */
  priority?: boolean
}) {
  const shot = appShot(id)
  if (!shot) return null

  return (
    <figure className={cn('flex flex-col gap-4', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <AppShotZoom src={shot.src} alt={shot.caption} priority={priority} />
      <figcaption className="max-w-3xl text-data text-steel-500">{shot.caption}</figcaption>
    </figure>
  )
}
