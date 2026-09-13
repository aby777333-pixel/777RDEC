'use client'

import * as THREE from 'three/webgpu'
import {
  Fn,
  Loop,
  abs,
  cos,
  dot,
  exp,
  float,
  floor,
  fract,
  instanceIndex,
  log,
  max,
  min,
  mrt,
  negate,
  normalView,
  output,
  pass,
  positionLocal,
  select,
  step,
  storage,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl'
import { ao } from 'three/addons/tsl/display/GTAONode.js'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { cn } from '@/lib/utils'
import { type BackdropScene, isInteractiveTarget, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Pylon Terrain - three.js, WebGPU" by shubniggurath, ported.
 * https://codepen.io/shubniggurath/pen/YPGerem
 *
 * A round field of about eight hundred and fifty cylinders, packed a diameter
 * apart, each one as tall as a simplex-noise height field says and coloured by
 * its height along a cosine palette — a landscape of pylons, computed on the
 * GPU every frame in a compute shader, lit by a hard sun and a warm back light,
 * shadowed, ambient-occluded (GTAO) and bloomed. Drag across it and the noise
 * field slides under the pylons, so the terrain rolls; let go and it glides to
 * a stop.
 *
 * The noise, the compute and material nodes, the grid, the lights, the
 * shadows, the post-processing chain, the fog and the drag with its inertia
 * are the pen's, values included, on three's WebGPU renderer and TSL as the pen
 * uses them.
 *
 * What changed:
 *
 * - **The Tweakpane settings panel is left out**, as agreed for this page; the
 *   terrain runs on the pen's default settings, which are the panel's.
 * - **OrbitControls is gone.** In the pen it has rotation switched off and
 *   only pans and zooms, and it takes the page's wheel; the camera holds the
 *   view the controls settle on.
 * - **The drag is heard on the hero**, not the window, and a press on a link
 *   or a button there is left alone.
 * - **No WebGPU, no terrain.** The pen replaces the whole page with an apology
 *   when `navigator.gpu` is missing; here the band simply keeps the pen's dark
 *   ground and the hint is hidden, and the rest of the page is untouched.
 * - **`outputEncoding` is gone** from three; the pen's assignments to it did
 *   nothing, and sRGB output is the default the pen was getting anyway.
 * - **The backing store follows the screen, capped at 2x**; the pen forces 2x
 *   on every screen.
 */

// ---- Simplex noise — ported from McEwan / Gustavson (Ashima Arts), as the pen has it ----
const mod289 = (x: any): any => x.sub(floor(x.mul(1.0 / 289.0)).mul(289.0))
const permute = (x: any): any => mod289(x.mul(34.0).add(10.0).mul(x))
const taylorInvSqrt = (r: any): any => float(1.79284291400159).sub(r.mul(0.85373472095314))

const simplexNoise = Fn(([v]: [any]) => {
  const C = vec2(1.0 / 6.0, 1.0 / 3.0)
  const D = vec4(0.0, 0.5, 1.0, 2.0)

  const i = floor(vec3(v).add(dot(vec3(v), vec3(C.y, C.y, C.y))))
  const x0 = vec3(v).sub(i).add(dot(i, vec3(C.x, C.x, C.x)))

  const g = step(vec3(x0.y, x0.z, x0.x), x0)
  const l = vec3(1.0).sub(g)
  const i1 = min(g, vec3(l.z, l.x, l.y))
  const i2 = max(g, vec3(l.z, l.x, l.y))

  const x1 = x0.sub(i1).add(C.x)
  const x2 = x0.sub(i2).add(C.y)
  const x3 = x0.sub(0.5)

  const im = mod289(i)
  const p = permute(
    permute(
      permute(vec4(im.z, im.z, im.z, im.z).add(vec4(0.0, i1.z, i2.z, 1.0)))
        .add(vec4(im.y, im.y, im.y, im.y))
        .add(vec4(0.0, i1.y, i2.y, 1.0)),
    )
      .add(vec4(im.x, im.x, im.x, im.x))
      .add(vec4(0.0, i1.x, i2.x, 1.0)),
  )

  const n_ = float(1.0 / 7.0)
  const ns = vec3(n_.mul(D.w), n_.mul(D.y).sub(1.0), n_.mul(D.z))

  const j: any = p.sub(float(49.0).mul(floor(p.mul(ns.z).mul(ns.z))))
  const x_: any = floor(j.mul(ns.z))
  const y_: any = floor(j.sub(float(7.0).mul(x_)))
  const gx: any = x_.mul(ns.x).add(ns.y)
  const gy: any = y_.mul(ns.x).add(ns.y)
  const h: any = float(1.0).sub(abs(gx)).sub(abs(gy))

  const b0 = vec4(gx.x, gx.y, gy.x, gy.y)
  const b1 = vec4(gx.z, gx.w, gy.z, gy.w)
  const s0 = floor(b0).mul(2.0).add(1.0)
  const s1 = floor(b1).mul(2.0).add(1.0)
  const sh = step(h, vec4(0.0)).negate()

  const a0 = vec4(b0.x, b0.z, b0.y, b0.w).add(vec4(s0.x, s0.z, s0.y, s0.w).mul(vec4(sh.x, sh.x, sh.y, sh.y)))
  const a1 = vec4(b1.x, b1.z, b1.y, b1.w).add(vec4(s1.x, s1.z, s1.y, s1.w).mul(vec4(sh.z, sh.z, sh.w, sh.w)))

  const p0 = vec3(a0.x, a0.y, h.x)
  const p1 = vec3(a0.z, a0.w, h.y)
  const p2 = vec3(a1.x, a1.y, h.z)
  const p3 = vec3(a1.z, a1.w, h.w)

  const norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)))
  const p0n = p0.mul(norm.x)
  const p1n = p1.mul(norm.y)
  const p2n = p2.mul(norm.z)
  const p3n = p3.mul(norm.w)

  const m = max(float(0.6).sub(vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3))), 0.0)
  const m2 = m.mul(m)

  return float(42.0)
    .mul(dot(m2.mul(m2), vec4(dot(p0n, x0), dot(p1n, x1), dot(p2n, x2), dot(p3n, x3))))
    .mul(0.5)
    .add(0.5)
}) as any

