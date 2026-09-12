import type { SpecGroup } from '@/lib/copy/app-capabilities'
import { Panel } from './panel'
import { cn } from '@/lib/utils'

/**
 * A grouped capability list, for the pages that have to say what is actually
 * in the product rather than what it is for.
 *
 * The module grid every page carries answers "what are the parts". This
 * answers "what is in this part" — the counts, the order types, the
 * protections — which is the level a technical evaluator reads at.
 *
 * The rows follow <NotAnEa> exactly, because that comparison is the same shape
 * of thing and it was already right: a label, a rule under it, then rows each
 * carrying their own rule. Every row having a top border is what makes the
 * label sit apart from the first item instead of on top of it, and it is what
 * keeps two columns of unequal length reading as one table rather than two
 * lists that happen to be side by side.
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
        'grid gap-4',
        columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'lg:grid-cols-2',
        className,
      )}
    >
      {groups.map((group, index) => (
        <Panel key={group.label} tintIndex={index} className="p-6">
          <p className="text-eyebrow uppercase text-steel-500">{group.label}</p>
          <ul className="mt-4 flex flex-col gap-4">
            {group.items.map((item) => (
              <li
                key={item}
                className="border-t border-line-2 pt-3.5 text-[0.9375rem] leading-relaxed text-steel-300"
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
