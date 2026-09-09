'use client'

import { useEffect, useMemo, useState } from 'react'
import { Panel } from '@/components/ui/panel'
import { Chip } from '@/components/ui/chip'
import { SESSIONS, activityFor, openSessionsAt, type SessionName } from '@/lib/sessions'
import type { SessionImage } from '@/lib/brand-assets'
import { cn } from '@/lib/utils'

const TINT: Record<SessionName, string> = { Asia: 'tint-4', London: 'tint-1', NewYork: 'tint-2' }

/**
 * The session globe.
 *
 * Not WebGL: a rotating meridian field with the three session arcs projected
 * onto it, which reads as a globe, costs nothing, and degrades honestly under
 * reduced motion. The UTC clock drives which sessions are lit, so it is
 * genuinely live rather than decorative.
 *
 * `images` is resolved on the server, so a missing session image is never
 * requested and the panel simply keeps its diagram treatment.
 */
export function SessionGlobe({
  images = [],
  className,
}: {
  images?: readonly SessionImage[]
  className?: string
}) {
  const [now, setNow] = useState<Date | null>(null)

  // Rendered after mount so the server and client never disagree on the clock.
  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const open = useMemo(() => (now ? openSessionsAt(now) : []), [now])
  const primary = open[open.length - 1]
  const image = primary ? images.find((i) => i.session === primary) : undefined
  const utc = now
    ? `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`
    : '—'

  return (
    <div className={cn('grid gap-4 lg:grid-cols-[1.1fr_1fr] lg:items-stretch', className)}>
      <Panel tone="raised" size="panel" className="relative overflow-hidden">
        {/* Optional session photograph, treated like the hero images. */}
        {image ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-[0.28] saturate-[0.45] dark:opacity-[0.34] dark:brightness-[0.7]"
            style={{ backgroundImage: `url(${image.src})` }}
            aria-hidden
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 70% at 50% 45%, var(--bg-2) 12%, transparent 78%)',
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-eyebrow uppercase text-steel-500">Market sessions</span>
            <span className="font-mono text-[0.75rem] text-steel-300" data-numeric>
              {utc}
            </span>
          </div>

          <Globe open={open} />

          <div className="flex flex-wrap gap-2" aria-live="polite">
            {open.length === 0 ? (
              <Chip dot>{now ? 'All primary sessions closed' : 'Reading clock…'}</Chip>
            ) : (
              open.map((session) => (
                <Chip key={session} tone="up" dot>
                  {SESSIONS.find((s) => s.name === session)?.label} open
                </Chip>
              ))
            )}
          </div>

          {image ? (
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-steel-500">
              {SESSIONS.find((s) => s.name === image.session)?.label} session
            </p>
          ) : null}
        </div>
      </Panel>

      <div className="flex flex-col gap-4">
        {SESSIONS.map((session) => {
          const isOpen = open.includes(session.name)
          const activity = now ? activityFor(session.name, now) : 0
          return (
            <Panel
              key={session.name}
              className={cn('flex flex-col gap-3 p-5', TINT[session.name])}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="tint-ink font-display text-[1.0625rem] uppercase tracking-tight">
                  {session.label}
                </span>
                <span className="font-mono text-[0.6875rem] text-steel-500" data-numeric>
                  {String(session.startUtc).padStart(2, '0')}:00–
                  {String(session.endUtc).padStart(2, '0')}:00 UTC
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-3">
                  <span
                    className={cn(
                      'tint-dot block h-full rounded-full transition-all duration-700 ease-raptor',
                      !isOpen && 'opacity-40',
                    )}
                    style={{ width: `${Math.round(activity * 100)}%` }}
                  />
                </span>
                <span
                  className={cn(
                    'w-14 shrink-0 text-right font-mono text-[0.625rem] uppercase tracking-[0.12em]',
                    isOpen ? 'text-up' : 'text-steel-500',
                  )}
                >
                  {isOpen ? 'Open' : 'Closed'}
                </span>
              </div>

              <p className="text-[0.8125rem] leading-relaxed text-steel-500">{session.character}</p>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}

/**
 * The globe itself: a circle of meridians and parallels with an arc per
 * session, lit when that session is open. Rotation is CSS and stops under
 * prefers-reduced-motion.
 */
function Globe({ open }: { open: readonly SessionName[] }) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[19rem]">
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label="Globe showing which trading sessions are currently open">
        <defs>
          <clipPath id="globe-clip">
            <circle cx="100" cy="100" r="78" />
          </clipPath>
        </defs>

        <circle cx="100" cy="100" r="78" fill="var(--bg-1)" stroke="var(--line-2)" strokeWidth="1" />

        <g clipPath="url(#globe-clip)" stroke="var(--line-2)" fill="none" strokeWidth="0.7">
          {/* Parallels */}
          {[-52, -26, 0, 26, 52].map((offset) => (
            <ellipse key={offset} cx="100" cy={100 + offset} rx="78" ry={offset === 0 ? 78 : 70 - Math.abs(offset) * 0.55} />
          ))}
          {/* Meridians, rotating slowly to read as a turning globe */}
          <g className="origin-center motion-safe:animate-[spin_64s_linear_infinite]">
            {[0, 26, 52, 78].map((rx) => (
              <ellipse key={rx} cx="100" cy="100" rx={rx} ry="78" />
            ))}
          </g>
        </g>

        {/* Session arcs. Each spans its share of the 24-hour circle. */}
        {SESSIONS.map((session, index) => {
          const isOpen = open.includes(session.name)
          const r = 88 - index * 7
          const start = (session.startUtc / 24) * 360 - 90
          const end = (session.endUtc / 24) * 360 - 90
          const large = end - start > 180 ? 1 : 0
          const rad = (deg: number) => (deg * Math.PI) / 180
          const x1 = 100 + r * Math.cos(rad(start))
          const y1 = 100 + r * Math.sin(rad(start))
          const x2 = 100 + r * Math.cos(rad(end))
          const y2 = 100 + r * Math.sin(rad(end))
          return (
            <path
              key={session.name}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
              fill="none"
              strokeWidth={isOpen ? 4 : 2}
              strokeLinecap="round"
              className={cn(TINT[session.name], 'transition-all duration-700')}
              stroke="var(--tint-ink)"
              opacity={isOpen ? 0.95 : 0.28}
            />
          )
        })}
      </svg>
    </div>
  )
}