// ---- FBM, available to the pen's noise switch ----
const makeFBM = (noiseFn: (p: any) => any, { octaves = 6, lacunarity = 2.0, gain = 0.5 } = {}) =>
  Fn(([p]: [any]) => {
    const value = float(0).toVar()
    const amplitude = float(0.5).toVar()
    const pos = vec3(p).toVar()
    Loop(octaves, () => {
      value.addAssign(noiseFn(pos).mul(amplitude))
      pos.mulAssign(lacunarity)
      amplitude.mulAssign(gain)
    })
    return value
  }) as any

const palette = Fn(([t, a, b, c, d]: [any, any?, any?, any?, any?]) => {
  const _a = a ?? vec3(0.5, 0.5, 0.5)
  const _b = b ?? vec3(0.5, 0.5, 0.5)
  const _c = c ?? vec3(1.0, 1.0, 1.0)
  const _d = d ?? vec3(0.0, 0.33, 0.67)
  return _a.add(_b.mul(cos(_c.mul(t).add(_d).mul(6.28318))))
}) as any

const fbmNoise = makeFBM(simplexNoise)

// The pen's smooth-min, kept with the rest of its node library.
export const smin = Fn(([a, b, k]: [any, any, any]) => {
  const nk = negate(k)
  const res = exp(nk.mul(a)).add(exp(nk.mul(b)))
  return negate(log(res)).div(k)
})

/** The pen's default settings — the values its panel starts on. */
const OPTIONS = {
  fieldRadius: 9,
  pylonRadius: 0.31,
  maxHeight: 8,
  noiseScale: 0.28,
  timeSpeed: 0.22,
  circularPattern: true,
  animating: false,
  noiseType: 'simplex' as 'simplex' | 'fbm',
}

