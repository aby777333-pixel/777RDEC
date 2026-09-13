'use client'

import {
  CatmullRomCurve3,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "[Three.js] Tunnel Animation" by celiarozalenm, ported.
 * https://codepen.io/celiarozalenm/pen/jBdodb
 *
 * Six points on a flat loop, smoothed into a Catmull-Rom spline, and three
 * wireframe tubes laid along it — violet inside, teal around that, blue
 * outside — each wider and fainter than the last. The camera rides the spline
 * and looks a little way ahead along it, so the band is the view from inside
 * the tube as it bends round the loop, forever.
 *
 * The points, colours, radii, opacities, segment counts, camera and speed are
 * the pen's, values included. There is no pointer and no colour from the
 * site's tokens: the pen answers to nothing and paints in its own three hues,
 * and both are kept.
 *
 * Three things changed underneath the pen, none of them visibly:
 *
 * - `TubeBufferGeometry` is `TubeGeometry` now; they were merged, and the
 *   arguments are the same.
 * - The pen steps its camera by a fixed amount per animation frame, so it ran
 *   twice as fast on a 120Hz screen as on a 60Hz one. Here the step is per
 *   second, at the pen's 60Hz rate, so every screen gets the pen's pace.
 * - The pen sized itself to the window once and never again. This one follows
 *   the band.
 */

/** The pen's points, on the x/z plane. The last closes the loop onto the first. */
const POINTS: readonly (readonly [number, number])[] = [
  [18.1, 58.2],
  [93.6, 8.6],
  [145.3, 89.5],
  [75.9, 148],
  [81.7, 90.2],
  [18.1, 58.2],
]

/** The pen's tubes, innermost first. */
const COLORS = [0x8664d4, 0x4dc2cc, 0x4d86cc] as const

/** The pen advanced 0.001 of the loop per frame, at 60 frames a second. */
const LOOP_PER_SECOND = 0.001 * 60
/** How far ahead along the loop the camera looks. */
const LOOK_AHEAD = 0.01

function setup(canvas: HTMLCanvasElement): BackdropScene | null {
  const renderer = new WebGLRenderer({ canvas })

  const scene = new Scene()
  const camera = new PerspectiveCamera(45, 1, 0.001, 1000)
  camera.position.z = 100

  const path = new CatmullRomCurve3(POINTS.map(([x, z]) => new Vector3(x, 0, z)))

  const geometries: TubeGeometry[] = []
  const materials: MeshBasicMaterial[] = []
  for (let i = 0; i < COLORS.length; i++) {
    const geometry = new TubeGeometry(path, 100, i * 2 + 4, 10, true)
    const material = new MeshBasicMaterial({
      color: COLORS[i],
      transparent: true,
      wireframe: true,
      opacity: (1 - i / 5) * 0.5 + 0.1,
    })
    geometries.push(geometry)
    materials.push(material)
    scene.add(new Mesh(geometry, material))
  }
  // The pen adds one more mesh after its loop, reusing whatever the loop left
  // in `geometry` and `material` — the outer blue tube, a second time. Drawn
  // over itself, that tube is brighter than its own opacity says, and that is
  // the brightness the pen has.
  scene.add(new Mesh(geometries[geometries.length - 1], materials[materials.length - 1]))

  return {
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr)
      // `false`: the hook owns the element's CSS size, three owns its buffer.
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    },
    frame(seconds) {
      const percentage = seconds * LOOP_PER_SECOND
      const p1 = path.getPointAt(percentage % 1)
      const p2 = path.getPointAt((percentage + LOOK_AHEAD) % 1)
      camera.position.set(p1.x, p1.y, p1.z)
      camera.lookAt(p2)
      renderer.render(scene, camera)
    },
    dispose() {
      for (const geometry of geometries) geometry.dispose()
      for (const material of materials) material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function TubeBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.5 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--tube', className)} aria-hidden />
}
