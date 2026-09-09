import Link from 'next/link'
import { Chip } from '@/components/ui/chip'
import { Panel } from '@/components/ui/panel'
import { formatDate, type ContentEntry } from '@/lib/content'

export function ArticleList({
  entries,
  basePath,
  emptyMessage,
}: {
  entries: readonly ContentEntry[]
  basePath: string
  emptyMessage: string
}) {
  if (entries.length === 0) {
    return <p className="text-body text-steel-500">{emptyMessage}</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.slug}>
          <Link href={`${basePath}/${entry.slug}`} className="group block">
            <Panel interactive className="flex flex-col gap-3 p-6 group-hover:bg-bg-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[0.75rem] text-steel-500" data-numeric>
                  {formatDate(entry.frontmatter.date)}
                </span>
                <Chip>{entry.frontmatter.readMinutes} min read</Chip>
                {entry.frontmatter.draft ? <Chip tone="warn">Placeholder</Chip> : null}
                {entry.frontmatter.tags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
              <h3 className="font-display text-[1.375rem] leading-snug tracking-tight text-steel-100">
                {entry.frontmatter.title}
              </h3>
              <p className="text-[0.9375rem] leading-relaxed text-steel-300">
                {entry.frontmatter.description}
              </p>
            </Panel>
          </Link>
        </li>
      ))}
    </ul>
  )
}
