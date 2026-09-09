'use client'

import { useState } from 'react'
import { EMIL_SHORT } from '@/lib/brand'
import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

type Mode = {
  id: string
  label: string
  status: string
  tone: 'steel' | 'signal' | 'armed'
  detail: string
  permitted: readonly string[]
  refused: readonly string[]
}

const MODES: readonly Mode[] = [
  {
    id: 'off',
    label: `${EMIL_SHORT} Off`,
    status: 'Inactive',
    tone: 'steel',
    detail: `${EMIL_SHORT} is not running. The terminal behaves as a terminal: nothing observes, nothing suggests, nothing acts.`,
    permitted: ['Nothing'],
    refused: ['Observation', 'Analysis', 'Suggestions', 'Any order activity'],
  },
  {
    id: 'assist',
    label: `${EMIL_SHORT} Assist`,
    status: 'Observing and proposing',
    tone: 'signal',
    detail: `${EMIL_SHORT} observes the market and your book and states what it sees. It may propose an action, which you accept or reject. Nothing reaches the market on its own.`,
    permitted: ['Observation', 'Condition assessment', 'Exposure analysis', 'Proposals for review'],
    refused: ['Placing orders', 'Modifying orders', 'Closing positions'],
  },
  {
    id: 'armed',
    label: `${EMIL_SHORT} Armed`,
    status: 'Acting inside mandate',
    tone: 'armed',
    detail: `${EMIL_SHORT} may act, strictly inside the written mandate you confirmed, and only with the trading permissions you granted. Disarming is instant and needs no confirmation.`,
    permitted: [
      'Everything Assist permits',
      'Actions inside the mandate',
      'Only the granted trading permissions',
      'Only the selected markets',
    ],
    refused: [
      'Exceeding the exposure limit',
      'Breaching the drawdown guard',
      'Trading unselected instruments',
      'Acting at all once disarmed',
    ],
  },
]

/** Segmented control that changes the illustration, per §6. */
export function EmilModes() {
  const [activeId, setActiveId] = useState(MODES[1]?.id ?? 'assist')
  const active = MODES.find((mode) => mode.id === activeId) ?? MODES[0]
  if (!active) return null

  return (
    <div className="flex flex-col gap-6">
      <div
        role="radiogroup"
        aria-label={`${EMIL_SHORT} operating mode`}
        className="inline-flex flex-wrap gap-1 self-start rounded-ui border border-line-2 bg-bg-1 p-1"
      >
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={mode.id === activeId}
            onClick={() => setActiveId(mode.id)}
            className={cn(
              'rounded-[4px] px-4 py-2 text-[0.875rem] transition-colors duration-200',
              mode.id === activeId
                ? 'bg-bg-3 text-steel-100'
                : 'text-steel-500 hover:text-steel-300',
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <Panel tone="raised" size="panel" className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line-1 px-6 py-4">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center" aria-hidden>
            {active.tone !== 'steel' ? (
              <span
                className={cn(
                  'absolute inset-0 rounded-full opacity-30',
                  active.tone === 'armed' ? 'bg-armed motion-safe:animate-breathe' : 'bg-signal motion-safe:animate-pulse-signal',
                )}
              />
            ) : null}
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                active.tone === 'armed' ? 'bg-armed' : active.tone === 'signal' ? 'bg-signal' : 'bg-steel-700',
              )}
            />
          </span>
          <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
            {active.label}
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-500">
            {active.status}
          </span>
        </div>

        <p className="px-6 py-5 text-body text-steel-300">{active.detail}</p>

        <div className="grid gap-px border-t border-line-1 bg-line-1 sm:grid-cols-2">
          <List label="Permitted" tone="up" items={active.permitted} />
          <List label="Not permitted" tone="down" items={active.refused} />
        </div>
      </Panel>
    </div>
  )
}

function List({
  label,
  tone,
  items,
}: {
  label: string
  tone: 'up' | 'down'
  items: readonly string[]
}) {
  return (
    <div className="bg-bg-2 px-6 py-5">
      <p className={cn('text-eyebrow uppercase', tone === 'up' ? 'text-up' : 'text-down')}>{label}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] text-steel-300">
            <span
              aria-hidden
              className={cn('mt-[0.5rem] h-1 w-1 shrink-0 rounded-full', tone === 'up' ? 'bg-up' : 'bg-down')}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
