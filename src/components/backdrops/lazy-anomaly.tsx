'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { ANOMALY_COUNT, ANOMALY_MORPH, ANOMALY_TARGET } from './anomaly-info'

/**
 * The Cosmic Anomaly band: the scene, lazily, and the pen's target nav, now.
 *
 * The scene is Three.js plus a bloom pass, so it lands in a chunk of its own,
 * the same as <LazyPyramids>. The nav is the pen's own markup and is rendered
 * with the page, so it is there before the scene is. The pen's telemetry panel
 * — the object's name and a description of it — is left out on this page.
 *
 * It is a sibling of the scene rather than a child of it, for two reasons.
 * The scene is `aria-hidden` and `pointer-events: none`, which is right for a
 * picture and wrong for buttons. And it has to sit above the hero's copy
 * rather than behind it at `-z-10`.
 *
 * The two talk by events on the hero section: a press sends ANOMALY_MORPH, and
 * the counter changes when the scene answers with ANOMALY_TARGET — which it does
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

  return (
    <div ref={rootRef} className="anomaly-controls" data-pen-controls>
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
