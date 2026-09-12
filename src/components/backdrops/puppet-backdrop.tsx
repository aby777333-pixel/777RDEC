'use client'

import { useEffect, useRef } from 'react'
import { Special_Elite } from 'next/font/google'
import { cn } from '@/lib/utils'

/**
 * "Puppet On Strings" by wolfscot, ported.
 *
 * A marionette on a lit stage: five strings run from a controller's fingertips
 * to head, hands and knees, and the whole rig moves through fifteen moods —
 * idle, wave, walk, dance, spin, glitch, collapse — each with its own pose,
 * tempo, spotlight colour, filter and line of dialogue.
 *
 * Four things had to change to make a page into a hero backdrop:
 *
 * 1. **It drives itself.** The pen is operated by a fifteen-button panel and
 *    the keys q-w-e-r-t-y-u-i-a-s-d-f-g-h-j. A panel of buttons behind a
 *    headline is unreadable, and a document-level key handler would have eaten
 *    every keystroke on the site, the search box included. The moods now cycle
 *    on a timer; nothing is bound to the keyboard.
 * 2. **No cursor takeover.** The pen sets `cursor: none` on `body` and draws
 *    its own dot. Here the system cursor stays; the pointer still leans the
 *    puppet and parallaxes the fog, but only while it is over this section.
 * 3. **Container coordinates.** The strings and the particle field were
 *    measured against the viewport — `position: fixed`, `100vw/100vh`,
 *    `clientX`. In a band that scrolls, strings drawn that way come loose from
 *    the puppet. Everything is now measured against this element.
 * 4. **Scaled to the band.** The pen is laid out in px for a full window. The
 *    rig keeps its natural 500x780 and is scaled to whatever hero it lands in,
 *    so the proportions are the pen's at any size.
 *
 * It also stops when it should: the loop never starts under
 * `prefers-reduced-motion`, and it is suspended while the band is off-screen.
 */

/** The typewriter face the pen sets its mood label and dialogue in. */
const stageType = Special_Elite({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-stage',
})

/** The rig's natural box. Every offset inside it is one of the pen's px. */
const RIG_W = 500
const RIG_H = 780

type Mood = {
  y: number
  rot: number
  speed: number
  armL: number
  armR: number
  legL: number
  legR: number
  amp: number
  color: string
  filter: string
  quote: string
  head?: number
  legLower?: number
  type?: 'cycle' | 'leftOnly' | 'spin'
}

