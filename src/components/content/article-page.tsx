import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Mdx } from './mdx'
import { Chip } from '@/components/ui/chip'
import { Panel } from '@/components/ui/panel'
import { Section } from '@/components/ui/section'
import { PageHero } from '@/components/layout/page-shell'
import { formatDate, type ContentEntry } from '@/lib/content'

export function ArticlePage({
  entry,
  eyebrow,
  backHref,
  backLabel,
  related = [],
  relatedBasePath,
}: {
  entry: ContentEntry
  eyebrow: string
  backHref: string
  backLabel: string
  related?: readonly ContentEntry[]
  relatedBasePath?: string
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
          <Chip>{entry.frontmatter.readMinutes} min read</Chip>
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

        {related.length > 0 && relatedBasePath ? (
          <div className="mt-16 border-t border-line-1 pt-10">
            <h2 className="text-eyebrow uppercase text-steel-500">Related reading</h2>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {related.map((post, index) => (
                <li key={post.slug}>
                  <Link href={`${relatedBasePath}/${post.slug}`} className="group block h-full">
                    <Panel interactive tintIndex={index} className="flex h-full flex-col gap-2 p-5">
                      <span className="font-mono text-[0.6875rem] text-steel-500" data-numeric>
                        {formatDate(post.frontmatter.date)}
                      </span>
                      <span className="font-display text-[1rem] leading-snug text-steel-100">
                        {post.frontmatter.title}
                      </span>
                      <span className="text-[0.8125rem] leading-relaxed text-steel-500">
                        {post.frontmatter.description}
                      </span>
                    </Panel>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

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
