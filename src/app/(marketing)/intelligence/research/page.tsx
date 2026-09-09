import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { ArticleList } from '@/components/content/article-list'
import { Section } from '@/components/ui/section'
import { listContent } from '@/lib/content'
import { research as copy } from '@/lib/copy/intelligence'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/intelligence/research',
})

export default function ResearchIndexPage() {
  const entries = listContent('research')

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />
      <Section className="border-b border-line-1">
        <ArticleList
          entries={entries}
          basePath="/intelligence/research"
          emptyMessage="No research notes published yet."
        />
      </Section>
      <AnswerGrid answers={copy.answers} />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
