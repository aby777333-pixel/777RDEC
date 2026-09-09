import { CONTACT_EMAIL, EMIL_SHORT } from '@/lib/brand'
import type { PageCopy } from './types'

const ENGAGE_CTA = [
  { label: 'Request a demo', href: '/request-demo', variant: 'primary' as const },
  { label: 'Talk to us', href: '/company/contact', variant: 'ghost' as const },
]

export const engagement: PageCopy = {
  title: 'How We Engage',
  description:
    'How a Raptor engagement is structured, what drives the cost, and what happens at each stage — from technical review to production.',
  eyebrow: 'How we engage',
  heading: 'What this costs depends on what you are running.',
  lead: 'We do not publish a price list, because a licence for a two-person prop desk and a licence for a multi-entity brokerage are not the same product. What we can publish is exactly what drives the number, and what happens at each stage — so you can judge the shape of it before you talk to anyone.',
  answers: {
    what: 'A licensing engagement: the platform modules you need, configured to your instruments and policies, on infrastructure we operate or you do.',
    who: 'Brokers, institutions and professional desks. We are not set up to license to individual retail traders — you would reach Raptor through a brokerage running it.',
    why: 'Publishing a single figure would be misleading in both directions: too high for a small desk, and far too low for a firm needing multi-entity support and its own connectivity.',
    connects: 'Scope is modular. Most firms start with the platform and portal, then add CRM, risk and the intelligence layer as they need them.',
    next: `Send us your requirements and we will come back with a written scope and a number. ${CONTACT_EMAIL}`,
  },
  modules: [
    {
      title: 'Which modules',
      body: 'Terminal, client portal, CRM, back office, risk engine, IB management, API access and the intelligence layer are licensed separately. You are not obliged to take all of it.',
    },
    {
      title: 'How many accounts',
      body: 'Client count and account count are the main scaling factor, because they drive infrastructure, support load and data volume.',
    },
    {
      title: 'Instruments and venues',
      body: 'The number of asset classes and the number of liquidity relationships to connect and monitor affect both setup and ongoing work.',
    },
    {
      title: 'Entities and brands',
      body: 'One brand under one licence is simpler than several brands across several jurisdictions with separate reporting.',
    },
    {
      title: 'Who operates it',
      body: 'We can run the infrastructure, or you can run it in your own environment. That choice changes the commercial shape substantially.',
    },
    {
      title: 'What you migrate',
      body: 'Bringing existing clients, balances and history across is real work, and it is scoped explicitly rather than assumed.',
    },
  ],
  ctaHeading: 'Ask for a written scope',
  ctaBody:
    'Tell us the modules, the client count, the instruments and who operates it. You get a written scope and a number, not a discovery call that leads to another discovery call.',
  ctaActions: ENGAGE_CTA,
}

export const faq: PageCopy = {
  title: 'FAQ',
  description:
    'Straight answers to the questions we are actually asked: what Raptor is, what it is not, how EMIL is bounded, and what it costs.',
  eyebrow: 'FAQ',
  heading: 'The questions we actually get.',
  lead: 'Grouped roughly in the order people ask them. If your question is not here, ask it — and if it turns out to be a common one, it ends up on this page.',
  answers: {
    what: 'Answers to the recurring questions from traders, brokers, institutions and developers evaluating Raptor.',
    who: 'Anyone at the evaluation stage who would rather read than sit through a call.',
    why: 'Most of these get asked on every first call. Publishing them makes the first call more useful.',
    connects: 'Each answer links to the page that documents the thing properly.',
    next: 'Ask us anything not covered here. Genuinely — the gaps are useful to us.',
  },
  modules: [],
  ctaHeading: 'Ask us something harder',
  ctaBody:
    'If your question is not answered here, it is probably a good question. Send it over and we will answer it directly.',
  ctaActions: ENGAGE_CTA,
}

export type FaqItem = { q: string; a: string; href?: string; linkLabel?: string }
export type FaqGroup = { id: string; label: string; tint: number; items: readonly FaqItem[] }

