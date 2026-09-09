import { CONTACT_EMAIL } from '@/lib/brand'
import type { PageCopy } from './types'

export const proof: PageCopy = {
  title: 'Evidence & References',
  description:
    'What evidence 777 Raptor can provide during due diligence, and how reference conversations with existing clients are arranged.',
  eyebrow: 'Company · Evidence',
  heading: 'We do not publish client names.',
  lead: 'Most technology vendors in this industry put logos on a page. We do not, for a reason that should reassure rather than worry you: a firm running its brokerage on our stack usually does not want that public, and we treat their confidentiality the way we would treat yours. Here is what we can give you instead, and how to get it.',
  answers: {
    what: 'A description of the evidence available during evaluation: reference conversations, architecture review, security questionnaires, and a demo configured against your own requirements.',
    who: 'Firms in procurement or due diligence who need more than marketing copy.',
    why: 'Anonymised metrics are unverifiable, and named logos are a confidentiality problem. A conversation with an actual client is worth more than either.',
    connects: 'Every item below is something a named person will actually do, not a document we send.',
    next: `Tell us what evidence your process requires and we will say plainly what we can and cannot provide. ${CONTACT_EMAIL}`,
  },
  modules: [
    {
      title: 'Reference conversations',
      body: 'Arranged case by case with the client’s written agreement. A real call with a firm operating the platform, not a testimonial we wrote.',
    },
    {
      title: 'Architecture review',
      body: 'Your engineers, our engineers, the data model and the failure modes. Bring the awkward questions — what happens when a feed goes stale or a provider rejects.',
    },
    {
      title: 'Security due diligence',
      body: 'Send your questionnaire. We answer what we can evidence and state clearly where we cannot, rather than returning a document of green ticks.',
    },
    {
      title: 'Configured demo',
      body: 'Your instruments, your session hours, your risk limits — including breaching one deliberately so you can read the refusal it produces.',
    },
    {
      title: 'Sandbox access',
      body: 'Scoped API keys against simulated data, so your developers can judge the integration before commercials are discussed.',
    },
    {
      title: 'Written scope',
      body: 'A scope document and a number, not a sequence of discovery calls.',
    },
  ],
  ctaHeading: 'Tell us what your process needs',
  ctaBody:
    'Procurement processes differ. Tell us what yours requires as evidence and we will tell you straight away whether we can provide it.',
  ctaActions: [
    { label: 'Contact us', href: '/company/contact', variant: 'primary' },
    { label: 'Request a demo', href: '/request-demo', variant: 'ghost' },
  ],
}

/**
 * Published case studies.
 *
 * Deliberately EMPTY. Nothing goes in here without the client's written
 * permission and figures they have confirmed — an invented or unverifiable
 * case study is worse than none, and would be the one thing on this site a
 * reader could catch us out on.
 *
 * To add one, append an entry; the page renders them above the evidence list
 * and hides the "none published" note automatically.
 */
export type CaseStudy = {
  slug: string
  client: string
  sector: string
  challenge: string
  approach: string
  outcome: string
  /** Written sign-off on file. Nothing renders without this set to true. */
  approved: boolean
}

export const CASE_STUDIES: readonly CaseStudy[] = []
