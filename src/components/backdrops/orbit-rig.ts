import { type PerspectiveCamera, Spherical, Vector3 } from 'three'
import { isInteractiveTarget } from './use-backdrop-canvas'

/**
 * OrbitControls, for a pen that has them and has been made into a hero band.
 *
 * Three pens on the company pages drive their camera with three's
 * OrbitControls — auto-rotation, damping, a drag to turn it, a wheel to zoom.
 * All of that is the pen's nature and is kept, with the pen's values. What
 * cannot be kept is how OrbitControls listens: it wants an element of its own,
 * captures the pointer on press, and takes every wheel event. In a hero, that
 * element sits under the headline and its links — captured, a click on a
 * button turns the scene and goes nowhere — and a wheel that zooms is a page
 * that will not scroll.
 *
 * So this is the same arithmetic, listening differently:
 *
 * - **Drag** is heard on the hero section, from the mouse or a pen, and a press
 *   on a link, a button or a pen's own controls (`[data-pen-controls]`) is
 *   left alone. Touch is left to scroll the page.
 * - **Zoom** is the wheel with Ctrl held, which is also what a trackpad pinch
 *   sends. A plain wheel scrolls the page, as it does everywhere else.
 * - **Update** steps at 60 a second, because OrbitControls advances once per
 *   animation frame and a pen written on a 60Hz screen auto-rotates at that
 *   pace; on a 120Hz screen it would otherwise spin at double speed.
 */

export type OrbitOptions = {
  dampingFactor: number
  autoRotateSpeed: number
  rotateSpeed?: number
  zoomSpeed?: number
  enableZoom?: boolean
  minDistance?: number
  maxDistance?: number
}

export type OrbitRig = {
  /** Advance to `seconds`, taking as many 60Hz updates as are due. */
  frame: (seconds: number) => void
  /** Apply pending input once, without auto-rotating — for a paused band. */
  nudge: () => void
  dispose: () => void
}

/** OrbitControls keeps the polar angle this far off the poles. */
const EPS = 0.000001
const STEP_RATE = 60
const MAX_STEPS = 4

export function createOrbitRig(
  camera: PerspectiveCamera,
  target: Vector3,
  host: HTMLElement,
  options: OrbitOptions,
  /** Called after input when the band may be paused and needs a frame drawn. */
  onInput?: () => void,
): OrbitRig {
  const {
    dampingFactor,
    autoRotateSpeed,
    rotateSpeed = 1,
    zoomSpeed = 1,
    enableZoom = true,
    minDistance = 0,
    maxDistance = Infinity,
  } = options

  const section = host.parentElement ?? host
  const spherical = new Spherical()
  const sphericalDelta = new Spherical(0, 0, 0)
  const offset = new Vector3()
  let scale = 1
  let stepsTaken = -1

  const update = (autoRotate: boolean) => {
    offset.copy(camera.position).sub(target)
    spherical.setFromVector3(offset)

    // OrbitControls' auto-rotation with no delta time: a turn a minute at
    // speed 1, taken per update.
    if (autoRotate) sphericalDelta.theta -= ((2 * Math.PI) / 60 / 60) * autoRotateSpeed

    spherical.theta += sphericalDelta.theta * dampingFactor
    spherical.phi += sphericalDelta.phi * dampingFactor
    spherical.phi = Math.max(EPS, Math.min(Math.PI - EPS, spherical.phi))
    spherical.radius = Math.max(minDistance, Math.min(maxDistance, spherical.radius * scale))

    offset.setFromSpherical(spherical)
    camera.position.copy(target).add(offset)
    camera.lookAt(target)

    sphericalDelta.theta *= 1 - dampingFactor
    sphericalDelta.phi *= 1 - dampingFactor
    scale = 1
  }

  // ---- drag ----
  let dragging = false
  let lastX = 0
  let lastY = 0
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || e.pointerType === 'touch') return
    if (isInteractiveTarget(e.target)) return
    if (e.target instanceof Element && e.target.closest('[data-pen-controls]')) return
    dragging = true
    lastX = e.clientX
    lastY = e.clientY
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return
    const height = Math.max(1, host.clientHeight)
    sphericalDelta.theta -= ((2 * Math.PI * (e.clientX - lastX)) / height) * rotateSpeed
    sphericalDelta.phi -= ((2 * Math.PI * (e.clientY - lastY)) / height) * rotateSpeed
    lastX = e.clientX
    lastY = e.clientY
    onInput?.()
  }
  const onPointerUp = () => {
    dragging = false
  }

  // ---- zoom ----
  const onWheel = (e: WheelEvent) => {
    if (!enableZoom || !e.ctrlKey) return
    e.preventDefault()
    // OrbitControls' zoom scale for one wheel event.
    const step = Math.pow(0.95, zoomSpeed * Math.abs(e.deltaY * 0.01))
    if (e.deltaY < 0) scale *= step
    else if (e.deltaY > 0) scale /= step
    onInput?.()
  }

  section.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  section.addEventListener('wheel', onWheel, { passive: false })

  return {
    frame(seconds) {
      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < steps; i++) update(true)
    },
    nudge() {
      update(false)
    },
    dispose() {
      section.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      section.removeEventListener('wheel', onWheel)
    },
  }
}