export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    id: 'basics',
    label: 'The basics',
    tint: 0,
    items: [
      {
        q: 'Is 777 Raptor a broker?',
        a: 'No. Raptor is a technology provider. We do not hold client money, provide investment advice, manage portfolios, provide liquidity, or act as counterparty to any trade. Our clients are licensed firms who operate the technology under their own permissions.',
        href: '/legal/technology-provider',
        linkLabel: 'Technology provider notice',
      },
      {
        q: 'Can I trade with you directly?',
        a: 'No. If you are an individual trader you would reach Raptor through a brokerage that licenses it. We license to firms, not to retail clients.',
      },
      {
        q: 'What is actually included?',
        a: 'A trading terminal, a client portal, a CRM, a back office, a risk engine, IB and affiliate management, an API across four transports, and the intelligence layer. Modules are licensed separately.',
        href: '/platform',
        linkLabel: 'See the platform',
      },
      {
        q: 'Do you provide liquidity?',
        a: 'No, and this is worth being precise about: Raptor connects to the venues and providers you have contracted with directly, routes according to rules you set, and measures how each one performs. It does not provide, price or guarantee liquidity.',
        href: '/brokers/liquidity',
        linkLabel: 'Liquidity and connectivity',
      },
    ],
  },
  {
    id: 'emil',
    label: EMIL_SHORT,
    tint: 2,
    items: [
      {
        q: `Is ${EMIL_SHORT} just an expert advisor with better marketing?`,
        a: 'No. An EA runs a fixed rule set until you stop it. EMIL re-scores its own inputs against what actually happened, states conditions as a reading rather than a prediction, logs every event in readable language including its refusals, and is bounded by limits enforced outside itself in the order path.',
        href: '/platform/emil',
        linkLabel: `How ${EMIL_SHORT} works`,
      },
      {
        q: `Does ${EMIL_SHORT} place trades?`,
        a: 'Only when armed, only in the markets you selected, and only with the permissions you granted individually — open, close, modify, hedge. Granting close without open is common: it may reduce risk but never create it.',
      },
      {
        q: 'What stops it doing something I did not intend?',
        a: 'Arming requires reading an authorisation text and typing a confirmation word. Every action it proposes passes the same pre-trade checks as an order you place yourself, and nothing it concludes can widen its own limits. Disarm is one always-visible button, no confirmation, and Escape works too.',
      },
      {
        q: 'Will it make me money?',
        a: 'We will not claim that, and you should be wary of anyone who does. Adaptation reduces the chance of acting on a relationship that has stopped holding. It does not make a system right more often, and it does not remove market risk.',
      },
    ],
  },
  {
    id: 'risk',
    label: 'Risk and capital',
    tint: 4,
    items: [
      {
        q: 'How is capital actually protected?',
        a: 'You can declare a portion of the account untouchable, set a profit floor that ratchets upward as gains are banked and never downward, a drawdown guard measured from the high-water mark, and a daily loss budget. All four are enforced in the order path, outside the intelligence layer.',
        href: '/platform/risk',
        linkLabel: 'Risk engine',
      },
      {
        q: 'What happens when a limit is breached?',
        a: 'It depends what you configured, and the behaviour is explicit rather than implied: stop opening, stop acting entirely while continuing to observe, or disarm automation and hand control back. We default the drawdown guard to disarm rather than liquidate, because forced selling at the worst price is itself a risk event.',
      },
      {
        q: 'Why did my order get rejected?',
        a: 'A refused order always names which check refused it, the value the order would have produced, and the ceiling it would have crossed. We never silently reduce an order to fit.',
        href: '/blog/refusals-should-explain-themselves',
        linkLabel: 'Why refusals explain themselves',
      },
    ],
  },
  {
    id: 'technical',
    label: 'Technical',
    tint: 3,
    items: [
      {
        q: 'Can I build on it?',
        a: 'Yes. REST for state, WebSocket for streams, FIX for institutional flow, webhooks for events. The interface itself uses the same endpoints we publish, which is the only durable way to keep an API current.',
        href: '/technology/api',
        linkLabel: 'API hub',
      },
      {
        q: 'Do I have to abandon my existing vendors?',
        a: 'Generally no. Payments, verification, communications and market data sit behind adapter interfaces, so a provider is a configuration choice. Send us your vendor list and we will tell you plainly what exists and what would be development work.',
        href: '/technology/integrations',
        linkLabel: 'Integrations',
      },
      {
        q: 'Where does it run?',
        a: 'Managed cloud infrastructure we operate, or your own environment. That choice materially changes the commercial shape.',
        href: '/technology/infrastructure',
        linkLabel: 'Infrastructure',
      },
      {
        q: 'Are you ISO 27001 or SOC 2 certified?',
        a: 'We publish no certification badges, and we will not imply one we do not hold. The security page lists the controls that are actually implemented in plain language. Send your due-diligence questionnaire and we answer what we can evidence, and say so where we cannot.',
        href: '/technology/security',
        linkLabel: 'Security controls',
      },
    ],
  },
  {
    id: 'commercial',
    label: 'Commercial',
    tint: 1,
    items: [
      {
        q: 'What does it cost?',
        a: 'There is no published price list, because a two-person prop desk and a multi-entity brokerage are not the same product. What drives the number is documented: modules, account count, instruments and venues, entities and brands, who operates the infrastructure, and what you migrate.',
        href: '/company/engagement',
        linkLabel: 'How we engage',
      },
      {
        q: 'How long does it take to launch?',
        a: 'It depends almost entirely on migration and on your own onboarding and compliance requirements rather than on the platform. We scope it explicitly instead of quoting a number that assumes nothing goes wrong.',
      },
      {
        q: 'Can I see it before committing?',
        a: 'Yes, and we would prefer it. A demo is configured against your instruments, your session hours and your risk policy — including deliberately breaching one of your own limits so you can read the refusal.',
        href: '/request-demo',
        linkLabel: 'Request a demo',
      },
      {
        q: 'Can I speak to an existing client?',
        a: 'Reference conversations are arranged case by case with the client’s agreement. We do not publish client names or figures without written permission, which is also how we would treat yours.',
        href: '/company/proof',
        linkLabel: 'Evidence and references',
      },
    ],
  },
]
