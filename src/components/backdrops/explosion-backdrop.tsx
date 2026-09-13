'use client'

import {
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from 'three'
import { cn } from '@/lib/utils'
import { type BackdropScene, isInteractiveTarget, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Threejs Particle Explosion" by Xanmia, ported.
 * https://codepen.io/Xanmia/pen/nqyMgJ
 *
 * A thousand square points burst from one spot and fly outward in every
 * direction at a constant speed, forever, in one of the pen's five colours.
 * Every press adds another burst, somewhere at random in a four-thousand-unit
 * square around the middle of the view — often off the edge of it — so the
 * band fills with drifting clouds of colour the more it is pressed.
 *
 * The settings (speed, count, size, spread, palette), the camera and the
 * "Click Anywhere For More" tag are the pen's, and so are two of its quirks,
 * because they are what it looks like:
 *
 * - Every burst takes its thousand directions from the same first thousand the
 *   pen ever generated, so every burst is the same shape.
 * - The colour is picked with `Math.round(Math.random() * colors.length)`,
 *   which can land one past the end of the list. three then leaves the
 *   material at its default, white — so a burst is white more often than any
 *   other colour.
 *
 * What changed:
 *
 * - **three r61 to today.** `Geometry`, `ParticleSystem` and
 *   `ParticleBasicMaterial` are `BufferGeometry`, `Points` and
 *   `PointsMaterial` now; the points are the same size-attenuated squares.
 * - **A press on the band, not the window.** A press on a link or a button in
 *   the hero is left alone, and the pen's `preventDefault` is gone, so text in
 *   the hero can still be selected.
 * - **Its clock.** The pen moves every point a fixed step per frame; here those
 *   steps are taken at its 60 a second, whatever the screen's rate.
 */

const MOVEMENT_SPEED = 80
const TOTAL_OBJECTS = 1000
const OBJECT_SIZE = 10
const SIZE_RANDOMNESS = 4000
const COLORS = [0xff0fff, 0xccff00, 0xff000f, 0x996600, 0xffffff] as const

const STEP_RATE = 60
const MAX_STEPS = 4

type Burst = {
  geometry: BufferGeometry
  material: PointsMaterial
  positions: Float32Array
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas })
  } catch {
    host.dataset.gl = 'off'
    return null
  }

  const section = host.parentElement ?? host
  const camera = new PerspectiveCamera(75, 1, 1, 10000)
  camera.position.z = 1000
  const scene = new Scene()

  /** The pen's global direction list. Only the first thousand are ever read. */
  const dirs: { x: number; y: number; z: number }[] = []
  const parts: Burst[] = []

  const explode = (x: number, y: number) => {
    const positions = new Float32Array(TOTAL_OBJECTS * 3)
    for (let i = 0; i < TOTAL_OBJECTS; i++) {
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = 0
      dirs.push({
        x: Math.random() * MOVEMENT_SPEED - MOVEMENT_SPEED / 2,
        y: Math.random() * MOVEMENT_SPEED - MOVEMENT_SPEED / 2,
        z: Math.random() * MOVEMENT_SPEED - MOVEMENT_SPEED / 2,
      })
    }
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(positions, 3))
    // One past the end of the list is possible, and means the default: white.
    const color = COLORS[Math.round(Math.random() * COLORS.length)] ?? 0xffffff
    const material = new PointsMaterial({ size: OBJECT_SIZE, color })
    const points = new Points(geometry, material)
    // Positions move every frame; the bounds computed at the start say
    // nothing about where they are now.
    points.frustumCulled = false
    scene.add(points)
    parts.push({ geometry, material, positions })
  }

  const step = () => {
    for (const part of parts) {
      let pCount = TOTAL_OBJECTS
      while (pCount--) {
        part.positions[pCount * 3 + 1] += dirs[pCount].y
        part.positions[pCount * 3] += dirs[pCount].x
        part.positions[pCount * 3 + 2] += dirs[pCount].z
      }
      part.geometry.attributes.position.needsUpdate = true
    }
  }

  explode(0, 0)

  const onPointerDown = (e: PointerEvent) => {
    if (isInteractiveTarget(e.target)) return
    if (e.target instanceof Element && e.target.closest('[data-pen-controls]')) return
    explode(
      Math.random() * SIZE_RANDOMNESS - SIZE_RANDOMNESS / 2,
      Math.random() * SIZE_RANDOMNESS - SIZE_RANDOMNESS / 2,
    )
    renderer.render(scene, camera)
  }
  section.addEventListener('pointerdown', onPointerDown)

  let stepsTaken = -1

  return {
    resize(w, h, dpr) {
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.render(scene, camera)
    },
    frame(seconds) {
      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      if (steps === 0) return
      for (let i = 0; i < steps; i++) step()
      renderer.render(scene, camera)
    },
    dispose() {
      section.removeEventListener('pointerdown', onPointerDown)
      for (const part of parts) {
        part.geometry.dispose()
        part.material.dispose()
      }
      parts.length = 0
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function ExplosionBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return (
    <>
      <div ref={hostRef} className={cn('pen-scene pen-scene--explosion', className)} aria-hidden />
      <div className="explosion-dir" aria-hidden>
        Click Anywhere For More
      </div>
    </>
  )
}
