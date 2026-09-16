'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * "THE FINAL 0.001 SECOND", from the owner's own CodePen, ported.
 *
 * A 777 Raptor execution terminal quotes EUR/USD. A cursor drifts onto BUY and
 * clicks; the terminal zooms past the viewer and the order's first millisecond
 * plays out in chapters, a clock counting up to 0.001000 s — input, RAM, CPU,
 * the Raptor risk engine ticking off its checks, the network stack, optical
 * fibre, the data centre, liquidity routing, MATCH, the acknowledgement — until
 * the terminal flies back in reading EXECUTED and the band closes on "777
 * RAPTOR / THE FINAL 0.001 SECOND."
 *
 * The terminal's layout, the chart, the quote jitter, every chapter's drawing,
 * name, subtitle and time, the risk checks and their stagger, MATCH and the
 * flashes, the scanlines and vignette, the closing screen and the timeline are
 * the pen's, values included.
 *
 * What changed:
 *
 * - **It loops.** The pen plays once. Here the closing screen holds, then fades
 *   into the next lap's terminal and the cursor comes in again.
 * - **The timeline is a function of time.** The pen chains timeouts and Web
 *   Animations off the first click. Here every layer is placed from the lap's
 *   clock each frame, with the pen's keyframes, delays and easings, so the band
 *   pauses cleanly off screen and a lap always starts from READY.
 * - **It shares the hero with its copy.** The pen owns a window. From `lg` the
 *   terminal, the chapters, MATCH and the closing screen are centred in the
 *   space to the right of the heading, and the terminal is scaled down to fit
 *   it; below `lg` the copy spans the band, so only the canvas chapters, the
 *   flashes and the scanlines play behind it.
 * - **No blur on the zoom.** The pen blurs the terminal while it scales it to
 *   40x and back from 20x. Blurring a layer that size drops frames (see THE
 *   BREACH), so the zoom animates transform and opacity only; the return fades
 *   the terminal in where the pen un-blurs it.
 * - **Decoration, not a control.** The BUY button is not a button, nothing
 *   takes the pointer, and the whole band is hidden from assistive technology.
 * - **A still band is a composed one.** With motion reduced the terminal is
 *   shown at READY.
 */

/** From this band width the copy leaves room on the right. Tailwind's `lg`. */
const WIDE_FROM = 1024
/** Where the scene is centred across a wide band. */
const WIDE_CENTRE_X = 0.74

/** The pen's terminal at full size; it is scaled to the space it has. */
const TERMINAL_W = 1040
const TERMINAL_H = 650
const CHART_W = TERMINAL_W - 290
const CHART_H = TERMINAL_H - 156

/** Lap timeline, seconds. The pen's timeouts, measured from page load. */
const CURSOR_AT = 1.3
const CURSOR_SECONDS = 1.6
const CLICK_AT = 3.2
/** The sequence clock starts 300ms after the click. */
const SEQUENCE_AT = 3.5
const ZOOM_SECONDS = 1.2
const SEQUENCE_SECONDS = 20.5
/** The closing screen starts 600ms after the sequence ends. */
const FINAL_AT = SEQUENCE_AT + SEQUENCE_SECONDS + 0.6
const LAP = 31
/** How long the closing screen takes to clear at the start of the next lap. */
const HANDOVER = 1

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v))
}

function phase(t: number, a: number, b: number) {
  return clamp((t - a) / (b - a), 0, 1)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smooth(t: number) {
  t = clamp(t, 0, 1)
  return t * t * (3 - 2 * t)
}

/** CSS `cubic-bezier()` as a function of progress, for the pen's WAAPI easings. */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bx = (t: number) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3
  const by = (t: number) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let lo = 0
    let hi = 1
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (bx(mid) < x) lo = mid
      else hi = mid
    }
    return by((lo + hi) / 2)
  }
}

const easeZoom = cubicBezier(0.7, 0, 0.8, 0.2)
const easeCursor = cubicBezier(0.2, 0.8, 0.2, 1)
const easeOut = cubicBezier(0, 0, 0.58, 1)

