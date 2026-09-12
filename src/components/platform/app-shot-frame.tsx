import Image from 'next/image'
import { appShot, type AppShot } from '@/lib/app-shots'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'

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
      <div className="overflow-hidden rounded-card border border-line-2 bg-bg-1 shadow-soft">
        {/* 16:10 holds a trading screen without cropping the order desk off
            the bottom, which is the half an evaluator wants to see. */}
        <div className="relative aspect-[16/10]">
          <Image
            src={shot.src}
            alt={shot.caption}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw"
            className="object-cover object-left-top"
          />
        </div>
      </div>
      <figcaption className="max-w-3xl text-data text-steel-500">{shot.caption}</figcaption>
    </figure>
  )
}
