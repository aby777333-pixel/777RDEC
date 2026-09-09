import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePage } from '@/components/content/article-page'
import { getContent, listContent } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return listContent('news').map((entry) => ({ slug: entry.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const entry = getContent('news', params.slug)
  if (!entry) return {}
  return pageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    path: `/company/news/${entry.slug}`,
  })
}

export default function NewsArticlePage({ params }: Params) {
  const entry = getContent('news', params.slug)
  if (!entry) notFound()

  return (
    <ArticlePage
      entry={entry}
      eyebrow="Company · News"
      backHref="/company/news"
      backLabel="All news"
    />
  )
}