function computeGrid(): number {
  const MAX_GRID = Math.floor(Math.sqrt(200_000))
  const desired = Math.round(OPTIONS.fieldRadius / OPTIONS.pylonRadius) + 1
  return Math.min(MAX_GRID, Math.max(3, desired))
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  if (typeof navigator === 'undefined' || !(navigator as any).gpu) {
    host.dataset.gl = 'off'
    return null
  }

  const section = host.parentElement ?? host

  // ---- scene ----
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x07080e)
  scene.fog = new THREE.Fog(0x07080e, 10, 60)

  const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 300)
  camera.position.set(-4, 11, 15)
  // Where the pen's OrbitControls settle the view: on its target.
  camera.lookAt(0, 2, 0)

  const renderer = new THREE.WebGPURenderer({ canvas, antialias: true })
  const isAndroid = /android/i.test(navigator.userAgent)
  renderer.shadowMap.enabled = !isAndroid
  renderer.shadowMap.type = THREE.PCFShadowMap

  // ---- uniforms ----
  const fieldRadiusU = uniform(OPTIONS.fieldRadius)
  const pylonRadiusU = uniform(OPTIONS.pylonRadius)
  const maxHeightU = uniform(OPTIONS.maxHeight)
  const noiseScaleU = uniform(OPTIONS.noiseScale)
  const noiseOffsetXU = uniform(1)
  const noiseOffsetYU = uniform(0)
  const noiseOffsetZU = uniform(0)
  const circularPatternU = uniform(1)

  // ---- grid and GPU state ----
  const GRID = computeGrid()
  const COUNT = GRID * GRID
  const heightBuffer = new THREE.StorageBufferAttribute(COUNT, 1)
  const colorBuffer = new THREE.StorageBufferAttribute(COUNT, 4)
  const heightStorage = storage(heightBuffer, 'float', COUNT) as any
  const colorStorage = storage(colorBuffer, 'vec4', COUNT) as any

  const computeNode = (Fn(() => {
    const idxF = float(instanceIndex)
    const col = idxF.mod(float(GRID))
    const row = floor(idxF.div(float(GRID)))
    const nx = col.div(float(GRID - 1)).mul(2.0).sub(1.0)
    const nz = row.div(float(GRID - 1)).mul(2.0).sub(1.0)

    const inside = nx.mul(nx).add(nz.mul(nz)).lessThanEqual(float(1))
    const active = inside.or(circularPatternU.lessThan(float(0.5)))

    const noiseIn = vec3(
      nx.mul(fieldRadiusU).mul(noiseScaleU).add(noiseOffsetXU),
      noiseOffsetYU,
      nz.mul(fieldRadiusU).mul(noiseScaleU).mul(0.65).add(noiseOffsetZU),
    ).toVar()
    const noiseFn = OPTIONS.noiseType === 'fbm' ? fbmNoise : simplexNoise
    const n = noiseFn(noiseIn.mul(0.5)).pow(2)

    heightStorage.element(instanceIndex).assign(select(active, n.mul(maxHeightU).add(0.04), float(0)))

    const t = fract(n.mul(0.08).mul(maxHeightU).add(0.5))
    const rgb = palette(t, vec3(0.5, 0.55, 0.5), vec3(0.5), vec3(0.5, 0.4, 0.3), vec3(0.2))
    colorStorage.element(instanceIndex).assign(vec4(select(active, rgb, vec3(0, 0, 0)), float(1)))
  }) as any)().compute(COUNT)

  const material = new THREE.MeshStandardNodeMaterial({ roughness: 0.9, metalness: 0.9 })
  // The pen places each pylon with its instance matrix and shapes it here. Newer
  // three applies the instance matrix before this node rather than after, which
  // would scale the grid spacing along with the pylon and pile the whole field
  // into the middle; so the pylon is shaped first and then set at the same
  // grid position the pen's matrix gives it, and the matrices stay identity.
  const fieldRadius = OPTIONS.fieldRadius
  const sinkOutside = OPTIONS.circularPattern ? 1 : 0
  material.positionNode = (Fn(() => {
    const h = heightStorage.element(instanceIndex)
    const pos = positionLocal.toVar()
    pos.x.assign(pos.x.mul(pylonRadiusU))
    pos.z.assign(pos.z.mul(pylonRadiusU))
    pos.y.assign(pos.y.add(0.5).mul(h))
    const idxF = float(instanceIndex)
    const nx = idxF.mod(float(GRID)).div(float(GRID - 1)).mul(2.0).sub(1.0)
    const nz = floor(idxF.div(float(GRID))).div(float(GRID - 1)).mul(2.0).sub(1.0)
    const outside = nx.mul(nx).add(nz.mul(nz)).greaterThan(float(1)).and(float(sinkOutside).greaterThan(float(0.5)))
    return pos.add(vec3(nx.mul(fieldRadius), select(outside, float(-500), float(0)), nz.mul(fieldRadius)))
  }) as any)()
  material.colorNode = (Fn(() => colorStorage.element(instanceIndex)) as any)()
  material.roughnessNode = (Fn(() => colorStorage.element(instanceIndex).b.add(0.3)) as any)()
  material.metalnessNode = (Fn(() => colorStorage.element(instanceIndex).b.add(0.3)) as any)()

  const cyl = new THREE.CylinderGeometry(1, 1, 1, 24, 1)
  const pylonMesh = new THREE.InstancedMesh(cyl, material, COUNT)
  pylonMesh.castShadow = true
  pylonMesh.receiveShadow = true
  pylonMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  scene.add(pylonMesh)

  // Positions come from the position node above; the matrices are identity, so
  // the mesh's bounds say nothing about where the field is.
  pylonMesh.frustumCulled = false

  // ---- ground ----
  const groundGeom = new THREE.PlaneGeometry(400, 400)
  const groundMat = new THREE.MeshStandardNodeMaterial({ color: 0x0d0f18, roughness: 0.95, metalness: 0.05 })
  const ground = new THREE.Mesh(groundGeom, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.005
  ground.receiveShadow = true
  scene.add(ground)

  // ---- lighting ----
  const sun = new THREE.DirectionalLight(0xffffff, 9)
  sun.castShadow = true
  sun.position.set(30, 30, 42)
  sun.shadow.mapSize.set(2048 * 2, 2048 * 2)
  sun.shadow.camera.near = 0.05
  sun.shadow.camera.far = 1000
  sun.shadow.radius = 2
  const shadowCam = sun.shadow.camera as THREE.OrthographicCamera
  shadowCam.left = -50
  shadowCam.right = 50
  shadowCam.top = 50
  shadowCam.bottom = -50
  shadowCam.updateProjectionMatrix()
  const backlight = new THREE.DirectionalLight(0x998877, 6.5)
  backlight.position.set(-10, 8, -12)
  scene.add(backlight)
  scene.add(sun)
  scene.add(new THREE.AmbientLight(0x223355, 3))

  // ---- post-processing: GTAO, then bloom ----
  // `samples: 0`: newer three gives a scene pass the renderer's MSAA samples by
  // default, and GTAO cannot read a multisampled depth texture. The pen's
  // three (0.183) rendered this pass unsampled, so this is the pen's pass.
  const scenePass = pass(scene, camera, { samples: 0 }) as any
  scenePass.setMRT(mrt({ output, normal: normalView }))
  const sceneColor = scenePass.getTextureNode('output')
  const sceneNormal = scenePass.getTextureNode('normal')
  const sceneDepth = scenePass.getTextureNode('depth')

  const aoEffect = ao(sceneDepth, sceneNormal, camera) as any
  aoEffect.resolutionScale = 0.5
  aoEffect.radius.value = 0.5

  const aoColor = aoEffect.getTextureNode().r.mul(sceneColor)
  const bloomEffect = bloom(aoColor, 0.9, 0.5, 0.7)

  const postProcessing = new THREE.RenderPipeline(renderer, sceneColor.add(bloomEffect))

  // ---- the pen's drag, with inertia ----
  let isDragging = false
  let dragX = 0
  let dragY = 0
  let velX = 0
  let velY = 0

  const onPointerDown = (e: PointerEvent) => {
    if (isInteractiveTarget(e.target)) return
    isDragging = true
    velX = velY = 0
    dragX = e.clientX
    dragY = e.clientY
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return
    const dx = e.clientX - dragX
    const dy = e.clientY - dragY
    dragX = e.clientX
    dragY = e.clientY
    velX = dx * 0.01
    velY = dy * 0.01
    noiseOffsetXU.value -= velX
    noiseOffsetZU.value -= velY
  }
  const onPointerUp = () => {
    isDragging = false
  }
  section.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  const previousCursor = section.style.cursor
  section.style.cursor = 'crosshair'

  let ready = false
  let disposed = false
  let last = -1
  renderer
    .init()
    .then(() => {
      if (disposed) return
      ready = true
      host.dataset.gl = 'on'
      renderer.compute(computeNode)
      postProcessing.render()
    })
    .catch(() => {
      host.dataset.gl = 'off'
    })

  return {
    resize(w, h, dpr) {
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (ready) postProcessing.render()
    },
    frame(seconds) {
      const delta = last < 0 ? 1 / 60 : Math.max(0, seconds - last)
      last = seconds
      if (!ready) return
      if (OPTIONS.animating) noiseOffsetYU.value += delta * OPTIONS.timeSpeed
      if (!isDragging && (velX !== 0 || velY !== 0)) {
        const decay = Math.pow(0.04, delta)
        velX *= decay
        velY *= decay
        noiseOffsetXU.value -= velX
        noiseOffsetZU.value -= velY
      }
      renderer.compute(computeNode)
      postProcessing.render()
    },
    dispose() {
      disposed = true
      section.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      section.style.cursor = previousCursor
      postProcessing.dispose()
      cyl.dispose()
      material.dispose()
      groundGeom.dispose()
      groundMat.dispose()
      renderer.dispose()
    },
  }
}

export function PylonsBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return (
    <>
      <div ref={hostRef} className={cn('pen-scene pen-scene--pylons', className)} aria-hidden />
      <p className="pylons-hint" aria-hidden>
        Click and drag
      </p>
    </>
  )
}