/** The pen's own table — poses, tempos, spotlight colours and dialogue. */
const MOODS: Record<string, Mood> = {
  idle:     { y: 0,    rot: 0,  speed: 0.02,  armL: 15,   armR: -15, legL: 5,    legR: -5,    amp: 2,  color: 'rgba(212,175,55,0.2)',  filter: 'none',                           quote: '…awaiting instruction…' },
  dance:    { y: -40,  rot: 10, speed: 0.15,  armL: -120, armR: 120, legL: 40,   legR: -40,   amp: 30, color: 'rgba(255,50,200,0.3)',  filter: 'saturate(1.5)',                  quote: 'the strings never stop singing', type: 'cycle' },
  walk:     { y: -10,  rot: 5,  speed: 0.12,  armL: 40,   armR: -40, legL: 30,   legR: -30,   amp: 40, color: 'rgba(100,200,255,0.2)', filter: 'none',                           quote: 'going somewhere, nowhere', type: 'cycle' },
  wave:     { y: 0,    rot: -5, speed: 0.1,   armL: -150, armR: -15, legL: 5,    legR: -5,    amp: 20, color: 'rgba(200,255,100,0.2)', filter: 'none',                           quote: 'hello, old friend', type: 'leftOnly' },
  zombie:   { y: 0,    rot: 15, speed: 0.03,  armL: -90,  armR: 90,  legL: 10,   legR: -10,   amp: 5,  color: 'rgba(100,255,100,0.15)', filter: 'grayscale(0.7) brightness(0.8)', quote: 'braiiins……' },
  sit:      { y: 60,   rot: 0,  speed: 0.02,  armL: 20,   armR: -20, legL: -90,  legR: 90,    amp: 2,  color: 'rgba(180,120,255,0.2)', filter: 'none',                           quote: 'rest. observe. wait.', legLower: 90 },
  jump:     { y: -180, rot: 0,  speed: 0.05,  armL: -160, armR: 160, legL: 80,   legR: -80,   amp: 5,  color: 'rgba(255,220,50,0.35)', filter: 'brightness(1.1)',                quote: 'weightless' },
  pray:     { y: 70,   rot: 10, speed: 0.02,  armL: -20,  armR: 20,  legL: 110,  legR: -110,  amp: 2,  color: 'rgba(255,200,100,0.25)', filter: 'sepia(0.3)',                    quote: 'grant me one more motion', head: 50, legLower: 0 },
  glitch:   { y: 0,    rot: 0,  speed: 0.8,   armL: -90,  armR: 90,  legL: 0,    legR: 0,     amp: 60, color: 'rgba(0,255,255,0.3)',   filter: 'hue-rotate(180deg)',             quote: 'ER̷R̸O̷R̴ ̶4̷0̸4̵ ̸P̶U̸P̵P̴E̸T̷ ̵N̸O̵T̴ ̶F̵O̸U̵N̷D̶' },
  drunk:    { y: 10,   rot: 20, speed: 0.03,  armL: 40,   armR: -20, legL: 10,   legR: -20,   amp: 25, color: 'rgba(255,100,50,0.2)',  filter: 'blur(0.5px)',                    quote: "jus' one more pull of the string…" },
  bow:      { y: 40,   rot: 0,  speed: 0.04,  armL: 20,   armR: -20, legL: 0,    legR: 0,     amp: 2,  color: 'rgba(212,175,55,0.3)',  filter: 'none',                           quote: 'for you, the audience', head: 45 },
  scare:    { y: -10,  rot: 0,  speed: 0.4,   armL: -140, armR: 140, legL: -20,  legR: 20,    amp: 10, color: 'rgba(255,50,50,0.35)',  filter: 'contrast(1.3)',                  quote: 'BOO' },
  float:    { y: -120, rot: 5,  speed: 0.02,  armL: -60,  armR: 60,  legL: 30,   legR: -30,   amp: 10, color: 'rgba(150,200,255,0.2)', filter: 'brightness(1.05)',               quote: 'untethered from gravity' },
  spin:     { y: -20,  rot: 0,  speed: 0.3,   armL: -90,  armR: 90,  legL: 0,    legR: 0,     amp: 5,  color: 'rgba(255,180,255,0.3)', filter: 'none',                           quote: 'round and round forever', type: 'spin' },
  collapse: { y: 120,  rot: 45, speed: 0.005, armL: 80,   armR: 70,  legL: 60,   legR: 50,    amp: 0,  color: 'rgba(100,100,100,0.2)', filter: 'brightness(0.7)',                quote: '…the strings go slack' },
}

const MOOD_KEYS = Object.keys(MOODS)

/** How long each mood holds before the rig moves on. */
const MOOD_MS = 7000

const BAR_COUNT = 40
const DUST_COUNT = 60

type Particle = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; life: number }
type Burst = { x: number; y: number; vx: number; vy: number; size: number; alpha: number; decay: number }

