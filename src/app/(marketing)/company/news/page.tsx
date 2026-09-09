import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { ArticleList } from '@/components/content/article-list'
import { Section, SectionHeader } from '@/components/ui/section'
import { listContent } from '@/lib/content'
import { news as copy } from '@/lib/copy/company'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/company/news',
})

export default function NewsIndexPage() {
  const entries = listContent('news')

  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} />
      <Section className="border-b border-line-1">
        <SectionHeader eyebrow="Latest" title="Company and product updates" />
        <div className="mt-10">
          <ArticleList
            entries={entries}
            basePath="/company/news"
            emptyMessage="No news published yet."
          />
        </div>
      </Section>
      <AnswerGrid answers={copy.answers} />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </>
  )
}
