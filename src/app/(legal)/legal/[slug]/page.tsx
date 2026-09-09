import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageHero } from '@/components/layout/page-shell'
import { Panel } from '@/components/ui/panel'
import { Section } from '@/components/ui/section'
import { LEGAL_DOCUMENTS, LEGAL_MAP } from '@/lib/copy/legal'
import { LEGAL_LINKS } from '@/lib/navigation'
import { pageMetadata } from '@/lib/seo'

type Params = { params: { slug: string } }

export function generateStaticParams() {
  return LEGAL_DOCUMENTS.map((doc) => ({ slug: doc.slug }))
}

export function generateMetadata({ params }: Params): Metadata {
  const doc = LEGAL_MAP.get(params.slug)
  if (!doc) return {}
  return pageMetadata({
    title: doc.title,
    description: doc.description,
    path: `/legal/${doc.slug}`,
  })
}

export default function LegalPage({ params }: Params) {
  const doc = LEGAL_MAP.get(params.slug)
  if (!doc) notFound()

  return (
    <>
      <PageHero eyebrow="Legal" heading={doc.title} lead={doc.intro} />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_16rem] lg:items-start">
          <article className="flex max-w-3xl flex-col gap-10">
            {doc.sections.map((section, index) => (
              <section key={section.heading} className="flex flex-col gap-3">
                <h2 className="flex items-baseline gap-3 font-display text-[1.25rem] uppercase tracking-tight text-steel-100">
                  <span className="font-mono text-[0.75rem] text-steel-500" data-numeric>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-[1rem] leading-relaxed text-steel-300">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <p className="border-t border-line-2 pt-6 text-[0.8125rem] leading-relaxed text-steel-500">
              This document is a plain-language draft prepared alongside the website. It has not been
              reviewed by counsel and should be reviewed before launch.
            </p>
          </article>

          <Panel className="flex flex-col gap-3 p-5 lg:sticky lg:top-24">
            <h2 className="text-eyebrow uppercase text-steel-500">All legal documents</h2>
            <ul className="flex flex-col gap-1">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={
                      link.href === `/legal/${doc.slug}`
                        ? 'block rounded-ui bg-bg-2 px-3 py-2 text-[0.875rem] text-steel-100'
                        : 'block rounded-ui px-3 py-2 text-[0.875rem] text-steel-500 transition-colors hover:bg-bg-2 hover:text-steel-300'
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </Section>
    </>
  )
}
