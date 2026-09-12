'use client'

import {
  CylinderGeometry,
  Group,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Explosion of pyramids" by Mamboleoo, ported.
 * https://codepen.io/Mamboleoo/pen/ZGygyy
 *
 * A hundred and forty-four three-sided pyramids stacked at the origin, which
 * then fly out to their places in an interlocking grid, spinning whole turns
 * on the way, and fall back in — each on its own delay, so the field is always
 * partly out and partly home. One point light circles the scene, which is what
 * gives the faces their edge: the same white material reads differently every
 * second.
 *
 * The geometry, the grid, the timings and the circling light are the pen's,
 * values included.
 *
 * The pen animates with GSAP, one `TimelineMax` per pyramid: a 2.5s move and a
 * 2.5s spin together, a 4s hold, then the same in reverse, forever. That is
 * a phase, an ease and a lerp — the same reasoning that left GSAP out of the
 * singularity port applies here, so the timeline is computed rather than
 * shipped, ease included (GSAP's default is a quadratic ease-out). Each
 * pyramid keeps its own delay and its own number of turns.
 *
 * The one value that could not be carried across is the light's, because
 * three's lighting model changed underneath it. See LIGHT_INTENSITY.
 */

/** The pen's grid: j and i both from -6 up to (not including) 6. */
const GRID_FROM = -6
const GRID_TO = 6
const STEP = 160

/** The pen's timeline, in seconds. */
const MOVE = 2.5
const HOLD = 4
const CYCLE = (MOVE + HOLD) * 2

/**
 * The pen's light, translated across a change in three itself.
 *
 * The pen is from 2016, when a point light fell off linearly to its `distance`
 * and `intensity` was a bare multiplier. Three now models light physically:
 * intensity is in candela and falls off with the square of the distance, which
 * turns the pen's `2` at 350 units away into about two ten-thousandths of a
 * lit surface — a black band, which is exactly what it rendered as first time.
 *
 * Setting `decay` to zero is what brings the old behaviour back: the light no
 * longer falls off with distance, only fading out near its cutoff, which is
 * the shape the pen was lit by.
 *
 * The level is then a judgement rather than a translation, and it is set below
 * the pen's. The pen is a full window of white pyramids; put the same white
 * behind a headline and the headline is gone for the four seconds the field is
 * out. Lit to graphite instead, the faces still turn and catch the moving
 * light — which is the whole trick — and the copy survives them. Raise this to
 * `2 * Math.PI` for the pen's own brightness.
 */
const LIGHT_INTENSITY = 0.55 * Math.PI
const LIGHT_DECAY = 0

type Pyramid = {
  mesh: Mesh
  destX: number
  destY: number
  spin: number
  delay: number
}

/** GSAP's default ease, which every tween in the pen uses. */
function quadOut(p: number) {
  return 1 - (1 - p) * (1 - p)
}

function setup(canvas: HTMLCanvasElement): BackdropScene | null {
  const renderer = new WebGLRenderer({ canvas, antialias: true })

  const scene = new Scene()
  const camera = new PerspectiveCamera(50, 1, 0.1, 10000)
  camera.position.set(-80, 0, 1000)
  scene.add(camera)

  const light = new PointLight(0xffffff, LIGHT_INTENSITY, 1500)
  light.decay = LIGHT_DECAY
  light.position.set(0, 0, 350)
  scene.add(light)

  const group = new Group()
  scene.add(group)

  const geometry = new CylinderGeometry(0, 160, 160, 3, 1, false, 0, Math.PI * 2)
  const material = new MeshLambertMaterial({ color: 0xffffff })
  const pyramids: Pyramid[] = []

  for (let j = GRID_FROM; j < GRID_TO; j++) {
    for (let i = GRID_FROM; i < GRID_TO; i++) {
      const mesh = new Mesh(geometry, material)
      const even = i % 2 === 0
      // Every other column is flipped and offset half a cell, which is what
      // makes the pyramids interlock rather than line up.
      mesh.rotation.x = even ? Math.PI : 0
      mesh.rotation.y = even ? Math.PI : 0
      pyramids.push({
        mesh,
        destX: (even ? STEP * i + STEP : STEP * i) + (j % 2 === 0 ? -STEP : 0),
        destY: (even ? -80 : 80) - j * STEP,
        spin: Math.PI * 2 * Math.round(Math.random() * 3),
        delay: Math.random() * 3,
      })
      group.add(mesh)
    }
  }

  return {
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr)
      // `false`: the hook owns the element's CSS size, three owns its buffer.
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    },
    frame(seconds) {
      for (let k = 0; k < pyramids.length; k++) {
        const p = pyramids[k]
        const t = seconds - p.delay
        // The pen's timeline: out over MOVE, hold, back over MOVE, hold.
        let progress = 0
        if (t > 0) {
          const u = t % CYCLE
          if (u < MOVE) progress = quadOut(u / MOVE)
          else if (u < MOVE + HOLD) progress = 1
          else if (u < MOVE + HOLD + MOVE) progress = quadOut(1 - (u - MOVE - HOLD) / MOVE)
        }
        p.mesh.position.x = p.destX * progress
        p.mesh.position.y = p.destY * progress
        p.mesh.rotation.z = p.spin * progress
      }

      // The pen's light, on the pen's own clock: a frame counter over a
      // hundred, which at sixty frames a second is a turn every ten seconds.
      const angle = seconds * 0.6
      light.position.x = Math.cos(angle) * 500
      light.position.y = Math.sin(angle) * 500

      renderer.render(scene, camera)
    },
    dispose() {
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function PyramidsBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.25 })
  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--pyramids', className)} aria-hidden />
  )
}
