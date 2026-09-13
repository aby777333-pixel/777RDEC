'use client'

import { useEffect, useRef, useState } from 'react'
import { DM_Mono } from 'next/font/google'
import { cn } from '@/lib/utils'
import { type BackdropScene, isInteractiveTarget, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Silly String" by SultanKhanCQ, ported.
 * https://codepen.io/SultanKhanCQ/pen/KwgxROB
 *
 * A red spray can that follows the pointer and, while you hold the button,
 * sprays strands of silly string in six colours at an outlined wordmark in the
 * middle of the band. Each strand is a chain of verlet points: it arcs out,
 * falls under gravity, catches on the letters, drapes over them and settles,
 * and a strand stretched too far snaps. Left alone, the can sweeps back and
 * forth across the top on its own, spraying. The Experiment panel has the
 * pen's five dials — pressure, gravity, curliness, thickness, chaos — and
 * Reset clears the lot.
 *
 * The physics (the points, links, collisions and the 8,000-point budget), the
 * can, the spray, the colours, the demo sweep, the dials and their ranges are
 * the pen's, values included.
 *
 * Asked for on this page:
 *
 * - **The background is black**, where the pen's is cream, so the wordmark is
 *   outlined in white and the panel's ink is inverted to stay legible.
 * - **The strings land on the 777 Raptor logo** — the falcon, wordmark and
 *   tagline from the header — in place of the pen's CodePen logo. The
 *   collision mask is built from the logo's own shape, the way the pen builds
 *   it from its logo, so the strands catch on the bird and the letters.
 *
 * What changed:
 *
 * - **The pen's calculatequick.com link is left out.**
 * - **The logo sits right of the copy on a wide band**, at a width the
 *   band can hold, rather than across the middle of the window.
 * - **The band, not the window.** The can follows the pointer over the hero,
 *   and spraying starts from a press there — not on a link, a button or the
 *   panel. The system cursor is hidden only over the band's empty space, where
 *   the can stands in for it; over links and controls it comes back. Touch
 *   sprays too, but no longer stops the page from scrolling.
 * - **Its clock.** The pen steps the physics once a frame; here the steps are
 *   taken at its 60 a second, whatever the screen's rate.
 */

const mono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-sillystring-mono',
})

/** The 777 Raptor logo, the same master file the header shows. */
const LOGO_SRC = '/brand/raptor-logo.png'

