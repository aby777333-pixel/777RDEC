import type { Metadata } from 'next'
import { AnswerGrid, CtaBand, PageHero } from '@/components/layout/page-shell'
import { IndigenousModules } from '@/components/home/indigenous-modules'
import { modulesPage as copy } from '@/lib/copy/modules'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/modules',
})

/**
 * Composed from the shell rather than using <StandardPage>, which would render
 * its <ModuleGrid> from `copy.modules` — the same twenty modules the grid
 * below already shows. That field is kept because it is what makes each module
 * name searchable; it just is not rendered twice.
 */
export default function ModulesPage() {
  return (
    <div className="flex flex-col">
      <PageHero
        eyebrow={copy.eyebrow}
        heading={copy.heading}
        lead={copy.lead}
        backdrop="lightburst"
      />
      <AnswerGrid answers={copy.answers} />
      <IndigenousModules variant="page" />
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </div>
  )
}
