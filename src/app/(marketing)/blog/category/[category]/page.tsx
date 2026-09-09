import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PageHero } from '@/components/layout/page-shell'
import { ArticleList } from '@/components/content/article-list'
import { Section, SectionHeader } from '@/components/ui/section'
import { BLOG_CATEGORIES, categoryFor, postsInCategory } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'
import { cn } from '@/lib/utils'

type Params = { params: { category: string } }

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: category.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const category = categoryFor(params.category)
  if (!category) return {}
  return pageMetadata({
    title: `${category.label} — Blog`,
    description: category.blurb,
    path: `/blog/category/${category.slug}`,
  })
}

export default function BlogCategoryPage({ params }: Params) {
  const category = categoryFor(params.category)
  if (!category) notFound()

  const posts = postsInCategory(category.slug)

  return (
    <>
      <PageHero eyebrow="Blog" heading={category.label} lead={category.blurb} />

      <Section>
        <nav aria-label="Blog topics" className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/blog"
            className="rounded-ui border border-line-2 px-3 py-1.5 text-[0.875rem] text-steel-300 transition-colors hover:bg-bg-2"
          >
            All posts
          </Link>
          {BLOG_CATEGORIES.map((item) => (
            <Link
              key={item.slug}
              href={`/blog/category/${item.slug}`}
              aria-current={item.slug === category.slug ? 'page' : undefined}
              className={cn(
                'rounded-ui border px-3 py-1.5 text-[0.875rem] transition-colors',
                item.slug === category.slug
                  ? 'border-signal/50 bg-signal/[0.08] text-steel-100'
                  : 'border-line-2 text-steel-300 hover:bg-bg-2',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <SectionHeader
          eyebrow={`${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}
          title={`Everything under ${category.label}`}
        />
        <div className="mt-10">
          <ArticleList
            entries={posts}
            basePath="/blog"
            emptyMessage={`Nothing published under ${category.label} yet.`}
          />
        </div>
      </Section>
    </>
  )
}
