'use client'

import { BoxGeometry, Mesh, PerspectiveCamera, Scene, ShaderMaterial, WebGLRenderer } from 'three'
import { cn } from '@/lib/utils'
import {
  type BackdropScene,
  isInteractiveTarget,
  trackPointer,
  useBackdropCanvas,
} from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * "Racing Lines" by raurir, ported.
 * https://codepen.io/raurir/pen/oXmEPM
 *
 * Two floors of glowing boxes — one above the camera, one below — racing
 * towards it out of the dark and wrapping round to come again. Each box is
 * shaded by its own fragment shader: brighter at its edges, fading with
 * distance ahead and off to the sides, so the rows read as streaks of light.
 * Now and then a box slides sideways into an empty lane, back or forward a
 * slot, or jumps to the other floor, and now and then one flashes white.
 *
 * Hold the pointer down and the whole field accelerates — from four units a
 * frame to thirty-four, easing in and out — and every box turns from its sea
 * green to a hot red, pulsing more often the faster it goes. Moving the pointer
 * banks and tilts the camera after it.
 *
 * The grid, the box size and gaps, the floor offset, the speeds and easing,
 * the colour ranges, both shaders, the camera, its field of view and its
 * banking, the warp odds and the pulse odds are the pen's, values included.
 *
 * What changed:
 *
 * - **Three.js, current.** The pen runs r71: uniforms carried a `type`, and
 *   each box built its own identical geometry. Here the uniforms are plain
 *   values and the boxes share one geometry, which draws exactly the same.
 * - **No GSAP.** The pen used TweenMax for the half-second slides; a slide is
 *   an ease-out over the same duration here, and the lane is released after
 *   the pen's 0.6 seconds, as its second tween does.
 * - **Its clock.** The pen moves everything a fixed step per frame; here those
 *   steps are taken at its 60 a second, whatever the screen's rate.
 * - **The pointer is the hero's.** Moving and holding count over this band,
 *   not the window, and never over a link or a button. The pen cancelled
 *   every mouse and touch event on the page to get its hold; that would take
 *   scrolling and clicking with it, so it is not done here.
 * - **Its size follows the band** rather than the window.
 */

const EMPTY = 'emptySlot'
type Floor = 'planeTop' | 'planeBottom'

const COLS = 20
const ROWS = 16
const GAP = 20
const SIZE = { width: 100, height: 30, depth: 150 }
const PLANE_OFFSET = 250
const ALL_ROWS_DEPTH = ROWS * (SIZE.depth + GAP)
// The pen measures the columns with the box depth, not its width, and the
// fade across depends on it.
const ALL_COLS_WIDTH = COLS * (SIZE.depth + GAP)

const SPEED_NORMAL = 4
const SPEED_FAST = 34

const STEP_RATE = 60
const MAX_STEPS = 4
/** Steps run before a reduced-motion band's only frame. */
const STILL_STEPS = 120

