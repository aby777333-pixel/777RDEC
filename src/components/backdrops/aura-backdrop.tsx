'use client'

import { useEffect, useRef } from 'react'
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  Color,
  DirectionalLight,
  FogExp2,
  GridHelper,
  IcosahedronGeometry,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  ReinhardToneMapping,
  Scene,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'
import { createOrbitRig } from './orbit-rig'
import { motionIsReduced } from './motion'

/**
 * "Modern Visual" (3D Geometric Aura) by russell-henderson, ported.
 * https://codepen.io/russell-henderson/pen/jEVVqBe
 *
 * A metallic icosahedron in a wireframe cage, tumbling slowly at the centre of
 * a small system: a ring of twelve hundred rainbow points riding a three-lobed
 * wave around it, two thin metal hoops spinning on tilted axes, a drift of
 * blue dust, a field of distant stars and a faint grid below — lit by five
 * lights, one of which walks through cyan and blue, all through a soft bloom.
 * The camera circles on its own and turns under a drag.
 *
 * Every geometry, material, light, colour, count and speed is the pen's, as is
 * the bloom, the Reinhard tone mapping, the fog, the loading notice that fades
 * after half a second, and the caption along the foot of the view.
 *
 * What changed:
 *
 * - **OrbitControls is <OrbitRig>**, at the pen's damping, speeds and zoom:
 *   drag to turn, Ctrl+wheel or pinch to zoom, so the page still scrolls.
 * - **Its clock.** The pen advances its time, and turns its stars, a fixed
 *   step per frame; here those steps are taken at the pen's 60 a second.
 * - **The view is centred right of the copy on a wide band**, by offsetting
 *   the camera's frustum rather than moving the camera, so the perspective is
 *   the pen's and only the framing moves.
 * - **The backing store is capped at 2x**; the pen renders at whatever the
 *   screen's ratio is.
 */

/** The pen's time step per frame, at 60 frames a second. */
const TIME_STEP = 0.012
const STEP_RATE = 60
const MAX_STEPS = 4

/** Where the centre of the view sits across a wide band. */
const WIDE_CENTRE_X = 0.68
const WIDE_FROM = 1024

