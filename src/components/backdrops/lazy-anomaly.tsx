'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { ANOMALY_COUNT, ANOMALY_INFO, ANOMALY_MORPH, ANOMALY_TARGET } from './anomaly-info'

/**
 * The Cosmic Anomaly band: the scene, lazily, and the pen's controls, now.
 *
 * The scene is Three.js plus a bloom pass, so it lands in a chunk of its own,
 * the same as <LazyPyramids>. The controls are the pen's own markup and are
 * rendered with the page, so they are there before the scene is.
 *
 * They are siblings of the scene rather than children of it, for two reasons.
 * The scene is `aria-hidden` and `pointer-events: none`, which is right for a
 * picture and wrong for buttons. And they have to sit above the hero's copy
 * rather than behind it at `-z-10`.
 *
 * The two talk by events on the hero section: a press sends ANOMALY_MORPH, and
 * the panel changes when the scene answers with ANOMALY_TARGET — which it does
 * only if it accepts, exactly as the pen ignores a press mid-morph.
 */
const AnomalyBackdrop = dynamic(
  () => import('./anomaly-backdrop').then((m) => m.AnomalyBackdrop),
  { ssr: false },
)

export function LazyAnomaly({ className }: { className?: string }) {
  return (
    <>
      <AnomalyBackdrop className={className} />
      <AnomalyControls />
    </>
  )
}

function AnomalyControls() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const section = rootRef.current?.parentElement
    if (!section) return
    const onTarget = (event: Event) => setIndex((event as CustomEvent<number>).detail)
    section.addEventListener(ANOMALY_TARGET, onTarget)
    return () => section.removeEventListener(ANOMALY_TARGET, onTarget)
  }, [])

  const morph = (direction: -1 | 1) => {
    rootRef.current?.parentElement?.dispatchEvent(
      new CustomEvent(ANOMALY_MORPH, { detail: direction }),
    )
  }

  const item = ANOMALY_INFO[index]

  return (
    <div ref={rootRef} className="anomaly-controls" data-pen-controls>
      <div className={expanded ? 'anomaly-info expanded' : 'anomaly-info'}>
        <div className="anomaly-info__header">
          <div>
            <div className="anomaly-info__kicker">Telemetry Link</div>
            <div className="anomaly-info__title">{item.name}</div>
          </div>
          <button
            type="button"
            className="anomaly-info__toggle"
            aria-label="Expand telemetry"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            <span>{expanded ? '−' : '+'}</span>
          </button>
        </div>

        <div className="anomaly-info__body" aria-hidden={!expanded}>
          <p className="anomaly-info__copy">{item.copy}</p>
          <div className="anomaly-info__grid">
            <div className="anomaly-info__row">
              <span>Structure</span>
              <strong>{item.form}</strong>
            </div>
            <div className="anomaly-info__row">
              <span>Emissions</span>
              <strong>{item.palette}</strong>
            </div>
            <div className="anomaly-info__row">
              <span>Dynamics</span>
              <strong>{item.motion}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="anomaly-nav">
        <button
          type="button"
          className="anomaly-nav__btn anomaly-nav__btn--prev"
          aria-label="Previous Anomaly"
          onClick={() => morph(-1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="anomaly-nav__label" aria-live="polite">
          TARGET {index + 1} / {ANOMALY_COUNT}
        </div>
        <button
          type="button"
          className="anomaly-nav__btn anomaly-nav__btn--next"
          aria-label="Next Anomaly"
          onClick={() => morph(1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M9 19l7-7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
