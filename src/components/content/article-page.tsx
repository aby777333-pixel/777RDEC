import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Mdx } from './mdx'
import { Chip } from '@/components/ui/chip'
import { Section } from '@/components/ui/section'
import { PageHero } from '@/components/layout/page-shell'
import { formatDate, type ContentEntry } from '@/lib/content'

export function ArticlePage({
  entry,
  eyebrow,
  backHref,
  backLabel,
}: {
  entry: ContentEntry
  eyebrow: string
  backHref: string
  backLabel: string
}) {
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        heading={entry.frontmatter.title}
        lead={entry.frontmatter.description}
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[0.8125rem] text-steel-500" data-numeric>
            {formatDate(entry.frontmatter.date)}
          </span>
          <span className="text-[0.8125rem] text-steel-500">{entry.frontmatter.author}</span>
          {entry.frontmatter.draft ? <Chip tone="warn">Placeholder content</Chip> : null}
          {entry.frontmatter.tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>
      </PageHero>

      <Section>
        <article className="max-w-3xl">
          <Mdx source={entry.body} />
        </article>

        <div className="mt-14 border-t border-line-2 pt-6">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-[0.9375rem] text-signal transition-colors hover:text-steel-100"
          >
            <ArrowLeft size={15} strokeWidth={1.5} aria-hidden />
            {backLabel}
          </Link>
        </div>
      </Section>
    </>
  )
}
