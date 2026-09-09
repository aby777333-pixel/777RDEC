import type { Metadata } from 'next'
import Link from 'next/link'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { ArticleList } from '@/components/content/article-list'
import { Panel } from '@/components/ui/panel'
import { Chip } from '@/components/ui/chip'
import { Section, SectionHeader } from '@/components/ui/section'
import { BLOG_CATEGORIES, formatDate, listContent, postsInCategory } from '@/lib/content'
import { blogIndex as copy } from '@/lib/copy/blog'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/blog',
})

export default function BlogIndexPage() {
  const posts = listContent('blog')
  const [featured, ...rest] = posts

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />

      <Section className="wash border-b border-line-1">
        <SectionHeader eyebrow="Topics" title="Where to start" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_CATEGORIES.map((category) => {
            const count = postsInCategory(category.slug).length
            return (
              <Link key={category.slug} href={`/blog/category/${category.slug}`} className="group">
                <Panel interactive className="flex h-full flex-col gap-2.5 p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-[1.0625rem] uppercase tracking-tight text-steel-100">
                      {category.label}
                    </span>
                    <span className="font-mono text-[0.6875rem] text-steel-500" data-numeric>
                      {count} {count === 1 ? 'post' : 'posts'}
                    </span>
                  </div>
                  <p className="text-[0.875rem] leading-relaxed text-steel-500">{category.blurb}</p>
                </Panel>
              </Link>
            )
          })}
        </div>
      </Section>

      {featured ? (
        <Section className="border-b border-line-1">
          <SectionHeader eyebrow="Latest" title={featured.frontmatter.title} />
          <p className="mt-4 max-w-2xl text-body text-steel-300">
            {featured.frontmatter.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[0.8125rem] text-steel-500" data-numeric>
              {formatDate(featured.frontmatter.date)}
            </span>
            <Chip>{featured.frontmatter.readMinutes} min read</Chip>
            <Link
              href={`/blog/${featured.slug}`}
              className="text-[0.9375rem] text-signal underline underline-offset-4"
            >
              Read it
            </Link>
          </div>
        </Section>
      ) : null}

      <Section className="border-b border-line-1">
        <SectionHeader eyebrow="Everything" title="All posts" />
        <div className="mt-8">
          <ArticleList
            entries={rest.length > 0 ? rest : posts}
            basePath="/blog"
            emptyMessage="Nothing published yet."
          />
        </div>
      </Section>

      <AnswerGrid answers={copy.answers} />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