export function PuppetBackdrop({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const q = <T extends Element>(sel: string) => root.querySelector(sel) as T | null
    const rig = q<HTMLDivElement>('.rig')
    const master = q<HTMLDivElement>('.puppet-wrapper')
    const hand = q<SVGSVGElement>('.controller-hand')
    const stringSvg = q<SVGSVGElement>('.string-svg')
    const canvas = q<HTMLCanvasElement>('.particle-canvas')
    const ctx = canvas?.getContext('2d')
    if (!rig || !master || !hand || !stringSvg || !canvas || !ctx) return

    const spotlight = q<HTMLDivElement>('.spotlight')!
    const scanlines = q<HTMLDivElement>('.scanlines')!
    const shadow = q<HTMLDivElement>('.shadow')!
    const streaks = q<HTMLDivElement>('.streaks')!
    const moodLabel = q<HTMLDivElement>('.mood-label')!
    const quoteDisplay = q<HTMLDivElement>('.quote-display')!
    const fog = q<HTMLDivElement>('.fog')!
    const visualizer = q<HTMLDivElement>('.visualizer')!
    const chest = q<HTMLDivElement>('.chest')!

    const parts = {
      head: q<HTMLDivElement>('.head')!,
      armLU: q<HTMLDivElement>('.arm-l-u')!,
      armRU: q<HTMLDivElement>('.arm-r-u')!,
      legLU: q<HTMLDivElement>('.leg-l-u')!,
      legLL: q<HTMLDivElement>('.leg-l-l')!,
      legRU: q<HTMLDivElement>('.leg-r-u')!,
      legRL: q<HTMLDivElement>('.leg-r-l')!,
      handL: q<HTMLDivElement>('.hand-l')!,
      handR: q<HTMLDivElement>('.hand-r')!,
    }
    const tips = [1, 2, 3, 4, 5].map((i) => q<SVGCircleElement>(`.tip-${i}`)!)
    const strings = {
      head: q<SVGPathElement>('.str-head')!,
      handL: q<SVGPathElement>('.str-hand-l')!,
      handR: q<SVGPathElement>('.str-hand-r')!,
      kneeL: q<SVGPathElement>('.str-leg-l')!,
      kneeR: q<SVGPathElement>('.str-leg-r')!,
    }

    const state = {
      mood: 'idle',
      time: 0,
      currentSpeed: 0.02,
      mouseX: 0,
      mouseY: 0,
      particles: [] as Particle[],
      bursts: [] as Burst[],
      vTargets: [] as number[],
      breathPhase: 0,
    }

    /* ── canvas, in this element's pixels rather than the window's ────── */
    let cw = 0
    let ch = 0
    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cw = root!.clientWidth
      ch = root!.clientHeight
      canvas!.width = Math.max(1, Math.round(cw * dpr))
      canvas!.height = Math.max(1, Math.round(ch * dpr))
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    /* ── the rig keeps the pen's 500x780 and is scaled to the band ────── */
    function layout() {
      const h = root!.clientHeight
      const w = root!.clientWidth
      // Height first, so it never outgrows the hero; width second, so it never
      // spills out of the left column it was given.
      const scale = Math.min(h / RIG_H, (w * 0.62) / RIG_W)
      rig!.style.setProperty('--s', String(scale))
    }

    resizeCanvas()
    layout()

    for (let i = 0; i < DUST_COUNT; i++) {
      state.particles.push({
        x: Math.random() * cw,
        y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.35 + 0.05,
        life: Math.random(),
      })
    }

    function spawnBurst(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 4 + 1
        state.bursts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 3 + 1,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
        })
      }
    }

    /* ── visualizer bars ──────────────────────────────────────────────── */
    const vBars: HTMLDivElement[] = []
    for (let i = 0; i < BAR_COUNT; i++) {
      const bar = document.createElement('div')
      bar.className = 'v-bar'
      bar.style.height = '3px'
      visualizer.appendChild(bar)
      vBars.push(bar)
      state.vTargets.push(3)
    }
    const INTENSITY: Record<string, number> = {
      idle: 2, dance: 15, walk: 8, wave: 5, zombie: 3, sit: 2, jump: 12, pray: 3,
      glitch: 20, drunk: 6, bow: 4, scare: 18, float: 7, spin: 14, collapse: 1,
    }
    function updateVisualizer(mood: string) {
      const base = INTENSITY[mood] || 4
      state.vTargets = state.vTargets.map((_, i) => {
        const center = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2)
        return Math.max(3, Math.random() * base * (1.5 - center) + 3)
      })
    }

    /* ── streaks for dance / spin ─────────────────────────────────────── */
    for (let i = 0; i < 12; i++) {
      const s = document.createElement('div')
      s.className = 'streak'
      s.style.cssText = `left:${Math.random() * 100}%;height:${Math.random() * 120 + 40}px;opacity:${
        Math.random() * 0.3 + 0.05
      };animation-duration:${Math.random() * 2 + 1}s;animation-delay:${Math.random() * 2}s;`
      streaks.appendChild(s)
    }

    /* ── mood transition ──────────────────────────────────────────────── */
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms)
      timers.push(t)
      return t
    }
    let quoteTimer: ReturnType<typeof setTimeout> | null = null

    function setMood(moodKey: string) {
      state.mood = moodKey
      const mood = MOODS[moodKey]

      // Burst at the puppet, in this element's pixels.
      const p = master!.getBoundingClientRect()
      const r = root!.getBoundingClientRect()
      spawnBurst(p.left + p.width / 2 - r.left, p.top + p.height / 2 - r.top, 25)

      Object.values(strings).forEach((s) => {
        s.style.stroke = 'rgba(212,175,55,0.8)'
        later(() => {
          s.style.stroke = 'var(--string)'
        }, 400)
      })

      spotlight.style.background = `conic-gradient(from 170deg at 50% 0%, transparent 0deg, ${mood.color} 15deg, transparent 30deg)`
      master!.style.filter = mood.filter || 'none'
      scanlines.style.opacity = moodKey === 'glitch' ? '1' : '0'
      master!.classList.toggle('glitch-active', moodKey === 'glitch')
      streaks.style.opacity = moodKey === 'dance' || moodKey === 'spin' ? '1' : '0'

      if (moodKey === 'jump' || moodKey === 'float') {
        shadow.style.width = '30px'
        shadow.style.opacity = '0.3'
      } else if (moodKey === 'sit' || moodKey === 'collapse') {
        shadow.style.width = '120px'
        shadow.style.opacity = '0.7'
      } else {
        shadow.style.width = '80px'
        shadow.style.opacity = '0.5'
      }

      moodLabel.textContent = `— ${moodKey} —`
      moodLabel.style.color = 'rgba(212,175,55,0.6)'
      later(() => {
        moodLabel.style.color = 'rgba(255,255,255,0.2)'
      }, 800)

      if (quoteTimer) clearTimeout(quoteTimer)
      quoteDisplay.style.opacity = '0'
      quoteTimer = later(() => {
        quoteDisplay.textContent = mood.quote || ''
        quoteDisplay.style.opacity = '1'
        quoteTimer = later(() => {
          quoteDisplay.style.opacity = '0'
        }, 3500)
      }, 300)
    }

    /* ── the loop ─────────────────────────────────────────────────────── */
    let spinAngle = 0

    function drawStrings() {
      const box = stringSvg!.getBoundingClientRect()
      // The rig is uniformly scaled, so one factor converts screen px back
      // into the SVG's own 500x780 units.
      const s = box.width / RIG_W || 1
      const connections = [
        { start: tips[2], end: parts.head, path: strings.head },
        { start: tips[0], end: parts.handL, path: strings.handL },
        { start: tips[4], end: parts.handR, path: strings.handR },
        { start: tips[1], end: parts.legLL, path: strings.kneeL },
        { start: tips[3], end: parts.legRL, path: strings.kneeR },
      ]
      connections.forEach((conn) => {
        const a = conn.start.getBoundingClientRect()
        const b = conn.end.getBoundingClientRect()
        const x1 = (a.left + a.width / 2 - box.left) / s
        const y1 = (a.top + a.height / 2 - box.top) / s
        const x2 = (b.left + b.width / 2 - box.left) / s
        const y2 = (b.top - box.top) / s
        const sag = Math.sin(state.time * 2) * 8
        conn.path.setAttribute('d', `M${x1},${y1} Q${(x1 + x2) / 2 + sag},${(y1 + y2) / 2} ${x2},${y2}`)
      })
    }

    function updateParticles() {
      const speedMult = state.currentSpeed / 0.02
      state.particles.forEach((p) => {
        p.x += p.vx + Math.sin(state.time * 0.3 + p.y * 0.01) * 0.2
        p.y += p.vy - speedMult * 0.05
        p.life += 0.002
        if (p.y < -5 || p.life > 1) {
          p.x = Math.random() * cw
          p.y = ch + 5
          p.life = 0
          p.alpha = Math.random() * 0.3 + 0.05
        }
        const alpha = p.alpha * Math.sin(p.life * Math.PI)
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(212,175,55,${alpha})`
        ctx!.fill()
      })
    }

    function updateBursts() {
      state.bursts = state.bursts.filter((b) => b.alpha > 0.02)
      state.bursts.forEach((b) => {
        b.x += b.vx
        b.y += b.vy
        b.vy += 0.15
        b.alpha -= b.decay
        ctx!.beginPath()
        ctx!.arc(b.x, b.y, b.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(212,175,55,${b.alpha})`
        ctx!.fill()
      })
    }

    function pose() {
      const mood = MOODS[state.mood] || MOODS.idle
      state.time += state.currentSpeed
      state.currentSpeed += (mood.speed - state.currentSpeed) * 0.1

      const mouseOffX = (state.mouseX / Math.max(1, cw) - 0.5) * 15
      const swayX = Math.sin(state.time * 0.5) * mood.amp + mouseOffX * 0.3
      const swayY = Math.cos(state.time * 0.8) * (mood.amp * 0.5) + mood.y

      if (state.mood === 'spin') {
        spinAngle += 4
        master!.style.transform = `translate(${swayX}px, ${swayY}px) rotate(${spinAngle}deg)`
      } else {
        spinAngle = 0
        const bodyRot = mood.rot + Math.sin(state.time) * 2
        master!.style.transform = `translate(${swayX}px, ${swayY}px) rotate(${bodyRot}deg)`
      }

      hand!.style.transform = `translateX(calc(-50% + ${swayX * 0.4}px)) translateY(${Math.sin(state.time) * 8}px)`

      let oscL: number
      let oscR: number
      if (mood.type === 'cycle') {
        oscL = Math.sin(state.time * 5) * mood.amp
        oscR = Math.sin(state.time * 5 + Math.PI) * mood.amp
      } else if (mood.type === 'leftOnly') {
        oscL = Math.sin(state.time * 5) * mood.amp
        oscR = Math.sin(state.time) * 2
      } else if (mood.type === 'spin') {
        oscL = Math.sin(state.time * 8) * 30
        oscR = -oscL
      } else {
        oscL = Math.sin(state.time * 5) * (mood.amp * 0.2)
        oscR = -oscL
      }

      parts.armLU.style.transform = `rotate(${mood.armL + oscL}deg)`
      parts.armRU.style.transform = `rotate(${mood.armR + oscR}deg)`
      parts.legLU.style.transform = `rotate(${mood.legL + oscR}deg)`
      parts.legRU.style.transform = `rotate(${mood.legR + oscL}deg)`

      const lLower = mood.legLower !== undefined ? mood.legLower : 10
      parts.legLL.style.transform = `rotate(${lLower + (oscR > 0 ? oscR * 0.5 : 0)}deg)`
      parts.legRL.style.transform = `rotate(${-lLower + (oscL < 0 ? oscL * 0.5 : 0)}deg)`
      parts.head.style.transform = `rotate(${mood.head !== undefined ? mood.head : Math.sin(state.time) * 5}deg)`

      state.breathPhase += 0.04
      chest.style.transform = `scaleX(${1 + Math.sin(state.breathPhase) * 0.015})`

      drawStrings()

      ctx!.clearRect(0, 0, cw, ch)
      updateParticles()
      updateBursts()

      if (Math.random() < 0.15) updateVisualizer(state.mood)
      vBars.forEach((bar, i) => {
        const curr = parseFloat(bar.style.height) || 3
        bar.style.height = curr + (state.vTargets[i] - curr) * 0.25 + 'px'
      })
    }

    /* ── wiring ───────────────────────────────────────────────────────── */
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let running = false

    function tick() {
      pose()
      frame = requestAnimationFrame(tick)
    }
    function start() {
      if (running || reduced.matches) return
      running = true
      frame = requestAnimationFrame(tick)
    }
    function stop() {
      running = false
      cancelAnimationFrame(frame)
    }

    const onResize = () => {
      resizeCanvas()
      layout()
    }
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(root)

    // Nothing to animate while the band is scrolled away.
    const visibility = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: '100px' },
    )
    visibility.observe(root)

    const onPointerMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      state.mouseX = e.clientX - r.left
      state.mouseY = e.clientY - r.top
      const x = (state.mouseX / Math.max(1, r.width) - 0.5) * 30
      const y = (state.mouseY / Math.max(1, r.height) - 0.5) * 30
      fog.style.transform = `translate(${x}px, ${y}px)`
    }
    root.addEventListener('pointermove', onPointerMove)

    const onReducedChange = () => (reduced.matches ? stop() : start())
    reduced.addEventListener('change', onReducedChange)

    setMood('idle')
    // One frame regardless, so a reduced-motion visitor still gets the scene
    // posed and strung rather than an empty stage.
    pose()

    let moodIndex = 0
    const cycle = setInterval(() => {
      if (!running) return
      moodIndex = (moodIndex + 1) % MOOD_KEYS.length
      setMood(MOOD_KEYS[moodIndex])
    }, MOOD_MS)

    return () => {
      stop()
      clearInterval(cycle)
      timers.forEach(clearTimeout)
      // The bars and streaks are built here, so they have to be taken down
      // here too, or a remount leaves two of everything.
      visualizer.replaceChildren()
      streaks.replaceChildren()
      resizeObserver.disconnect()
      visibility.disconnect()
      root.removeEventListener('pointermove', onPointerMove)
      reduced.removeEventListener('change', onReducedChange)
    }
  }, [])

  return (
    <div ref={rootRef} className={cn('puppet-scene', stageType.variable, className)} aria-hidden>
      <div className="fog" />
      <canvas className="particle-canvas" />
      <div className="streaks" />
      <div className="scanlines" />
      <div className="visualizer" />

      <div className="rig">
        <div className="spotlight" />
        <div className="shadow" />
        <div className="mood-label">— idle —</div>

        <svg className="controller-hand" viewBox="0 0 500 300">
          <path
            d="M150,250 Q160,150 200,100 Q210,80 230,85 Q250,90 240,120 L240,250 M250,250 L250,50 Q260,30 280,35 Q300,40 290,70 L290,250 M300,250 L300,30 Q310,10 330,15 Q350,20 340,50 L340,250 M350,250 L350,60 Q360,40 380,45 Q400,50 390,80 L390,250 M400,250 Q450,200 450,150 Q450,130 430,135 Q410,140 410,170 L410,250"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            fill="none"
          />
          <circle className="tip-1" cx="215" cy="85" r="4" fill="var(--accent)" opacity="0.9" />
          <circle className="tip-2" cx="275" cy="35" r="4" fill="var(--accent)" opacity="0.9" />
          <circle className="tip-3" cx="325" cy="15" r="4" fill="var(--accent)" opacity="0.9" />
          <circle className="tip-4" cx="375" cy="45" r="4" fill="var(--accent)" opacity="0.9" />
          <circle className="tip-5" cx="430" cy="135" r="4" fill="var(--accent)" opacity="0.9" />
          <circle cx="215" cy="85" r="8" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.2" />
          <circle cx="325" cy="15" r="8" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.2" />
          <circle cx="430" cy="135" r="8" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.2" />
        </svg>

        <svg className="string-svg" viewBox={`0 0 ${RIG_W} ${RIG_H}`}>
          <path className="string-path str-head" />
          <path className="string-path str-hand-l" />
          <path className="string-path str-hand-r" />
          <path className="string-path str-leg-l" />
          <path className="string-path str-leg-r" />
        </svg>

        <div className="puppet-wrapper">
          <div className="part head" />
          <div className="part neck" />
          <div className="part chest" />
          <div className="part abs" />
          <div className="part pelvis" />

          <div className="part upper-limb shoulder-l arm-l-u">
            <div className="part lower-limb arm-l-l">
              <div className="part hand-foot hand-l" />
            </div>
          </div>
          <div className="part upper-limb shoulder-r arm-r-u">
            <div className="part lower-limb arm-r-l">
              <div className="part hand-foot hand-r" />
            </div>
          </div>
          <div className="part upper-limb hip-l leg-l-u">
            <div className="part lower-limb leg-l-l">
              <div className="part hand-foot foot-l" />
            </div>
          </div>
          <div className="part upper-limb hip-r leg-r-u">
            <div className="part lower-limb leg-r-l">
              <div className="part hand-foot foot-r" />
            </div>
          </div>
        </div>

        <div className="quote-display" />
      </div>
    </div>
  )
}