function loadImg(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

const COLS = ['#ff1493', '#00d9a0', '#ffc400', '#00b8ff', '#ff5533', '#b84dff']
const COLS_L = ['#ff6ec7', '#66ffc8', '#ffe066', '#66d9ff', '#ff9a75', '#d4a0ff']

/** The can's size and nozzle offset. */
const CW = 18
const CH = 46
const NX = 10
const NY = -CH / 2 - 3

/** The Experiment dials, in the pen's ranges and starting values. */
export type Dials = { pressure: number; gravity: number; curl: number; thick: number; chaos: number }
const DEFAULT_DIALS: Dials = { pressure: 50, gravity: 30, curl: 50, thick: 40, chaos: 25 }

const STEP_RATE = 60
const MAX_STEPS = 4
const WIDE_FROM = 1024
/** On a wide band the logo is centred here and this wide, clear of the copy. */
const WIDE_CENTRE_X = 0.7
const WIDE_LOGO_WIDTH = 0.34
/** The logo is never taller than this share of the band. */
const MAX_LOGO_HEIGHT = 0.7

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/**
 * The scene reads the dials and the reset through the host element, so the
 * React panel and the canvas stay separate: `dials` is a JSON dataset value,
 * and a `sillystring:reset` event clears the strands.
 */
const RESET_EVENT = 'sillystring:reset'

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const X = canvas.getContext('2d')
  if (!X) return null

  const section = host.parentElement ?? host
  let W = Math.max(1, host.clientWidth)
  let H = Math.max(1, host.clientHeight)

  const dials = (): Dials => {
    try {
      return { ...DEFAULT_DIALS, ...JSON.parse(host.dataset.dials ?? '{}') }
    } catch {
      return DEFAULT_DIALS
    }
  }
  let dial = dials()
  const onDials = () => {
    dial = dials()
  }
  const dialObserver = new MutationObserver(onDials)
  dialObserver.observe(host, { attributes: true, attributeFilter: ['data-dials'] })

  // ---- the logo and its collision mask ----
  let logoImg: HTMLImageElement | null = null
  let collData: Uint8ClampedArray | null = null
  let LOX = 0
  let LOY = 0
  let LW = 0
  let LH = 0
  let ready = false
  let buildId = 0

  const buildLogo = async () => {
    const id = ++buildId
    const img = await loadImg(LOGO_SRC)
    if (id !== buildId || !img) return
    const wide = W >= WIDE_FROM
    // The pen sizes the logo to 55% of the window; on a wide band it sits
    // right of the copy, so it is sized to the space there.
    const aspect = img.naturalHeight / img.naturalWidth
    LW = Math.min(wide ? W * WIDE_LOGO_WIDTH : W * 0.55, (H * MAX_LOGO_HEIGHT) / aspect)
    LH = LW * aspect
    LOX = (wide ? W * WIDE_CENTRE_X : W / 2) - LW / 2
    LOY = (H - LH) / 2
    const cc = document.createElement('canvas')
    cc.width = W
    cc.height = H
    const cx = cc.getContext('2d')
    if (!cx) return
    cx.drawImage(img, LOX, LOY, LW, LH)
    collData = cx.getImageData(0, 0, W, H).data
    logoImg = img
    ready = true
  }

  const hit = (x: number, y: number) => {
    if (!ready || !collData) return false
    const ix = Math.round(x)
    const iy = Math.round(y)
    if (ix < 0 || iy < 0 || ix >= W || iy >= H) return false
    return collData[(iy * W + ix) * 4 + 3] > 30
  }

  class Pt {
    x: number
    y: number
    ox: number
    oy: number
    done = false
    st = 0
    constructor(x: number, y: number) {
      this.x = x
      this.y = y
      this.ox = x
      this.oy = y
    }
    update() {
      if (this.done) return
      const g = (dial.gravity / 100) * 0.4
      const vx = (this.x - this.ox) * 0.97
      const vy = (this.y - this.oy) * 0.97
      this.ox = this.x
      this.oy = this.y
      this.x += vx
      this.y += vy + g
      if (hit(this.x, this.y)) {
        if (!hit(this.x, this.oy)) {
          this.y = this.oy
          this.oy = this.y
        } else if (!hit(this.ox, this.y)) {
          this.x = this.ox
          this.ox = this.x
        } else {
          this.x = this.ox
          this.y = this.oy
        }
        this.ox = this.x
        this.oy = this.y
        this.st += 4
      }
      if (this.y > H - 1) {
        this.y = H - 1
        this.oy = this.y
        this.st += 4
      }
      if (this.y < 0) {
        this.y = 0
        this.oy = 0
        this.st += 4
      }
      if (this.x < 0) this.x = 0
      if (this.x > W) this.x = W
      if (this.st > 14) this.done = true
    }
  }

  class Lk {
    a: Pt
    b: Pt
    l = 2.5
    broken = false
    constructor(a: Pt, b: Pt) {
      this.a = a
      this.b = b
    }
    solve() {
      if (this.broken) return
      const dx = this.b.x - this.a.x
      const dy = this.b.y - this.a.y
      const d = Math.sqrt(dx * dx + dy * dy) || 0.001
      if (d > 25) {
        this.broken = true
        return
      }
      const f = ((this.l - d) / d) * 0.25
      if (!this.a.done) {
        this.a.x -= dx * f
        this.a.y -= dy * f
      }
      if (!this.b.done) {
        this.b.x += dx * f
        this.b.y += dy * f
      }
    }
  }

  class Strand {
    pts: Pt[] = []
    lks: Lk[] = []
    ci: number
    constructor(i: number) {
      this.ci = i
    }
    add(x: number, y: number, vx: number, vy: number) {
      const p = new Pt(x, y)
      p.ox = x - vx
      p.oy = y - vy
      if (this.pts.length) this.lks.push(new Lk(this.pts[this.pts.length - 1], p))
      this.pts.push(p)
    }
  }

  let strands: Strand[] = []
  let ci = 0
  let mx = W / 2
  let my = H * 0.2
  let spraying = false
  let cur: Strand | null = null
  let spT = 0
  let demo = true
  let demoT = 0

  const onReset = () => {
    strands = []
    cur = null
  }
  host.addEventListener(RESET_EVENT, onReset)

  const isControl = (target: EventTarget | null) =>
    isInteractiveTarget(target) || (target instanceof Element && target.closest('[data-pen-controls]') !== null)

  const local = (clientX: number, clientY: number) => {
    const rect = host.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || e.button !== 0 || isControl(e.target)) return
    demo = false
    spraying = true
    spT = 0
    cur = new Strand(ci++ % COLS.length)
    strands.push(cur)
  }
  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    spraying = false
    cur = null
  }
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return
    if (demo && !isControl(e.target)) {
      demo = false
      spraying = false
      cur = null
    }
    const p = local(e.clientX, e.clientY)
    mx = p.x
    my = p.y
  }
  const onTouchStart = (e: TouchEvent) => {
    if (isControl(e.target)) return
    demo = false
    const p = local(e.touches[0].clientX, e.touches[0].clientY)
    mx = p.x
    my = p.y
    spraying = true
    spT = 0
    cur = new Strand(ci++ % COLS.length)
    strands.push(cur)
  }
  const onTouchMove = (e: TouchEvent) => {
    if (isControl(e.target)) return
    const p = local(e.touches[0].clientX, e.touches[0].clientY)
    mx = p.x
    my = p.y
  }
  const onTouchEnd = () => {
    spraying = false
    cur = null
  }
  section.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointerup', onPointerUp)
  section.addEventListener('pointermove', onPointerMove)
  section.addEventListener('touchstart', onTouchStart, { passive: true })
  section.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('touchend', onTouchEnd)
  section.classList.add('sillystring-cursor')

  const aimAngle = (cx: number, cy: number) => {
    const rawA = Math.atan2(LOY + LH / 2 - cy, LOX + LW / 2 - cx)
    return Math.atan2(Math.sin(rawA) * 0.15, Math.cos(rawA))
  }
  const tipWorld = (cx: number, cy: number, rot: number) => ({
    x: cx + NX * Math.cos(rot) - NY * Math.sin(rot),
    y: cy + NX * Math.sin(rot) + NY * Math.cos(rot),
  })

  const drawCan = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
    const a = aimAngle(cx, cy)
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(a)
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.08)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 3
    const bg = ctx.createLinearGradient(-CW / 2, 0, CW / 2, 0)
    bg.addColorStop(0, '#9a2020')
    bg.addColorStop(0.13, '#d43530')
    bg.addColorStop(0.4, '#ee4e48')
    bg.addColorStop(0.6, '#e84040')
    bg.addColorStop(0.85, '#d43530')
    bg.addColorStop(1, '#8a1818')
    ctx.fillStyle = bg
    rr(ctx, -CW / 2, -CH / 2, CW, CH, 4)
    ctx.fill()
    ctx.restore()
    const m = ctx.createLinearGradient(-CW / 2, 0, CW / 2, 0)
    m.addColorStop(0, '#aaa')
    m.addColorStop(0.4, '#ddd')
    m.addColorStop(1, '#999')
    ctx.fillStyle = m
    rr(ctx, -CW / 2 + 1, CH / 2 - 3, CW - 2, 3, 1)
    ctx.fill()
    rr(ctx, -CW / 2 + 1, -CH / 2, CW - 2, 3, 1)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    rr(ctx, -CW / 2 + 2, -5, CW - 4, 12, 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.font = 'bold 4px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('SILLY', 0, 1)
    ctx.fillText('STRING', 0, 5.5)
    ctx.fillStyle = m
    rr(ctx, -5, -CH / 2 - 4, 10, 5, 2)
    ctx.fill()
    ctx.fillStyle = cur ? COLS[cur.ci] : '#d44'
    ctx.beginPath()
    ctx.ellipse(0, -CH / 2 - 5, 4, 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#bbb'
    ctx.beginPath()
    ctx.moveTo(2, -CH / 2 - 3)
    ctx.lineTo(NX - 1, NY - 1)
    ctx.lineTo(NX - 1, NY + 2)
    ctx.lineTo(2, -CH / 2 + 1)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#888'
    ctx.beginPath()
    ctx.arc(NX, NY, 2, 0, Math.PI * 2)
    ctx.fill()
    if (spraying && cur) {
      for (let i = 0; i < 3; i++) {
        const d = 1 + Math.random() * 5
        ctx.fillStyle = COLS[cur.ci]
        ctx.globalAlpha = 0.08 + Math.random() * 0.1
        ctx.beginPath()
        ctx.arc(NX + d, NY + (Math.random() - 0.5) * 3, 0.3 + Math.random() * 0.4, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
    ctx.restore()
  }

  const emitFrom = (cx: number, cy: number) => {
    if (!cur) return
    spT++
    const a = aimAngle(cx, cy)
    const tip = tipWorld(cx, cy, a)
    const pressure = 3 + (dial.pressure / 100) * 11
    const curlAmt = (dial.curl / 100) * 4
    const chaos = (dial.chaos / 100) * 1.2
    for (let j = 0; j < 3; j++) {
      const speed = pressure + Math.random() * 2
      const curl = Math.sin(spT * 0.35 + j * 1.7) * curlAmt
      const wobble = (Math.random() - 0.5) * (0.15 + chaos)
      const pa = a + Math.PI / 2
      cur.add(
        tip.x,
        tip.y,
        Math.cos(a + wobble) * speed + Math.cos(pa) * curl,
        Math.sin(a + wobble) * speed + Math.sin(pa) * curl,
      )
    }
    let tot = 0
    for (const s of strands) tot += s.pts.length
    while (tot > 8000 && strands.length > 1) {
      const o = strands[0]
      if (o === cur) break
      if (o.pts.length) {
        o.pts.shift()
        o.lks.shift()
        tot--
      } else strands.shift()
    }
  }

  const drawStrands = (ctx: CanvasRenderingContext2D) => {
    const thick = 0.5 + (dial.thick / 100) * 3.5
    for (const s of strands) {
      if (s.pts.length < 2) continue
      const pts = s.pts
      const lks = s.lks
      const col = COLS[s.ci]
      const colL = COLS_L[s.ci]
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        if (i - 1 < lks.length && lks[i - 1].broken) {
          ctx.moveTo(pts[i].x, pts[i].y)
          continue
        }
        const dx = pts[i].x - pts[i - 1].x
        const dy = pts[i].y - pts[i - 1].y
        if (dx * dx + dy * dy > 600) {
          ctx.moveTo(pts[i].x, pts[i].y)
          continue
        }
        ctx.quadraticCurveTo(pts[i - 1].x, pts[i - 1].y, (pts[i - 1].x + pts[i].x) / 2, (pts[i - 1].y + pts[i].y) / 2)
      }
      ctx.save()
      ctx.shadowColor = col
      ctx.shadowBlur = 2
      ctx.strokeStyle = col
      ctx.globalAlpha = 0.12
      ctx.lineWidth = thick + 2
      ctx.stroke()
      ctx.restore()
      ctx.strokeStyle = col
      ctx.globalAlpha = 0.9
      ctx.lineWidth = thick
      ctx.stroke()
      ctx.strokeStyle = colL
      ctx.globalAlpha = 0.2
      ctx.lineWidth = thick * 0.3
      ctx.stroke()
      ctx.globalAlpha = 1
    }
  }

  /** One of the pen's frames of physics. */
  const step = () => {
    demoT++
    let canX = mx
    let canY = my
    if (demo) {
      canX = W * 0.1 + ((Math.sin(demoT * 0.008) + 1) / 2) * W * 0.8
      canY = H * 0.12 + Math.sin(demoT * 0.03) * 10
      if (demoT % 2 === 0) {
        if (!cur || cur.pts.length > 150) {
          cur = new Strand(ci++ % COLS.length)
          strands.push(cur)
        }
        spraying = true
      }
    }
    if (spraying) emitFrom(canX, canY)
    for (const s of strands) {
      for (const p of s.pts) p.update()
      for (let i = 0; i < 2; i++) for (const k of s.lks) k.solve()
    }
    return { canX, canY }
  }

  const draw = (canX: number, canY: number) => {
    X.clearRect(0, 0, W, H)
    X.fillStyle = '#000'
    X.fillRect(0, 0, W, H)
    drawStrands(X)
    if (logoImg) X.drawImage(logoImg, LOX, LOY, LW, LH)
    drawCan(X, canX, canY)
  }

  let stepsTaken = -1

  return {
    resize(w, h, dpr) {
      W = w
      H = h
      X.setTransform(dpr, 0, 0, dpr, 0, 0)
      void buildLogo()
    },
    frame(seconds) {
      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      if (steps === 0) return
      let can = { canX: mx, canY: my }
      for (let i = 0; i < steps; i++) can = step()
      draw(can.canX, can.canY)
    },
    dispose() {
      buildId++
      dialObserver.disconnect()
      host.removeEventListener(RESET_EVENT, onReset)
      section.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      section.removeEventListener('pointermove', onPointerMove)
      section.removeEventListener('touchstart', onTouchStart)
      section.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      section.classList.remove('sillystring-cursor')
      strands = []
    },
  }
}

const DIAL_ROWS: { key: keyof Dials; label: string; min: number; max: number }[] = [
  { key: 'pressure', label: 'Pressure', min: 0, max: 100 },
  { key: 'gravity', label: 'Gravity', min: -100, max: 100 },
  { key: 'curl', label: 'Curliness', min: 0, max: 100 },
  { key: 'thick', label: 'Thickness', min: 0, max: 100 },
  { key: 'chaos', label: 'Chaos', min: 0, max: 100 },
]

export function SillystringBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  const [open, setOpen] = useState(false)
  const [dials, setDials] = useState<Dials>(DEFAULT_DIALS)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    if (hostRef.current) hostRef.current.dataset.dials = JSON.stringify(dials)
  }, [dials, hostRef])

  return (
    <>
      <div ref={hostRef} className={cn('pen-scene pen-scene--sillystring', className)} aria-hidden />
      <div className={cn('sillystring-ui', mono.variable)} data-pen-controls>
        <button
          type="button"
          className="sillystring-reset"
          onClick={() => hostRef.current?.dispatchEvent(new Event(RESET_EVENT))}
        >
          Reset
        </button>
        <div className="sillystring-panel">
          <button
            type="button"
            className={cn('sillystring-toggle', open && 'active')}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            Experiment ↕
          </button>
          <div className={cn('sillystring-controls', open && 'open')} aria-hidden={!open}>
            {DIAL_ROWS.map((row) => (
              <label key={row.key}>
                <span>{row.label}</span>
                <input
                  type="range"
                  min={row.min}
                  max={row.max}
                  value={dials[row.key]}
                  tabIndex={open ? 0 : -1}
                  onChange={(event) => setDials((current) => ({ ...current, [row.key]: Number(event.target.value) }))}
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
