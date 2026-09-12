'use client'

import { useState } from 'react'
import { EMIL_SHORT } from '@/lib/brand'
import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

/**
 * The operating modes, as the application actually defines them.
 *
 * These are not a simplification written for the website. The activation
 * screen in the Control Cockpit lists nine modes, each carrying a badge saying
 * whether it can reach the market at all, and the sentence under each label
 * here is the app's own. Five can act; four cannot, and one of those four —
 * Confirmation — can prepare a complete trade and still not send it, which is
 * the distinction the whole screen exists to make.
 *
 * The permitted and refused columns are derived from each mode's own sentence
 * and nothing else. Where the app names both halves — Assisted lists exactly
 * what it manages, Management Only rules out new directional trades — the
 * split is the app's; nothing has been added to round a list out.
 */

type Mode = {
  id: string
  label: string
  /** Whether this mode can reach the market. The app's own badge. */
  acts: boolean
  detail: string
  permitted: readonly string[]
  refused: readonly string[]
}

const MODES: readonly Mode[] = [
  {
    id: 'observation',
    label: 'Observation',
    acts: false,
    detail: 'Analyse and learn. No trading recommendation required. No execution.',
    permitted: ['Reading the market and the book', 'Learning from what happens next'],
    refused: ['Producing a recommendation', 'Placing, modifying or closing anything'],
  },
  {
    id: 'advisory',
    label: 'Advisory',
    acts: false,
    detail:
      'Provides direction, entry, stop, targets, size, risk, confidence and reasoning. No execution.',
    permitted: [
      'Direction, entry, stop and targets',
      'Size, risk and a confidence figure',
      'The reasoning behind all of it',
    ],
    refused: ['Placing, modifying or closing anything'],
  },
  {
    id: 'confirmation',
    label: 'Confirmation',
    acts: false,
    detail: `${EMIL_SHORT} prepares a complete trade. The trader explicitly approves each one.`,
    permitted: ['Preparing a complete trade, ready to send'],
    refused: ['Sending one without an explicit approval for that trade'],
  },
  {
    id: 'assisted',
    label: 'Assisted',
    acts: true,
    detail:
      'The trader enters. EMIL manages what it was authorised to: stop, take profit, break-even, trailing, partial exit, risk alerts, emergency exit.',
    permitted: [
      'Stop and take profit',
      'Break-even and trailing',
      'Partial exit',
      'Risk alerts and emergency exit',
    ],
    refused: ['Opening the position — the trader enters'],
  },
  {
    id: 'semi',
    label: 'Semi-Autonomous',
    acts: true,
    detail: `${EMIL_SHORT} can trade only within approved strategies, assets, sessions, risk and lot limits.`,
    permitted: ['Trading inside every one of those five limits'],
    refused: [
      'An unapproved strategy',
      'An unselected asset',
      'A session outside the allowed ones',
      'Anything past the risk or lot limit',
    ],
  },
  {
    id: 'autonomous',
    label: 'Autonomous',
    acts: true,
    detail: `${EMIL_SHORT} may scan, analyse, enter, manage, hedge and exit — but only inside hard permissions.`,
    permitted: ['Scanning and analysing', 'Entering and managing', 'Hedging and exiting'],
    refused: ['Stepping outside the hard permissions'],
  },
  {
    id: 'management',
    label: 'Management Only',
    acts: true,
    detail: `No new directional trades. ${EMIL_SHORT} may protect, reduce, manage, hedge and close.`,
    permitted: ['Protecting and reducing', 'Managing and hedging', 'Closing'],
    refused: ['Opening a new directional trade'],
  },
  {
    id: 'capital',
    label: 'Capital Protection',
    acts: true,
    detail: 'Only actions that reduce account risk are permitted.',
    permitted: ['Any action that reduces account risk'],
    refused: ['Any action that adds it'],
  },
  {
    id: 'emergency',
    label: 'Emergency',
    acts: false,
    detail: 'Stop new exposure immediately.',
    permitted: ['Stopping new exposure at once'],
    refused: ['Adding exposure of any kind'],
  },
]

export function EmilModes() {
  const [activeId, setActiveId] = useState('semi')
  const active = MODES.find((mode) => mode.id === activeId) ?? MODES[0]
  if (!active) return null

  return (
    <div className="flex flex-col gap-6">
      {/* All nine at once, the way the activation screen shows them: the point
          is not to pick one here, it is to see how narrow most of them are. */}
      <div
        role="radiogroup"
        aria-label={`${EMIL_SHORT} operating mode`}
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MODES.map((mode) => {
          const selected = mode.id === activeId
          return (
            <button
              key={mode.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setActiveId(mode.id)}
              className={cn(
                'flex flex-col gap-2 rounded-ui border p-4 text-left transition-colors duration-200 ease-raptor',
                selected
                  ? 'border-signal bg-bg-2'
                  : 'border-line-2 bg-bg-1 hover:border-steel-700 hover:bg-bg-2',
              )}
            >
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[1rem] uppercase tracking-tight text-steel-100">
                  {mode.label}
                </span>
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.14em]',
                    mode.acts
                      ? 'border-armed/40 text-armed'
                      : 'border-line-2 text-steel-500',
                  )}
                >
                  {mode.acts ? 'Can act' : 'No execution'}
                </span>
              </span>
              <span className="text-[0.875rem] leading-relaxed text-steel-500">{mode.detail}</span>
            </button>
          )
        })}
      </div>

      <Panel tone="raised" size="panel" className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line-1 px-6 py-4">
          <span className="relative flex h-2.5 w-2.5 items-center justify-center" aria-hidden>
            {active.acts ? (
              <span className="absolute inset-0 rounded-full bg-armed opacity-30 motion-safe:animate-breathe" />
            ) : null}
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                active.acts ? 'bg-armed' : 'bg-steel-700',
              )}
            />
          </span>
          <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
            {active.label}
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-500">
            {active.acts ? 'Can reach the market' : 'Cannot reach the market'}
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
      <p className={cn('text-eyebrow uppercase', tone === 'up' ? 'text-up' : 'text-down')}>
        {label}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] text-steel-300">
            <span
              aria-hidden
              className={cn(
                'mt-[0.5rem] h-1 w-1 shrink-0 rounded-full',
                tone === 'up' ? 'bg-up' : 'bg-down',
              )}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
