import type { Metadata } from 'next'
import Link from 'next/link'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { FAQ_GROUPS, faq as copy } from '@/lib/copy/engage'
import { pageMetadata } from '@/lib/seo'
import { SITE_URL } from '@/lib/brand'
import { cn } from '@/lib/utils'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/company/faq',
})

/** FAQPage structured data, built from the same source as the page. */
function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: `${SITE_URL}/company/faq`,
    mainEntity: FAQ_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    ),
  }
}

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow={copy.eyebrow} heading={copy.heading} lead={copy.lead} backdrop="tally" />

      <Section className="border-b border-line-1">
        <nav aria-label="FAQ sections" className="mb-12 flex flex-wrap gap-2">
          {FAQ_GROUPS.map((group) => (
            <a
              key={group.id}
              href={`#${group.id}`}
              className={cn(
                'tint-ink rounded-ui border border-line-2 px-3 py-1.5 text-[0.875rem] transition-colors hover:bg-bg-2',
                `tint-${(group.tint % 6) + 1}`,
              )}
            >
              {group.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-16">
          {FAQ_GROUPS.map((group) => (
            <section key={group.id} id={group.id} className="scroll-mt-24">
              <SectionHeader eyebrow={`${group.items.length} questions`} title={group.label} />
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {group.items.map((item) => (
                  <Panel key={item.q} tintIndex={group.tint} className="flex flex-col gap-3 p-6">
                    <h3 className="font-display text-[1.0625rem] leading-snug text-steel-100">
                      {item.q}
                    </h3>
                    <div className="flex flex-col gap-3 text-[0.9375rem] leading-relaxed text-steel-300">
                      <p>{item.a}</p>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="tint-ink self-start text-[0.875rem] underline underline-offset-4"
                        >
                          {item.linkLabel ?? 'Read more'}
                        </Link>
                      ) : null}
                    </div>
                  </Panel>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>

      <AnswerGrid answers={copy.answers} />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
    </>
  )
}
