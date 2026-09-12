import type { SpecGroup } from '@/lib/copy/app-capabilities'
import { Eyebrow } from './eyebrow'
import { Panel } from './panel'
import { cn } from '@/lib/utils'

/**
 * A grouped capability list, for the pages that have to say what is actually
 * in the product rather than what it is for.
 *
 * The module grid every page already carries answers "what are the parts".
 * This answers "what is in this part" — the counts, the order types, the
 * protections — which is the level a technical evaluator reads at and the
 * level a marketing paragraph cannot hold. So the rows are set in the data
 * face at data size: a specification is meant to be scanned, not read.
 *
 * Content comes from `@/lib/copy/app-capabilities`, which takes it from the
 * running applications.
 */
export function SpecGroups({
  groups,
  className,
  columns = 2,
}: {
  groups: readonly SpecGroup[]
  className?: string
  /** Two reads best for four groups; three suits a wider set of shorter ones. */
  columns?: 2 | 3
}) {
  return (
    <div
      className={cn(
        'grid gap-6',
        columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2',
        className,
      )}
    >
      {groups.map((group, index) => (
        <Panel key={group.label} tintIndex={index} className="flex flex-col gap-5">
          <Eyebrow>{group.label}</Eyebrow>
          <ul className="flex flex-col">
            {group.items.map((item) => (
              <li
                key={item}
                className={cn(
                  'border-t border-line-1 py-3 text-data text-steel-300',
                  'first:border-t-0 first:pt-0 last:pb-0',
                )}
              >
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  )
}
