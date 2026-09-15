'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Pause, Play, ScanSearch, SkipBack, SkipForward } from 'lucide-react'
import { galleryFull, galleryThumb, type GalleryShot } from '@/lib/emil-gallery'
import { cn } from '@/lib/utils'

/**
 * The screenshot player behind both galleries — EMIL and EMIL Trade. Each
 * capture is shown with its heading and explanation underneath, so the player
 * reads as a guided tour rather than a slideshow.
 *
 * It advances on its own — one capture every ten seconds by default, with a
 * bar showing how long the current one has left — and stops the moment someone
 * wants to look: a click on the picture pauses it for inspection, and a second
 * click carries on. Everything else is there to get around: previous and next,
 * first and last, a strip of every capture to jump to, the speed, the capture
 * at its actual pixel size for reading the small print (drag to pan), and full
 * screen. The keys work while the gallery has focus, so the arrow keys and the
 * space bar still scroll the page everywhere else.
 *
 * It also stops when nobody can see it: in a hidden tab the clock does not
 * run, so a visitor who comes back finds the capture they left.
 */

const SPEEDS = [5, 10, 15, 30] as const
const TICK_MS = 100

export function ScreenGallery({
  shots,
  label,
}: {
  shots: readonly GalleryShot[]
  /** Names the region for assistive technology, e.g. "EMIL screenshots". */
  label: string
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [seconds, setSeconds] = useState<(typeof SPEEDS)[number]>(10)
  const [elapsed, setElapsed] = useState(0)
  const [actualSize, setActualSize] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null)

  const shot = shots[index]

  const go = useCallback(
    (next: number) => {
      setIndex(((next % shots.length) + shots.length) % shots.length)
      setElapsed(0)
    },
    [shots.length],
  )

  // ---- the auto scroller ----
  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      setElapsed((value) => value + TICK_MS)
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  useEffect(() => {
    if (playing && elapsed >= seconds * 1000) go(index + 1)
  }, [elapsed, playing, seconds, index, go])

  // Keep the current thumbnail in view — by scrolling the strip itself, so the
  // page never jumps to the gallery on its own.
  useEffect(() => {
    const strip = stripRef.current
    const thumb = strip?.children[index] as HTMLElement | undefined
    if (!strip || !thumb) return
    const target = thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2
    strip.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [index])

  // Start each capture at its top-left when reading at actual size.
  useEffect(() => {
    stageRef.current?.scrollTo(0, 0)
  }, [index, actualSize])

  // Preload the next capture so the advance is not a blank frame.
  useEffect(() => {
    const next = shots[(index + 1) % shots.length]
    const img = new window.Image()
    img.src = galleryFull(next)
  }, [index, shots])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const togglePlay = useCallback(() => setPlaying((value) => !value), [])

  const toggleActualSize = useCallback(() => {
    setActualSize((value) => {
      if (!value) setPlaying(false)
      return !value
    })
  }, [])

  const toggleFullscreen = useCallback(() => {
    const root = rootRef.current
    if (!root) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void root.requestFullscreen?.()
  }, [])

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.target instanceof HTMLSelectElement) return
    switch (event.key) {
      case 'ArrowLeft':
        go(index - 1)
        break
      case 'ArrowRight':
        go(index + 1)
        break
      case ' ':
        if (event.target instanceof HTMLButtonElement) return
        togglePlay()
        break
      case 'Home':
        go(0)
        break
      case 'End':
        go(shots.length - 1)
        break
      case 'z':
      case 'Z':
        toggleActualSize()
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        break
      case 'Escape':
        if (actualSize) setActualSize(false)
        return
      default:
        return
    }
    event.preventDefault()
  }

  // ---- the stage: a click pauses, a drag (at actual size) pans ----
  const onPointerDown = (event: React.PointerEvent) => {
    const stage = stageRef.current
    if (!stage) return
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      left: stage.scrollLeft,
      top: stage.scrollTop,
      moved: false,
    }
  }
  const onPointerMove = (event: React.PointerEvent) => {
    const stage = stageRef.current
    const start = drag.current
    if (!stage || !start || !actualSize) return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) + Math.abs(dy) > 4) start.moved = true
    stage.scrollLeft = start.left - dx
    stage.scrollTop = start.top - dy
  }
  const onPointerUp = () => {
    if (drag.current && !drag.current.moved) togglePlay()
    drag.current = null
  }

  const progress = Math.min(100, (elapsed / (seconds * 1000)) * 100)
  const button =
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line-2 bg-bg-2 px-2.5 text-[0.8125rem] text-steel-100 transition-colors hover:border-signal/60 hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal'

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="region"
      aria-roledescription="gallery"
      aria-label={label}
      className={cn(
        'flex flex-col gap-4 rounded-panel border border-line-2 bg-bg-1 p-3 shadow-panel outline-none focus-visible:ring-2 focus-visible:ring-signal md:p-4',
        fullscreen && 'h-screen rounded-none border-0 bg-bg-0',
      )}
    >
      {/* ---- toolbar ---- */}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={button} onClick={() => go(0)} aria-label="First screenshot" title="First (Home)">
          <SkipBack className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" className={button} onClick={() => go(index - 1)} aria-label="Previous screenshot" title="Previous (←)">
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <span className="min-w-[4.5rem] text-center font-mono text-[0.8125rem] text-steel-300" data-numeric aria-live="polite">
          {index + 1} / {shots.length}
        </span>
        <button type="button" className={button} onClick={() => go(index + 1)} aria-label="Next screenshot" title="Next (→)">
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" className={button} onClick={() => go(shots.length - 1)} aria-label="Last screenshot" title="Last (End)">
          <SkipForward className="h-4 w-4" aria-hidden />
        </button>

        <span className="mx-1 h-6 w-px bg-line-2" aria-hidden />

        <button
          type="button"
          className={cn(button, 'min-w-[5.5rem]', playing && 'border-signal/50 text-signal')}
          onClick={togglePlay}
          aria-pressed={playing}
          title="Play / pause (Space)"
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <label className="flex items-center gap-2 text-[0.8125rem] text-steel-500">
          Every
          <select
            className="h-9 rounded-md border border-line-2 bg-bg-2 px-2 text-steel-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
            value={seconds}
            onChange={(event) => {
              setSeconds(Number(event.target.value) as (typeof SPEEDS)[number])
              setElapsed(0)
            }}
          >
            {SPEEDS.map((value) => (
              <option key={value} value={value}>
                {value} s
              </option>
            ))}
          </select>
        </label>

        <span className="flex-1" />

        <button
          type="button"
          className={cn(button, actualSize && 'border-signal/50 text-signal')}
          onClick={toggleActualSize}
          aria-pressed={actualSize}
          title="Actual size — drag to pan (Z)"
        >
          <ScanSearch className="h-4 w-4" aria-hidden />
          {actualSize ? 'Fit' : 'Actual size'}
        </button>
        <button type="button" className={button} onClick={toggleFullscreen} title="Full screen (F)">
          {fullscreen ? <Minimize2 className="h-4 w-4" aria-hidden /> : <Maximize2 className="h-4 w-4" aria-hidden />}
          <span className="sr-only">{fullscreen ? 'Exit full screen' : 'Full screen'}</span>
        </button>
      </div>

      {/* ---- stage ----
          Fitted, a capture is shown at the full width of the stage — as large
          as the column allows — and a capture taller than the stage scrolls
          inside it with its own scrollbar, so reading the bottom of a tall
          screen never means scrolling the page. At actual size the stage is a
          fixed window onto the capture, panned by dragging. */}
      <div
        className={cn(
          'relative overflow-hidden rounded-md border border-line-1 bg-black',
          fullscreen ? 'min-h-0 flex-1' : actualSize ? 'h-[min(78vh,56rem)]' : undefined,
        )}
      >
        <div
          ref={stageRef}
          className={cn(
            'scroll-steel select-none',
            fullscreen || actualSize ? 'absolute inset-0' : 'max-h-[min(78vh,56rem)]',
            actualSize
              ? 'cursor-grab overflow-auto active:cursor-grabbing'
              : 'cursor-pointer overflow-y-auto overflow-x-hidden',
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (drag.current = null)}
          title={playing ? 'Click to pause for inspection' : 'Click to resume'}
        >
          {actualSize ? (
            <Image
              key={`${shot.slug}-actual`}
              src={galleryFull(shot)}
              alt={shot.title}
              width={shot.width}
              height={shot.height}
              unoptimized
              draggable={false}
              className="max-w-none"
              style={{ width: shot.width, height: shot.height }}
            />
          ) : (
            <Image
              key={shot.slug}
              src={galleryFull(shot)}
              alt={shot.title}
              width={shot.width}
              height={shot.height}
              unoptimized
              priority={index === 0}
              draggable={false}
              className="block h-auto w-full"
            />
          )}
        </div>

        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full border px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] backdrop-blur',
            playing ? 'border-signal/40 bg-black/70 text-signal' : 'border-amber-400/50 bg-black/75 text-amber-300',
          )}
          aria-hidden
        >
          {playing ? `Playing · ${seconds} s each` : 'Paused for inspection'}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10" aria-hidden>
          <div className="h-full bg-signal transition-[width] duration-100 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ---- caption: which screen, what it shows, and why ---- */}
      <div className="flex flex-col gap-2 px-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="text-eyebrow uppercase text-signal">
            {String(index + 1).padStart(2, '0')} · {shot.title}
          </p>
          <p className="text-[0.8125rem] text-steel-500">
            Captured {shot.date ? `${shot.date}, ` : ''}
            {shot.time}
            {shot.redacted ? ' · private details blacked out' : ''}
          </p>
        </div>
        {/* h2: the galleries put the player straight under the page's h1. */}
        <h2 className="font-display text-[1.375rem] leading-snug text-steel-100 md:text-[1.625rem]">
          {shot.heading}
        </h2>
        <p className="max-w-4xl text-[0.9375rem] leading-relaxed text-steel-300">{shot.body}</p>
      </div>

      {/* ---- strip ---- */}
      <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1" role="list">
        {shots.map((item, i) => (
          <button
            key={item.slug}
            type="button"
            role="listitem"
            onClick={() => go(i)}
            aria-label={`Show ${item.title}`}
            aria-current={i === index}
            className={cn(
              'group relative w-36 flex-none overflow-hidden rounded-md border-2 bg-bg-2 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
              i === index ? 'border-signal' : 'border-transparent hover:border-line-2',
            )}
          >
            <Image
              src={galleryThumb(item)}
              alt=""
              width={144}
              height={76}
              unoptimized
              loading="lazy"
              className="block h-[76px] w-full object-cover object-left-top"
            />
            <span className="block truncate px-2 py-1 text-[0.6875rem] text-steel-300">
              {String(i + 1).padStart(2, '0')} · {item.title}
            </span>
          </button>
        ))}
      </div>

      <p className="px-1 text-[0.75rem] text-steel-500">
        Click the picture to pause for inspection, click again to resume. A tall screen scrolls
        inside the picture. With the gallery focused:
        ← → previous and next · Space play and pause · Z actual size (drag to pan) · Home and End
        first and last · F full screen.
      </p>
    </div>
  )
}