/** Three-keyframe WAAPI effect (offsets 0, 0.5, 1) at progress `e`. */
function keys3(a: number, b: number, c: number, e: number) {
  return e < 0.5 ? lerp(a, b, e / 0.5) : lerp(b, c, (e - 0.5) / 0.5)
}

type Structure = { x: number; y: number; z: number; s: number }

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const q = <T extends HTMLElement>(name: string) =>
    host.querySelector<T>(`[data-exec="${name}"]`)

  const terminal = q('terminal')
  const chartHost = q('chart')
  const cursor = q('cursor')
  const chrono = q('chrono')
  const clock = q('clock')
  const chapter = q('chapter')
  const microTime = q('micro')
  const chapterName = q('chapter-name')
  const chapterSub = q('chapter-sub')
  const riskPanel = q('risk')
  const accepted = q('accepted')
  const match = q('match')
  const flash = q('flash')
  const final = q('final')
  const finalLine = q('final-line')
  const finalCopy = q('final-copy')
  const finalTag = q('final-tag')
  const bid = q('bid')
  const ask = q('ask')
  const buy = q('buy')
  const execution = q('execution')
  const checks = Array.from(host.querySelectorAll<HTMLElement>('[data-exec="check"]'))
  if (
    !terminal || !chartHost || !cursor || !chrono || !clock || !chapter || !microTime ||
    !chapterName || !chapterSub || !riskPanel || !accepted || !match || !flash || !final ||
    !finalLine || !finalCopy || !finalTag || !bid || !ask || !buy || !execution
  ) {
    return null
  }

  // The chart is the scene's own canvas, like the main one, and goes with it.
  const chart = document.createElement('canvas')
  chartHost.appendChild(chart)
  const chartCtx = chart.getContext('2d')

  let W = 1
  let H = 1
  /** Centre of the scene, and the width it is drawn to. */
  let CX = 0.5
  let SW = 1
  let fit = 1
  let wide = false

  const structures: Structure[] = []
  for (let i = 0; i < 900; i++) {
    structures.push({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      z: Math.random(),
      s: 0.2 + Math.random() * 1.8,
    })
  }

  /** Writes a text node only when it changes. */
  const texts = new WeakMap<HTMLElement, string>()
  const setText = (el: HTMLElement, value: string) => {
    if (texts.get(el) === value) return
    texts.set(el, value)
    el.textContent = value
  }

  const setChapter = (name: string, sub: string, time: string) => {
    setText(chapterName, name)
    setText(chapterSub, sub)
    setText(microTime, time)
  }

  /* ---------------- CHART ---------------- */

  const drawChart = (seconds: number) => {
    if (!chartCtx) return
    const w = CHART_W
    const h = CHART_H
    const chartOffset = seconds * 36

    chartCtx.clearRect(0, 0, w, h)
    chartCtx.strokeStyle = 'rgba(255,255,255,.035)'
    chartCtx.lineWidth = 1

    for (let x = 0; x < w; x += 55) {
      chartCtx.beginPath()
      chartCtx.moveTo(x, 0)
      chartCtx.lineTo(x, h)
      chartCtx.stroke()
    }
    for (let y = 0; y < h; y += 50) {
      chartCtx.beginPath()
      chartCtx.moveTo(0, y)
      chartCtx.lineTo(w, y)
      chartCtx.stroke()
    }

    chartCtx.beginPath()
    for (let x = 0; x < w; x += 4) {
      const y =
        h * 0.52 +
        Math.sin((x + chartOffset) * 0.025) * 22 +
        Math.sin((x + chartOffset) * 0.008) * 45 +
        Math.sin((x + chartOffset) * 0.11) * 5
      if (x === 0) chartCtx.moveTo(x, y)
      else chartCtx.lineTo(x, y)
    }
    chartCtx.strokeStyle = 'rgba(80,210,180,.75)'
    chartCtx.lineWidth = 1.5
    chartCtx.shadowBlur = 10
    chartCtx.shadowColor = '#45dcb2'
    chartCtx.stroke()
    chartCtx.shadowBlur = 0
  }

  /* ---------------- BACKGROUND ---------------- */

  const background = () => {
    const g = ctx.createRadialGradient(CX, H / 2, 0, CX, H / 2, Math.max(W, H) * 0.8)
    g.addColorStop(0, '#07131a')
    g.addColorStop(0.35, '#020609')
    g.addColorStop(1, '#000')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
  }

  /* ---------------- RAM ---------------- */

  const drawRAM = (t: number, steps: number) => {
    setChapter('RAM', 'ORDER OBJECT CREATED', '0.000010 s')
    const speed = phase(t, 2, 4)

    ctx.save()
    for (const p of structures) {
      p.z -= (0.012 + speed * 0.045) * steps
      if (p.z < 0.01) {
        p.z = 1
        p.x = (Math.random() - 0.5) * 2
        p.y = (Math.random() - 0.5) * 2
      }
      const scale = 1 / p.z
      const x = CX + p.x * SW * 0.32 * scale
      const y = H / 2 + p.y * H * 0.3 * scale
      const size = 2 + p.s * 8 * scale
      if (x < -100 || x > W + 100 || y < -100 || y > H + 100) continue
      ctx.fillStyle = `rgba(80,180,210,${clamp(1 - p.z, 0, 1) * 0.22})`
      ctx.fillRect(x - size / 2, y - size / 2, size, size * 2.5)
    }
    ctx.restore()
  }

  /* ---------------- CPU ---------------- */

  const drawCPU = (t: number) => {
    setChapter('CPU', 'INSTRUCTION EXECUTION', '0.000050 s')

    ctx.save()
    ctx.translate(CX, H / 2)
    const travel = (t - 4) * 900

    for (let layer = 0; layer < 22; layer++) {
      const z = (((layer * 160 - travel) % 3500) + 3500) % 3500
      const s = 1800 / (z + 80)
      ctx.strokeStyle = `rgba(70,190,255,${0.04 + s * 0.025})`
      ctx.lineWidth = 1
      for (let x = -7; x <= 7; x++) {
        ctx.strokeRect(x * 70 * s - 30 * s, -420 * s, 50 * s, 840 * s)
      }
    }

    for (let i = 0; i < 80; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * Math.min(W, H) * 0.45
      ctx.beginPath()
      ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
      ctx.lineTo(Math.cos(a) * r * 1.5, Math.sin(a) * r * 1.5)
      ctx.strokeStyle = 'rgba(100,220,255,.12)'
      ctx.stroke()
    }
    ctx.restore()
  }

  /* ---------------- RISK ENGINE ---------------- */

  const drawRisk = () => {
    setChapter('RAPTOR RISK ENGINE', 'PRE-TRADE VALIDATION', '0.000120 s')
    ctx.fillStyle = 'rgba(0,25,35,.15)'
    ctx.fillRect(0, 0, W, H)
  }

  /* ---------------- NETWORK ---------------- */

  /** The opening pulse reuses this drawing under the INPUT chapter. */
  const drawNetwork = (t: number, labelled = true) => {
    if (labelled) setChapter('NETWORK STACK', 'PACKET ASSEMBLY', '0.000210 s')
    const cx = CX
    const cy = H / 2

    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    for (let i = 0; i < 130; i++) {
      const angle = (i / 130) * Math.PI * 2
      const inner = 30
      const outer = Math.max(W, H) * 0.8
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
      ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer)
      ctx.strokeStyle = 'rgba(70,170,220,.035)'
      ctx.stroke()
    }

    const pulse = (t * 3) % 1
    const radius = 20 + pulse * Math.max(W, H) * 0.7
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(80,220,255,${1 - pulse})`
    ctx.lineWidth = 3
    ctx.shadowBlur = 30
    ctx.shadowColor = '#31cfff'
    ctx.stroke()
    ctx.restore()
  }

  /* ---------------- FIBRE ---------------- */

  const drawFibre = (t: number) => {
    setChapter('OPTICAL FIBRE', 'ELECTRICAL → LIGHT', '0.000350 s')
    const cx = CX + Math.sin(t * 0.9) * SW * 0.08
    const cy = H / 2 + Math.cos(t * 0.7) * H * 0.05

    const gradient = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W, H) * 0.65)
    gradient.addColorStop(0, '#dfffff')
    gradient.addColorStop(0.03, '#58d9ff')
    gradient.addColorStop(0.1, '#0b5c80')
    gradient.addColorStop(0.45, '#06151e')
    gradient.addColorStop(1, '#000')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    for (let i = 0; i < 100; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * Math.min(W, H) * 0.45
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(
        x + Math.cos(a) * (40 + Math.random() * 250),
        y + Math.sin(a) * (40 + Math.random() * 250),
      )
      ctx.strokeStyle = `rgba(${120 + Math.random() * 100},${180 + Math.random() * 70},255,${
        0.04 + Math.random() * 0.2
      })`
      ctx.lineWidth = Math.random() * 2
      ctx.stroke()
    }
    ctx.restore()
  }

  /* ---------------- DATA CENTRE ---------------- */

  const drawInfrastructure = (t: number) => {
    setChapter('INFRASTRUCTURE', 'ROUTING', '0.000500 s')
    ctx.fillStyle = '#030506'
    ctx.fillRect(0, 0, W, H)

    const vanX = CX + Math.sin(t * 0.5) * SW * 0.1
    const vanY = H * 0.46

    for (const side of [-1, 1]) {
      for (let z = 1; z < 16; z++) {
        const depth = z / 16
        const scale = depth ** 2
        const x = vanX + side * lerp(30, SW * 0.62, scale)
        const rackW = lerp(15, 180, scale)
        const rackH = lerp(30, H * 0.8, scale)

        ctx.fillStyle = `rgba(15,22,25,${0.3 + scale * 0.7})`
        ctx.fillRect(x - rackW / 2, vanY - rackH / 2, rackW, rackH)

        for (let led = 0; led < 12; led++) {
          if (Math.random() > 0.55) {
            ctx.fillStyle = Math.random() > 0.15 ? 'rgba(70,220,160,.55)' : 'rgba(255,150,40,.7)'
            ctx.fillRect(
              x + side * (-rackW * 0.25),
              vanY - rackH * 0.35 + led * rackH * 0.055,
              2 + scale * 3,
              1 + scale * 2,
            )
          }
        }
      }
    }

    ctx.strokeStyle = 'rgba(90,200,230,.15)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(vanX, vanY)
    ctx.lineTo(CX, H)
    ctx.stroke()
  }

  /* ---------------- LIQUIDITY ---------------- */

  const NODES: readonly [number, number][] = [
    [-0.38, -0.25],
    [0.4, -0.3],
    [-0.45, 0.28],
    [0.43, 0.3],
    [0, -0.4],
    [0, 0.4],
  ]

  const drawLiquidity = () => {
    setChapter('LIQUIDITY', 'ROUTE EVALUATION', '0.000650 s')
    ctx.fillStyle = '#010405'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(CX, H / 2)
    NODES.forEach((n, i) => {
      const x = n[0] * SW
      const y = n[1] * H

      ctx.beginPath()
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fillStyle = i === 3 ? '#a8f6ff' : 'rgba(80,170,200,.3)'
      ctx.shadowBlur = i === 3 ? 40 : 10
      ctx.shadowColor = '#40dfff'
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(x, y)
      ctx.strokeStyle = i === 3 ? 'rgba(100,230,255,.8)' : 'rgba(80,180,220,.1)'
      ctx.lineWidth = i === 3 ? 3 : 1
      ctx.stroke()
    })
    ctx.restore()
  }

  /* ---------------- EXECUTION ---------------- */

  const drawExecution = (t: number) => {
    setChapter('EXECUTION SYSTEM', 'MATCHING', '0.000780 s')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    for (let i = 0; i < 220; i++) {
      const y = Math.random() * H
      const length = 30 + Math.random() * W * 0.35
      const x = Math.random() * W
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + length, y)
      ctx.strokeStyle = `rgba(${80 + Math.random() * 100},${170 + Math.random() * 80},255,${
        0.03 + Math.random() * 0.18
      })`
      ctx.lineWidth = Math.random() * 2
      ctx.stroke()
    }

    const target = phase(t, 15.8, 16.7)
    ctx.beginPath()
    ctx.arc(CX, H / 2, lerp(4, 100, target), 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(180,245,255,${0.8 * (1 - target)})`
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.restore()
  }

  /* ---------------- RETURN ---------------- */

  const drawReturn = () => {
    setChapter('ACKNOWLEDGEMENT', 'EXECUTION CONFIRMED', '0.000900 s')
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(CX, H / 2)
    ctx.globalCompositeOperation = 'screen'
    for (let i = 0; i < 300; i++) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * Math.max(W, H) * 0.6
      const x = Math.cos(a) * r
      const y = Math.sin(a) * r
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x * 0.25, y * 0.25)
      ctx.strokeStyle = `rgba(100,220,255,${Math.random() * 0.25})`
      ctx.lineWidth = Math.random() * 2.5
      ctx.stroke()
    }
    ctx.restore()
  }

  /* ---------------- DOM LAYERS ---------------- */

  let quoteStep = -1
  const quote = (step: number) => {
    if (step === quoteStep) return
    quoteStep = step
    const base = 1.17382 + (Math.random() - 0.5) * 0.00008
    setText(bid, base.toFixed(5))
    setText(ask, (base + 0.00002).toFixed(5))
    setText(buy, `BUY ${(base + 0.00002).toFixed(5)}`)
  }

  const placeTerminal = (scale: number, opacity: number) => {
    terminal.style.opacity = String(opacity)
    terminal.style.transform = `translate(-50%, -50%) scale(${scale * fit})`
  }

  /** Every DOM layer, placed for lap time `L`. */
  const layers = (L: number, lap: number, still: boolean) => {
    const t = L - SEQUENCE_AT

    // Quote and ticket.
    if (L < CLICK_AT) {
      if (!still) quote(Math.floor(L / 0.4))
      buy.style.transform = ''
      setText(execution, 'READY')
      execution.style.color = ''
      execution.style.opacity = ''
    } else {
      buy.style.transform = 'scale(.97)'
      if (t >= 19 && phase(t, 19, 20.5) > 0.8) {
        setText(execution, 'EXECUTED')
        execution.style.color = '#83ffd0'
        execution.style.opacity = '1'
      } else {
        setText(execution, 'ORDER SUBMITTED')
        execution.style.color = ''
        execution.style.opacity = ''
      }
    }

    // Terminal.
    if (L < SEQUENCE_AT) {
      placeTerminal(1, 1)
    } else if (t < ZOOM_SECONDS) {
      const e = easeZoom(t / ZOOM_SECONDS)
      placeTerminal(keys3(1, 8, 40, e), keys3(1, 1, 0, e))
    } else if (t < 19) {
      placeTerminal(1, 0)
    } else {
      const p = phase(t, 19, 20.5)
      placeTerminal(lerp(20, 1, smooth(p)), clamp(p / 0.35, 0, 1))
    }

    // Cursor.
    if (!still && L >= CURSOR_AT && L < SEQUENCE_AT) {
      const e = easeCursor(phase(L, CURSOR_AT, CURSOR_AT + CURSOR_SECONDS))
      cursor.style.left = `${buy.offsetLeft + buy.offsetWidth * 0.72}px`
      cursor.style.top = `${buy.offsetTop + buy.offsetHeight * 0.55}px`
      cursor.style.opacity = String(e)
      cursor.style.transform = `translate(${lerp(150, 0, e)}px, ${lerp(100, 0, e)}px)`
    } else {
      cursor.style.opacity = '0'
    }

    // Clock and chapter.
    if (L < SEQUENCE_AT) {
      chrono.style.opacity = '0'
      chapter.style.opacity = '0'
    } else {
      chrono.style.opacity = String(phase(t, 0, 0.4))
      chapter.style.opacity = String(phase(t, 0, 0.5))
      const logical = t >= SEQUENCE_SECONDS ? 0.001 : clamp(t / SEQUENCE_SECONDS, 0, 1) * 0.001
      setText(clock, `${logical.toFixed(6)} s`)
    }

    // Risk engine: 6.3s to 8.4s into the sequence.
    if (t >= 6.3 && t < 8.4) {
      const r = t - 6.3
      const p = phase(r, 0, 0.3)
      riskPanel.style.opacity = String(p)
      riskPanel.style.transform = `translate(-50%, -50%) scale(${lerp(0.8, 1, p) * Math.min(1, fit * 1.5)})`
      checks.forEach((el, i) => {
        const c = phase(r, i * 0.17, i * 0.17 + 0.15)
        el.style.opacity = String(c)
        el.style.transform = `translateX(${lerp(-15, 0, c)}px)`
      })
      accepted.style.opacity = String(phase(r, 1, 1.25))
    } else {
      riskPanel.style.opacity = '0'
    }

    // MATCH and the flashes.
    const m = phase(t, 16.6, 17.2)
    if (t >= 16.6 && m < 1) {
      const e = easeOut(m)
      match.style.opacity = String(keys3(0, 1, 0, e))
      match.style.transform = `translate(-50%, -50%) scale(${keys3(0.3, 1, 2, e)})`
    } else {
      match.style.opacity = '0'
    }
    let flashOpacity = 0
    if (L >= CLICK_AT && L < CLICK_AT + 0.18) {
      flashOpacity = keys3(0, 0.35, 0, (L - CLICK_AT) / 0.18)
    }
    if (t >= 16.6 && t < 17.1) {
      flashOpacity = Math.max(flashOpacity, keys3(0, 1, 0, (t - 16.6) / 0.5))
    }
    flash.style.opacity = String(flashOpacity)

    // The closing screen, and its handover into the next lap.
    const f = L - FINAL_AT
    const lineWidth = Math.min(440, SW * 0.8)
    if (lap > 0 && L < HANDOVER && !still) {
      final.style.opacity = String(1 - L / HANDOVER)
      finalLine.style.width = `${lineWidth}px`
      finalCopy.style.opacity = '0.9'
      finalTag.style.opacity = '0.5'
      finalTag.style.letterSpacing = '.42em'
    } else if (f >= 0) {
      final.style.opacity = String(phase(f, 0, 1.2))
      finalLine.style.width = `${lerp(0, lineWidth, phase(f, 0.7, 1.9))}px`
      finalCopy.style.opacity = String(0.9 * phase(f, 1.3, 2.2))
      const tag = phase(f, 2.1, 3.4)
      finalTag.style.opacity = String(0.5 * tag)
      finalTag.style.letterSpacing = `${lerp(0.9, 0.42, tag)}em`
    } else {
      final.style.opacity = '0'
    }
  }

  /* ---------------- MAIN LOOP ---------------- */

  let last = 0

  const frame = (seconds: number) => {
    const still = motionIsReduced()
    const s = still ? 0 : seconds
    const lap = Math.floor(s / LAP)
    const L = s - lap * LAP
    const t = L - SEQUENCE_AT
    // The pen moves its RAM structures a fixed step per frame at 60 a second.
    const steps = clamp((s - last) * 60, 0, 4)
    last = s

    if (L < SEQUENCE_AT || still) {
      ctx.clearRect(0, 0, W, H)
    } else {
      background()
      if (t < 2) {
        setChapter('INPUT', 'ORDER SUBMITTED', '0.000001 s')
        drawNetwork(t, false)
      } else if (t < 4) drawRAM(t, steps)
      else if (t < 6.3) drawCPU(t)
      else if (t < 8.4) drawRisk()
      else if (t < 10.4) drawNetwork(t)
      else if (t < 12.7) drawFibre(t)
      else if (t < 14.5) drawInfrastructure(t)
      else if (t < 15.8) drawLiquidity()
      else if (t < 17.4) drawExecution(t)
      else if (t < 19) drawReturn()
      else setChapter('TERMINAL', 'EXECUTION ACKNOWLEDGEMENT', '0.000999 s')
    }

    // The chart only while the terminal can be seen.
    if (wide && (L < SEQUENCE_AT + ZOOM_SECONDS || t >= 19)) drawChart(s)

    if (wide) layers(L, lap, still)
    else {
      let flashOpacity = 0
      if (L >= CLICK_AT && L < CLICK_AT + 0.18) {
        flashOpacity = keys3(0, 0.35, 0, (L - CLICK_AT) / 0.18)
      }
      if (t >= 16.6 && t < 17.1) {
        flashOpacity = Math.max(flashOpacity, keys3(0, 1, 0, (t - 16.6) / 0.5))
      }
      flash.style.opacity = still ? '0' : String(flashOpacity)
    }
  }

  const resize = (w: number, h: number, dpr: number) => {
    W = w
    H = h
    wide = w >= WIDE_FROM
    CX = wide ? w * WIDE_CENTRE_X : w / 2
    SW = wide ? 2 * (w - CX) : w
    fit = Math.min((SW * 0.92) / TERMINAL_W, (h * 0.72) / TERMINAL_H, 1)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const chartDpr = Math.min(dpr, 2)
    chart.width = Math.round(CHART_W * chartDpr)
    chart.height = Math.round(CHART_H * chartDpr)
    chartCtx?.setTransform(chartDpr, 0, 0, chartDpr, 0, 0)

    host.style.setProperty('--exec-x', `${CX}px`)
    host.style.setProperty('--exec-span', `${SW}px`)
  }

  return {
    frame,
    resize,
    dispose: () => {
      chart.remove()
    },
  }
}

