import { appShot, type AppShot } from '@/lib/app-shots'
import { Eyebrow } from '@/components/ui/eyebrow'
import { cn } from '@/lib/utils'
import { AppShotZoom } from './app-shot-zoom'

/**
 * Several captures of the running application, side by side.
 *
 * A section that explains five cockpit surfaces wants five captures, and five
 * full-width frames would be five screens of scrolling. So they sit in a grid
 * at half width, where each is a recognisable thumbnail of a surface, and
 * clicking one opens it at the size of the window.
 *
 * Absent files are dropped rather than stubbed, and if none of the requested
 * captures is on disk the whole block disappears — so a section keeps its
 * meaning whether or not anybody has taken the screenshots yet.
 */
export function AppShotGallery({
  ids,
  eyebrow,
  className,
  columns = 2,
}: {
  ids: readonly AppShot['id'][]
  /** Optional label above the grid. */
  eyebrow?: string
  className?: string
  /** Two reads best for dense surfaces; three for simpler ones. */
  columns?: 2 | 3
}) {
  const shots = ids.map((id) => appShot(id)).filter((shot): shot is AppShot => shot !== null)
  if (shots.length === 0) return null

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <div
        className={cn(
          'grid gap-6',
          columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2',
        )}
      >
        {shots.map((shot) => (
          <figure key={shot.id} className="flex flex-col gap-3">
            <AppShotZoom src={shot.src} alt={shot.caption} />
            <figcaption className="text-data leading-relaxed text-steel-500">
              {shot.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