const ORBIT = {
  dampingFactor: 0.05,
  autoRotateSpeed: 1.2,
  rotateSpeed: 1,
  zoomSpeed: 1,
  enableZoom: true,
} as const

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
  } catch {
    host.dataset.gl = 'off'
    return null
  }
  renderer.toneMapping = ReinhardToneMapping
  renderer.toneMappingExposure = 1.2

  const scene = new Scene()
  scene.background = new Color(0x050b1a)
  scene.fog = new FogExp2(0x050b1a, 0.008)

  const camera = new PerspectiveCamera(45, 1, 0.1, 1000)
  camera.position.set(3, 2, 5)
  const target = new Vector3(0, 0, 0)
  camera.lookAt(target)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloomPass = new UnrealBloomPass(new Vector2(1, 1), 1.2, 0.3, 0.85)
  bloomPass.threshold = 0.1
  bloomPass.strength = 0.8
  bloomPass.radius = 0.5
  composer.addPass(bloomPass)

  // ---- lights ----
  scene.add(new AmbientLight(0x222222))
  const mainLight = new DirectionalLight(0xffffff, 1.2)
  mainLight.position.set(2, 3, 4)
  scene.add(mainLight)
  const backLight = new PointLight(0x4466cc, 0.6)
  backLight.position.set(-2, 1, -3)
  scene.add(backLight)
  const fillLight = new PointLight(0xffaa66, 0.5)
  fillLight.position.set(1.5, 1, 2)
  scene.add(fillLight)
  const colorLight = new PointLight(0xff44aa, 0.8)
  colorLight.position.set(1, 1, 2)
  scene.add(colorLight)

  const disposables: { dispose: () => void }[] = []
  const keep = <T extends { dispose: () => void }>(thing: T) => {
    disposables.push(thing)
    return thing
  }

  // ---- stars ----
  const starPositions = new Float32Array(2400)
  for (let e = 0; e < 800; e++) {
    starPositions[3 * e] = 200 * (Math.random() - 0.5)
    starPositions[3 * e + 1] = 100 * (Math.random() - 0.5)
    starPositions[3 * e + 2] = 80 * (Math.random() - 0.5) - 40
  }
  const starGeometry = keep(new BufferGeometry())
  starGeometry.setAttribute('position', new BufferAttribute(starPositions, 3))
  const stars = new Points(
    starGeometry,
    keep(new PointsMaterial({ color: 0xaaccff, size: 0.08, transparent: true, opacity: 0.6 })),
  )
  scene.add(stars)

  // ---- the core and its cage ----
  const geometryIco = keep(new IcosahedronGeometry(1.1, 0))
  const coreMesh = new Mesh(
    geometryIco,
    keep(
      new MeshStandardMaterial({
        color: 0x4a7a9c,
        emissive: 0x112233,
        roughness: 0.28,
        metalness: 0.75,
        flatShading: false,
        transparent: true,
        opacity: 0.92,
      }),
    ),
  )
  scene.add(coreMesh)
  const wireframeIco = new Mesh(
    geometryIco,
    keep(new MeshBasicMaterial({ color: 0x66ccff, wireframe: true, transparent: true, opacity: 0.25 })),
  )
  wireframeIco.scale.setScalar(1.08)
  scene.add(wireframeIco)

  // ---- the ring of points ----
  const ringPositions = new Float32Array(3600)
  const ringColors = new Float32Array(3600)
  for (let e = 0; e < 1200; e++) {
    const t = (e / 1200) * Math.PI * 2
    const o = 1.55
    ringPositions[3 * e] = Math.cos(t) * o
    ringPositions[3 * e + 1] = 0.35 * Math.sin(3 * t)
    ringPositions[3 * e + 2] = Math.sin(t) * o
    ringColors[3 * e] = 0.4 + 0.6 * Math.sin(t)
    ringColors[3 * e + 1] = 0.3 + 0.7 * Math.cos(1.7 * t)
    ringColors[3 * e + 2] = 0.8 + 0.2 * Math.sin(2.3 * t)
  }
  const ringGeometry = keep(new BufferGeometry())
  ringGeometry.setAttribute('position', new BufferAttribute(ringPositions, 3))
  ringGeometry.setAttribute('color', new BufferAttribute(ringColors, 3))
  const ringParticles = new Points(
    ringGeometry,
    keep(
      new PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, blending: AdditiveBlending }),
    ),
  )
  scene.add(ringParticles)

  // ---- the hoops ----
  const torusRing = new Mesh(
    keep(new TorusGeometry(1.45, 0.045, 64, 500)),
    keep(new MeshStandardMaterial({ color: 0x88aaff, emissive: 0x2266aa, roughness: 0.3, metalness: 0.9 })),
  )
  scene.add(torusRing)
  const torusRing2 = new Mesh(
    keep(new TorusGeometry(1.68, 0.03, 64, 500)),
    keep(new MeshStandardMaterial({ color: 0xffaa88, emissive: 0x442200, roughness: 0.5, metalness: 0.7 })),
  )
  scene.add(torusRing2)

  // ---- dust ----
  const cloudPositions = new Float32Array(2400)
  for (let e = 0; e < 800; e++) {
    cloudPositions[3 * e] = 5 * (Math.random() - 0.5)
    cloudPositions[3 * e + 1] = 3 * (Math.random() - 0.5)
    cloudPositions[3 * e + 2] = 4 * (Math.random() - 0.5) - 1
  }
  const cloudGeo = keep(new BufferGeometry())
  cloudGeo.setAttribute('position', new BufferAttribute(cloudPositions, 3))
  const cloudPoints = new Points(
    cloudGeo,
    keep(
      new PointsMaterial({
        color: 0x77aaff,
        size: 0.025,
        transparent: true,
        opacity: 0.4,
        blending: AdditiveBlending,
      }),
    ),
  )
  scene.add(cloudPoints)

  // ---- the grid ----
  const gridHelper = new GridHelper(12, 24, 0x88aaff, 0x335588)
  gridHelper.position.y = -1.8
  const gridMaterial = gridHelper.material as LineBasicMaterial
  gridMaterial.transparent = true
  gridMaterial.opacity = 0.2
  keep(gridHelper.geometry)
  keep(gridMaterial)
  scene.add(gridHelper)

  let time = 0
  let stepsTaken = -1
  let width = 1
  let height = 1

  const step = () => {
    time += TIME_STEP
    coreMesh.rotation.y = 0.25 * time
    coreMesh.rotation.x = 0.2 * Math.sin(0.37 * time)
    coreMesh.rotation.z = 0.15 * Math.cos(0.23 * time)
    wireframeIco.rotation.copy(coreMesh.rotation)
    ringParticles.rotation.y = 0.35 * time
    ringParticles.rotation.x = 0.2 * Math.sin(0.28 * time)
    torusRing.rotation.x = Math.PI / 2
    torusRing.rotation.z = 0.5 * time
    torusRing2.rotation.x = Math.PI / 2 + 0.3
    torusRing2.rotation.z = 0.65 * time
    const e = (0.2 * time) % (2 * Math.PI)
    colorLight.color.setHSL(0.55 + 0.1 * Math.sin(e), 1, 0.6)
    stars.rotation.y += 5e-4
    stars.rotation.x += 3e-4
    cloudPoints.rotation.y = 0.05 * time
    cloudPoints.rotation.x = 0.1 * Math.sin(0.1 * time)
  }
  // The pen's first frame has already taken one step.
  step()

  const frameView = () => {
    if (width >= WIDE_FROM) {
      camera.setViewOffset(width, height, width * (0.5 - WIDE_CENTRE_X), 0, width, height)
    } else {
      camera.clearViewOffset()
    }
  }

  const orbit = createOrbitRig(camera, target, host, ORBIT, () => {
    if (!motionIsReduced()) return
    orbit.nudge()
    composer.render()
  })

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      composer.setPixelRatio(dpr)
      composer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      frameView()
      composer.render()
    },
    frame(seconds) {
      const due = Math.floor(seconds * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < steps; i++) step()
      orbit.frame(seconds)
      composer.render()
    },
    dispose() {
      orbit.dispose()
      for (const thing of disposables) thing.dispose()
      bloomPass.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function AuraBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  const loadingRef = useRef<HTMLDivElement>(null)

  // The pen's loading notice: faded out after half a second, removed after the fade.
  useEffect(() => {
    const loading = loadingRef.current
    if (!loading) return
    const fade = setTimeout(() => {
      loading.style.opacity = '0'
    }, 500)
    const remove = setTimeout(() => {
      loading.hidden = true
    }, 1500)
    return () => {
      clearTimeout(fade)
      clearTimeout(remove)
    }
  }, [])

  return (
    <>
      <div ref={hostRef} className={cn('pen-scene pen-scene--aura', className)} aria-hidden />
      <div className="aura-ui" aria-hidden>
        <div className="aura-info">
          ✦ 3D Geometric Aura ✦ | <span className="aura-info__hint">Drag to rotate view</span> | Inspired
          Iteration · Refreshed Presentation
        </div>
        <div ref={loadingRef} className="aura-loading">
          Loading visual engine...
        </div>
      </div>
    </>
  )
}
