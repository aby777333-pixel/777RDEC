import { EMIL_SHORT } from '@/lib/brand'
import type { PageCopy } from './types'

export const blogIndex: PageCopy = {
  title: 'Blog',
  description:
    'How Raptor is built and how we think about markets: the intelligence layer, risk controls, brokerage operations, engineering and market structure.',
  eyebrow: 'Blog',
  heading: 'How this is built.',
  lead: `Method rather than market calls. How ${EMIL_SHORT} adapts and where it is stopped, how capital protection is actually enforced, what breaks when a brokerage runs on three vendors, and why the session matters more than the hour.`,
  answers: {
    what: 'Written notes on the intelligence layer, risk controls, brokerage operations, platform engineering and market structure.',
    who: 'Traders, risk managers, brokerage operators and engineers who want the reasoning rather than the brochure.',
    why: 'A method you cannot inspect is a method you cannot rely on. Everything here is written to be argued with.',
    connects: 'Where a post describes something the platform does, it links to the page that documents it.',
    next: 'Read what is relevant, then tell us where we are wrong.',
  },
  modules: [],
  ctaHeading: 'Disagree with us',
  ctaBody:
    'If a post is wrong, we would rather hear it from you than leave it up for another year. Corrections are welcome and get published.',
  ctaActions: [
    { label: 'Contact us', href: '/company/contact', variant: 'primary' },
    { label: `How ${EMIL_SHORT} works`, href: '/platform/emil', variant: 'ghost' },
  ],
}
