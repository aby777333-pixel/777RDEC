'use client'

import {
  BoxGeometry,
  Color,
  ColorManagement,
  LinearSRGBColorSpace,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  WebGLRenderer,
} from 'three'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Infinite tunnel" by Mamboleoo, ported.
 * https://codepen.io/Mamboleoo/pen/emazBa
 *
 * Fourteen rings of thirteen long boxes, each ring in one of four colours —
 * cyan, pale aqua, coral, deep blue — spaced down a corridor the camera flies
 * along, turning slowly as it goes. A single point light travels with the
 * camera, circling just ahead of it, so the boxes light up as they approach and
 * fall back into the dark behind. When the camera passes a ring, the ring is
 * sent to the far end, so the tunnel never runs out.
 *
 * The geometry, the counts, the colours, the camera, the flight speed and turn,
 * and the light's circle are the pen's, values included.
 *
 * What changed, because three changed underneath the pen (it is r70):
 *
 * - **Colour.** r70 had no colour management and wrote its lighting straight to
 *   the screen. Here the colours are taken as written and the output is left
 *   linear, which is how r70 rendered, so the boxes are the pen's colours
 *   rather than a gamma-shifted version of them.
 * - **The light.** An r70 point light faded linearly to its distance and did
 *   not divide by π; today's is physical. The intensity is scaled by π and the
 *   decay turned off, so the light reaches as far and as brightly as the pen's.
 * - **`applyMatrix` is `applyMatrix4`.**
 * - **Its clock.** The pen moves a fixed step per frame; here those steps are
 *   taken at its 60 a second, whatever the screen's rate.
 */

const COLORS = [0x2cc6e5, 0x91f4f4, 0xe6a09e, 0x1071ac] as const
const RINGS = 14
const PER_RING = 13
const SPACING = 180
const STEP_RATE = 60
const MAX_STEPS = 4

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas })
  } catch {
    host.dataset.gl = 'off'
    return null
  }
  renderer.outputColorSpace = LinearSRGBColorSpace

  const scene = new Scene()
  const camera = new PerspectiveCamera(50, 1, 1, 10000)
  scene.add(camera)

  const light = new PointLight(0xffffff, Math.PI, 1300, 0)
  light.position.set(0, 0, -750)
  scene.add(light)

  // Colours as r70 read them: the hex value, not an sRGB value to linearise.
  const managed = ColorManagement.enabled
  ColorManagement.enabled = false
  const colors = COLORS.map((hex) => new Color(hex))
  const materials: MeshLambertMaterial[] = []
  const elements = new Object3D()
  const geometry = new BoxGeometry(50, 50, 150)
  const translate = new Matrix4().makeTranslation(150, 0, 0)
  for (let i = 0; i < RINGS; i++) {
    const circle = new Object3D()
    for (let j = 0; j < PER_RING; j++) {
      const material = new MeshLambertMaterial({ color: colors[i % 4] })
      materials.push(material)
      const cube = new Mesh(geometry, material)
      const rotation = new Matrix4().makeRotationZ(((Math.PI * 2) / PER_RING) * j)
      cube.applyMatrix4(new Matrix4().multiplyMatrices(rotation, translate))
      circle.add(cube)
    }
    circle.position.z = -i * SPACING
    elements.add(circle)
  }
  ColorManagement.enabled = managed

  let farest = -(RINGS - 1) * SPACING
  scene.add(elements)

  let counter = 0
  let stepsTaken = -1

  const step = () => {
    for (let i = 0; i < RINGS; i++) {
      const circle = elements.children[i]
      if (camera.position.z <= circle.position.z) {
        farest -= SPACING
        circle.position.z = farest
      }
    }
    camera.rotation.z += 0.005
    camera.position.z -= 7
    light.position.z -= 7
    light.position.y = Math.sin(counter / 50) * 75
    light.position.x = Math.cos(counter / 50) * 75
    counter++
  }

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
      geometry.dispose()
      for (const material of materials) material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function BoxtunnelBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--boxtunnel', className)} aria-hidden />
}
