'use client'

import { useState } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { ButtonLink } from '@/components/ui/button'
import { Section, SectionHeader } from '@/components/ui/section'
import { EMIL_SHORT } from '@/lib/brand'
import { cn } from '@/lib/utils'

export const AUDIENCE_COOKIE = 'raptor-audience'

type Audience = {
  id: string
  tab: string
  heading: string
  points: readonly string[]
  cta: { label: string; href: string }
}

const AUDIENCES: readonly Audience[] = [
  {
    id: 'trader',
    tab: 'Traders',
    heading: 'A terminal you stop noticing.',
    points: [
      'Charts, depth, tickets and positions in one workspace that restores itself on login.',
      'Indicators computed locally, so redraws do not wait on a round trip.',
      'A journal built from your fills rather than your memory.',
      `${EMIL_SHORT} explaining conditions in plain language, and acting only if you authorise it.`,
    ],
    cta: { label: 'Open the sandbox', href: '/experience' },
  },
  {
    id: 'broker',
    tab: 'Brokers',
    heading: 'Run the brokerage, not the integration project.',
    points: [
      'Trading platform, CRM, client portal and back office sharing one client record.',
      'Your brand end to end: domains, emails, statements, mobile.',
      'IB and affiliate structures partners can audit themselves.',
      'Least-privilege admin roles you can explain to an auditor.',
    ],
    cta: { label: 'Broker solutions', href: '/brokers' },
  },
  {
    id: 'institution',
    tab: 'Financial Institutions',
    heading: 'Infrastructure that survives due diligence.',
    points: [
      'One data model across execution, relationship management and reporting.',
      'FIX, REST, WebSocket and webhooks over the same primitives the platform uses.',
      'Security controls described in plain language, without certification claims we do not hold.',
      'Documented recovery objectives, exercised rather than assumed.',
    ],
    cta: { label: 'Technology', href: '/technology' },
  },
  {
    id: 'prop',
    tab: 'Prop & Professional Desks',
    heading: 'Limits that hold when it matters.',
    points: [
      'Pre-trade validation in the order path for every order, human or automated.',
      'Per-trader, per-desk and aggregate exposure limits with visible kill switches.',
      'Drawdown and daily loss guards with defined actions on breach.',
      'A refused order that tells the trader exactly which limit it breached.',
    ],
    cta: { label: 'Risk engine', href: '/platform/risk' },
  },
]

/**
 * Remembers the visitor's audience so /request-demo can default its
 * "I am a…" field to something sensible.
 */
export function AudienceSwitcher() {
  const [value, setValue] = useState<string>(AUDIENCES[0]?.id ?? 'trader')

  function select(next: string) {
    setValue(next)
    // Non-essential personalisation only: no identifiers, 90 days, same-site.
    document.cookie = `${AUDIENCE_COOKIE}=${next}; path=/; max-age=7776000; samesite=lax`
  }

  return (
    <Section className="border-b border-line-1">
      <SectionHeader
        eyebrow="Who it is for"
        title="Same ecosystem. Different problem."
        lead="Raptor is one system, but the reason you would use it depends entirely on where you sit."
      />

      <Tabs.Root value={value} onValueChange={select} className="mt-10">
        <Tabs.List
          aria-label="Choose your role"
          className="scroll-steel flex gap-1 overflow-x-auto border-b border-line-1 pb-px"
        >
          {AUDIENCES.map((audience) => (
            <Tabs.Trigger
              key={audience.id}
              value={audience.id}
              className={cn(
                'shrink-0 border-b-2 px-4 py-3 text-[0.9375rem] transition-colors duration-200',
                'border-transparent text-steel-500 hover:text-steel-300',
                'data-[state=active]:border-signal data-[state=active]:text-steel-100',
              )}
            >
              {audience.tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {AUDIENCES.map((audience) => (
          <Tabs.Content
            key={audience.id}
            value={audience.id}
            className="pt-10 focus-visible:outline-none"
          >
            <div className="grid gap-10 lg:grid-cols-[22rem_1fr]">
              <div className="flex flex-col gap-5">
                <h3 className="font-display text-[1.75rem] uppercase leading-tight tracking-tight text-steel-100">
                  {audience.heading}
                </h3>
                <ButtonLink href={audience.cta.href} variant="primary" className="self-start">
                  {audience.cta.label}
                </ButtonLink>
              </div>
              <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {audience.points.map((point, index) => (
                  <li key={point} className="flex flex-col gap-2 border-t border-line-2 pt-4">
                    <span className="font-mono text-[0.6875rem] text-steel-500" data-numeric>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[0.9375rem] leading-relaxed text-steel-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Section>
  )
}