export function ExecutionBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.5 })

  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--execution', className)} aria-hidden>
      <div className="exec-terminal" data-exec="terminal">
        <div className="exec-head">
          <div>
            <span className="exec-mark">777 RAPTOR</span>
            <span className="exec-sub">EXECUTION TERMINAL</span>
          </div>
          <div className="exec-live">
            <i /> LIVE
          </div>
        </div>

        <div className="exec-market">
          <div className="exec-symbol">
            <strong>EUR / USD</strong>
            <span>SPOT</span>
          </div>
          <div className="exec-price">
            <small>BID</small>
            <b data-exec="bid">1.17382</b>
          </div>
          <div className="exec-price">
            <small>ASK</small>
            <b data-exec="ask">1.17384</b>
          </div>
        </div>

        <div className="exec-chart" data-exec="chart" />

        <div className="exec-ticket">
          <div className="exec-row">
            <span>ORDER</span>
            <strong>MARKET</strong>
          </div>
          <div className="exec-row">
            <span>SIZE</span>
            <strong>1.00 LOT</strong>
          </div>
          <div className="exec-buy" data-exec="buy">
            BUY 1.17384
          </div>
          <div className="exec-status" data-exec="execution">
            READY
          </div>
          <div className="exec-cursor" data-exec="cursor" />
        </div>
      </div>

      <div className="exec-chrono" data-exec="chrono">
        <span>ELAPSED</span>
        <b data-exec="clock">0.000000 s</b>
      </div>

      <div className="exec-chapter" data-exec="chapter">
        <div className="exec-micro" data-exec="micro">
          0.000000 s
        </div>
        <div className="exec-chapter-name" data-exec="chapter-name">
          INPUT
        </div>
        <div className="exec-chapter-sub" data-exec="chapter-sub">
          ORDER SUBMITTED
        </div>
      </div>

      <div className="exec-risk" data-exec="risk">
        <div className="exec-risk-title">RAPTOR RISK ENGINE</div>
        <div className="exec-check" data-exec="check">
          ACCOUNT <b>VERIFIED</b>
        </div>
        <div className="exec-check" data-exec="check">
          MARGIN <b>CHECK</b>
        </div>
        <div className="exec-check" data-exec="check">
          EXPOSURE <b>CHECK</b>
        </div>
        <div className="exec-check" data-exec="check">
          POSITION LIMIT <b>CHECK</b>
        </div>
        <div className="exec-check" data-exec="check">
          PRICE TOLERANCE <b>CHECK</b>
        </div>
        <div className="exec-accepted" data-exec="accepted">
          RISK ACCEPTED
        </div>
      </div>

      <div className="exec-match" data-exec="match">
        MATCH
      </div>

      <div className="exec-final" data-exec="final">
        <div className="exec-final-inner">
          <div className="exec-final-time">0.001000 s</div>
          <div className="exec-final-logo">777 RAPTOR</div>
          <div className="exec-final-line" data-exec="final-line" />
          <div className="exec-final-copy" data-exec="final-copy">
            THE FINAL 0.001 SECOND.
          </div>
          <div className="exec-final-tag" data-exec="final-tag">
            BUILT FOR THE MOMENTS YOU NEVER SEE.
          </div>
        </div>
      </div>

      <div className="exec-flash" data-exec="flash" />
      <div className="exec-scan" />
      <div className="exec-vignette" />
    </div>
  )
}
