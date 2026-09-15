import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePage } from '@/components/content/article-page'
import { getContent, listContent } from '@/lib/content'
import { articleJsonLd, jsonLdScript, pageMetadata } from '@/lib/seo'

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
    article: {
      publishedTime: entry.frontmatter.date,
      authors: [entry.frontmatter.author],
      section: 'Research',
      tags: entry.frontmatter.tags,
    },
  })
}

export default function ResearchArticlePage({ params }: Params) {
  const entry = getContent('research', params.slug)
  if (!entry) notFound()

  return (
    <>
      <ArticlePage
        entry={entry}
        eyebrow="Intelligence · Research"
        backHref="/intelligence/research"
        backLabel="All research"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              type: 'Article',
              title: entry.frontmatter.title,
              description: entry.frontmatter.description,
              path: `/intelligence/research/${entry.slug}`,
              datePublished: entry.frontmatter.date,
              author: entry.frontmatter.author,
              section: 'Research',
              keywords: entry.frontmatter.tags,
            }),
          ),
        }}
      />
    </>
  )
}
