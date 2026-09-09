import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/page-shell'
import { Section } from '@/components/ui/section'
import { SiteSearch } from '@/components/search/site-search'
import { buildSearchIndex } from '@/lib/search'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Search',
    description: 'Search across the platform pages, blog, research, news and legal notices.',
    path: '/search',
  }),
  // A search page has nothing of its own for a crawler to index.
  robots: { index: false, follow: true },
}

export default function Page() {
  const index = buildSearchIndex()

  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow="Search"
        heading="Find it"
        lead="Everything published on this site — platform pages, blog posts, research notes, company news and the legal notices — in one index. It runs entirely in your browser; nothing you type is sent anywhere."
      />
      <Section>
        <SiteSearch index={index} />
      </Section>
    </div>
  )
}
