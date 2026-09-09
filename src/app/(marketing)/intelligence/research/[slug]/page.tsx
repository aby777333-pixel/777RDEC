import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePage } from '@/components/content/article-page'
import { getContent, listContent } from '@/lib/content'
import { pageMetadata } from '@/lib/seo'

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return listContent('research').map((entry) => ({ slug: entry.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const entry = getContent('research', params.slug)
  if (!entry) return {}
  return pageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    path: `/intelligence/research/${entry.slug}`,
  })
}

export default function ResearchArticlePage({ params }: Params) {
  const entry = getContent('research', params.slug)
  if (!entry) notFound()

  return (
    <ArticlePage
      entry={entry}
      eyebrow="Intelligence · Research"
      backHref="/intelligence/research"
      backLabel="All research"
    />
  )
}
