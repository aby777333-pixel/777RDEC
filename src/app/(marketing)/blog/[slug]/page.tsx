import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArticlePage } from '@/components/content/article-page'
import { categoryFor, getContent, listContent } from '@/lib/content'
import { articleJsonLd, jsonLdScript, pageMetadata } from '@/lib/seo'

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return listContent('blog').map((entry) => ({ slug: entry.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const entry = getContent('blog', params.slug)
  if (!entry) return {}
  return pageMetadata({
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    path: `/blog/${entry.slug}`,
    article: {
      publishedTime: entry.frontmatter.date,
      authors: [entry.frontmatter.author],
      section: categoryFor(entry.frontmatter.category)?.label,
      tags: entry.frontmatter.tags,
    },
  })
}

export default function BlogPostPage({ params }: Params) {
  const entry = getContent('blog', params.slug)
  if (!entry) notFound()

  const category = categoryFor(entry.frontmatter.category)
  const related = listContent('blog')
    .filter((post) => post.frontmatter.category === entry.frontmatter.category)
    .filter((post) => post.slug !== entry.slug)
    .slice(0, 3)

  return (
    <>
      <ArticlePage
        entry={entry}
        eyebrow={category ? `Blog · ${category.label}` : 'Blog'}
        backHref={category ? `/blog/category/${category.slug}` : '/blog'}
        backLabel={category ? `More on ${category.label}` : 'All posts'}
        related={related}
        relatedBasePath="/blog"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            articleJsonLd({
              title: entry.frontmatter.title,
              description: entry.frontmatter.description,
              path: `/blog/${entry.slug}`,
              datePublished: entry.frontmatter.date,
              author: entry.frontmatter.author,
              section: category?.label,
              keywords: entry.frontmatter.tags,
            }),
          ),
        }}
      />
    </>
  )
}
