'use client'

import { cn } from '@/lib/utils'

export type EmilLogEntry = {
  id: number
  at: string
  tone: 'observe' | 'protect' | 'act' | 'refuse'
  text: string
}

const TONE_STYLES: Record<EmilLogEntry['tone'], string> = {
  observe: 'text-steel-500',
  protect: 'text-warn',
  act: 'text-signal',
  refuse: 'text-down',
}

const TONE_LABELS: Record<EmilLogEntry['tone'], string> = {
  observe: 'OBSERVE',
  protect: 'PROTECT',
  act: 'ACT',
  refuse: 'REFUSE',
}

export function EmilLog({ entries, className }: { entries: readonly EmilLogEntry[]; className?: string }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between border-b border-line-1 px-4 py-2.5">
        <span className="text-eyebrow uppercase text-steel-500">Intelligence log</span>
        <span className="font-mono text-[0.625rem] text-steel-500" data-numeric>
          {entries.length} events
        </span>
      </div>
      <ul
        aria-live="polite"
        aria-label="EMIL intelligence log"
        className="scroll-steel flex max-h-72 flex-col overflow-y-auto"
      >
        {entries.length === 0 ? (
          <li className="px-4 py-6 text-[0.8125rem] text-steel-500">
            No events yet. Configure a mandate and arm to see how EMIL narrates what it is doing.
          </li>
        ) : null}
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex items-start gap-3 border-b border-line-1 px-4 py-2.5 font-mono text-[0.75rem] motion-safe:animate-ticker-in"
          >
            <span className="shrink-0 text-steel-700" data-numeric>
              {entry.at}
            </span>
            <span className={cn('w-16 shrink-0 text-[0.625rem] tracking-[0.12em]', TONE_STYLES[entry.tone])}>
              {TONE_LABELS[entry.tone]}
            </span>
            <span className="text-steel-300">{entry.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
