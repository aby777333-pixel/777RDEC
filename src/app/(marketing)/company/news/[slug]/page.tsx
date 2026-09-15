import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePage } from '@/components/content/article-page'
import { getContent, listContent } from '@/lib/content'
import { articleJsonLd, jsonLdScript, pageMetadata } from '@/lib/seo'

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
    article: {
      publishedTime: entry.frontmatter.date,
      authors: [entry.frontmatter.author],
      section: 'News',
      tags: entry.frontmatter.tags,
    },
  })
}

export default function NewsArticlePage({ params }: Params) {
  const entry = getContent('news', params.slug)
  if (!entry) notFound()

  return (
    <>
      <ArticlePage
        entry={entry}
        eyebrow="Company · News"
        backHref="/company/news"
        backLabel="All news"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              type: 'NewsArticle',
              title: entry.frontmatter.title,
              description: entry.frontmatter.description,
              path: `/company/news/${entry.slug}`,
              datePublished: entry.frontmatter.date,
              author: entry.frontmatter.author,
              section: 'News',
              keywords: entry.frontmatter.tags,
            }),
          ),
        }}
      />
    </>
  )
}