const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`

const FRAGMENT_SHADER = `
uniform float r;
uniform float g;
uniform float b;
uniform float distanceZ;
uniform float distanceX;
uniform float pulse;
uniform float speed;
varying vec2 vUv;
void main(void) {
  vec2 position = abs(-1.0 + 2.0 * vUv);
  float edging = abs((pow(position.y, 5.0) + pow(position.x, 5.0)) / 2.0);
  float perc = (0.2 * pow(speed + 1.0, 2.0) + edging * 0.8) * distanceZ * distanceX;
  float red = r * perc + pulse;
  float green = g * perc + pulse;
  float blue = b * perc + pulse;
  gl_FragColor = vec4(red, green, blue, 1.0);
}
`

type Rgb = { r: number; g: number; b: number }

type Uniforms = {
  r: { value: number }
  g: { value: number }
  b: { value: number }
  distanceX: { value: number }
  distanceZ: { value: number }
  pulse: { value: number }
  speed: { value: number }
}

type Box = {
  mesh: Mesh
  material: ShaderMaterial
  uniforms: Uniforms
  colours: { slow: Rgb; fast: Rgb }
  isWarping: boolean
  offset: { x: number; z: number }
  posZ: number
}

type Tween = {
  target: Record<string, number>
  key: string
  from: number
  to: number
  start: number
  duration: number
}

function num(min: number, max: number) {
  return Math.random() * (max - min) + min
}

/** GSAP 1's default ease, Power1.easeOut. */
function easeOut(t: number) {
  return 1 - (1 - t) * (1 - t)
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas })
  } catch {
    return null
  }
  renderer.setClearColor(0x000000, 1)

  const scene = new Scene()
  const camera = new PerspectiveCamera(100, 1, 1, 10000)
  scene.add(camera)

  const geometry = new BoxGeometry(SIZE.width, SIZE.height, SIZE.depth)

  let isMouseDown = false
  const mouse = { x: 0, y: 0 }
  const camPos = { x: 0, y: 0, z: 10 }
  let speed = SPEED_NORMAL
  /** Seconds on the band's own clock, for the slides. */
  let clock = 0
  let tweens: Tween[] = []
  const releases: { at: number; box: Box }[] = []

  const floors: Record<Floor, (Box | typeof EMPTY)[][]> = { planeBottom: [], planeTop: [] }
  const boxes: Box[] = []

  for (let j = 0; j < ROWS; j++) {
    floors.planeBottom[j] = []
    floors.planeTop[j] = []
    for (let i = 0; i < COLS; i++) {
      floors.planeBottom[j][i] = EMPTY
      floors.planeTop[j][i] = EMPTY
    }
  }

  const draw = (): Box => {
    const colours = {
      slow: { r: num(0, 0.2), g: num(0.5, 0.9), b: num(0.3, 0.7) },
      fast: { r: num(0.9, 1.0), g: num(0.1, 0.7), b: num(0.2, 0.5) },
    }
    const uniforms: Uniforms = {
      r: { value: colours.slow.r },
      g: { value: colours.slow.g },
      b: { value: colours.slow.b },
      distanceX: { value: 1.0 },
      distanceZ: { value: 1.0 },
      pulse: { value: 0 },
      speed: { value: speed },
    }
    const material = new ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
    })
    const mesh = new Mesh(geometry, material)
    return { mesh, material, uniforms, colours, isWarping: false, offset: { x: 0, z: 0 }, posZ: 0 }
  }

  const createBox = () => {
    const xi = Math.floor(Math.random() * COLS)
    const yi = Math.random() > 0.5 ? 1 : -1
    const floor: Floor = yi === -1 ? 'planeBottom' : 'planeTop'
    const zi = Math.floor(Math.random() * ROWS)

    const x = (xi - COLS / 2) * (SIZE.width + GAP)
    const y = yi * PLANE_OFFSET
    const z = zi * (SIZE.depth + GAP)

    if (floors[floor][zi][xi] === EMPTY) {
      const box = draw()
      box.mesh.position.y = y
      box.offset = { x, z: 0 }
      box.posZ = z
      floors[floor][zi][xi] = box
      boxes.push(box)
      scene.add(box.mesh)
    }
  }

  for (let i = 0; i < ROWS * COLS; i++) createBox()

  const tweenTo = (target: Record<string, number>, key: string, to: number, duration: number) => {
    tweens = tweens.filter((t) => !(t.target === target && t.key === key))
    tweens.push({ target, key, from: target[key], to, start: clock, duration })
  }

  const move = (x: number, floor: Floor, z: number) => {
    const box = floors[floor][z][x]
    if (box === EMPTY) return

    box.mesh.position.x = box.offset.x
    box.mesh.position.z = box.offset.z + box.posZ

    if (box.mesh.position.z > 0) box.posZ -= ALL_ROWS_DEPTH

    if (!box.isWarping && Math.random() > 0.999) {
      const dir = Math.floor(Math.random() * 5)
      let xn = x
      let zn = z
      let yn: Floor = floor
      let yi = 0
      let xo = 0
      let zo = 0
      switch (dir) {
        case 0:
          xn++
          xo = 1
          break
        case 1:
          xn--
          xo = -1
          break
        case 2:
          zn++
          zo = 1
          break
        case 3:
          zn--
          zo = -1
          break
        case 4:
          yn = floor === 'planeTop' ? 'planeBottom' : 'planeTop'
          yi = floor === 'planeTop' ? -1 : 1
          break
      }

      if (floors[yn][zn] && floors[yn][zn][xn] === EMPTY) {
        floors[floor][z][x] = EMPTY
        box.isWarping = true
        floors[yn][zn][xn] = box

        if (dir === 4) {
          tweenTo(box.mesh.position as unknown as Record<string, number>, 'y', yi * PLANE_OFFSET, 0.5)
        } else {
          tweenTo(box.offset, 'x', box.offset.x + xo * (SIZE.width + GAP), 0.5)
          tweenTo(box.offset, 'z', box.offset.z + zo * (SIZE.depth + GAP), 0.5)
        }
        releases.push({ at: clock + 0.6, box })
      }
    }
  }

  /** One of the pen's frames, minus the render. */
  const step = () => {
    clock += 1 / STEP_RATE

    tweens = tweens.filter((t) => {
      const p = Math.min(1, (clock - t.start) / t.duration)
      t.target[t.key] = t.from + (t.to - t.from) * easeOut(p)
      return p < 1
    })
    for (let i = releases.length - 1; i >= 0; i--) {
      if (releases[i].at <= clock) {
        releases[i].box.isWarping = false
        releases.splice(i, 1)
      }
    }

    speed -= (speed - (isMouseDown ? SPEED_FAST : SPEED_NORMAL)) * 0.05

    for (const box of boxes) {
      box.posZ += speed
      const u = box.uniforms

      u.distanceZ.value = 1 - ((ALL_ROWS_DEPTH - box.posZ) / ALL_ROWS_DEPTH - 1)
      u.distanceX.value = 1 - Math.abs(box.mesh.position.x) / (ALL_COLS_WIDTH / 3)

      const colour = isMouseDown ? box.colours.fast : box.colours.slow
      u.r.value -= (u.r.value - colour.r) * 0.1
      u.g.value -= (u.g.value - colour.g) * 0.1
      u.b.value -= (u.b.value - colour.b) * 0.1

      const currentSpeed = (speed - SPEED_NORMAL) / (SPEED_FAST - SPEED_NORMAL)
      u.speed.value = currentSpeed

      if (Math.random() > 0.99995 - currentSpeed * 0.005) u.pulse.value = 1
      u.pulse.value -= (u.pulse.value * 0.1) / (currentSpeed + 1)
    }

    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        move(i, 'planeBottom', j)
        move(i, 'planeTop', j)
      }
    }

    camPos.x -= (camPos.x - mouse.x * 400) * 0.02
    camPos.y -= (camPos.y - mouse.y * 150) * 0.05
    camPos.z = -100
    camera.position.set(camPos.x, camPos.y, camPos.z)
    camera.rotation.y = camPos.x / -1000
    camera.rotation.x = camPos.y / 1000
    camera.rotation.z = (camPos.x - mouse.x * 400) / 2000
  }

  const untrack = trackPointer(host, (nx, ny) => {
    mouse.x = nx * 2 - 1
    mouse.y = -(ny * 2) + 1
  })

  const section = host.parentElement ?? host
  const down = (e: PointerEvent) => {
    if (isInteractiveTarget(e.target)) return
    isMouseDown = true
  }
  const up = () => {
    isMouseDown = false
  }
  section.addEventListener('pointerdown', down)
  window.addEventListener('pointerup', up)
  window.addEventListener('pointercancel', up)

  let stepsTaken = -1

  return {
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    },
    frame(seconds) {
      if (stepsTaken < 0 && motionIsReduced()) {
        for (let i = 0; i < STILL_STEPS; i++) step()
      }
      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < steps; i++) step()
      renderer.render(scene, camera)
    },
    dispose() {
      untrack()
      section.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      for (const box of boxes) box.material.dispose()
      geometry.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function RacinglinesBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.5 })
  return <div ref={hostRef} className={cn('pen-scene', className)} aria-hidden />
}
