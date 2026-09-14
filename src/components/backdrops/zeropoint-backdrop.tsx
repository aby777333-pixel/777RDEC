'use client'

import { Body, Material, Sphere, Vec3, World } from 'cannon-es'
import {
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  FogExp2,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  ReinhardToneMapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { cn } from '@/lib/utils'
import { type BackdropScene, trackPointer, useBackdropCanvas } from './use-backdrop-canvas'
import { createOrbitRig } from './orbit-rig'
import { motionIsReduced } from './motion'

/**
 * "PROJECT: ZERO-POINT | REDUX" by Justin Linwood Ross, ported.
 * https://codepen.io/Justin-Ross-Rythorian/pen/JoXgrYN
 *
 * An ice core — an icosahedron with its surface pushed into spikes by noise and
 * a slow heartbeat, cyan with white Fresnel edges — hangs in a blue fog while
 * snow falls through it. Two hundred flakes are real bodies in a physics world
 * under a gentle gravity: they land on the core's sphere and roll off, drift on
 * a slow current, and scatter away from the pointer. Two thousand more are a
 * lighter field of points falling and swaying behind them. Bloom makes all of
 * it glow, and the camera turns slowly round the core.
 *
 * The scene, its fog, lights, shaders, both snowfalls, the physics values, the
 * pointer's push, the bloom and the camera with its orbit are the pen's, values
 * included, and it runs on the same physics library the pen loads.
 *
 * What changed:
 *
 * - **The text is gone, as asked.** The pen lays a HUD over the scene — its
 *   title and status line, energy and particle readouts, a loading screen, and
 *   a panel with a core-temperature slider and a "trigger instability" button.
 *   None of it is drawn here. With the slider gone the core stays at the
 *   slider's starting value, frozen; with the button gone its glitch pass,
 *   which the pen keeps switched off until pressed, is not added. The HUD's
 *   vignette and scanlines are not text, and they stay (see `globals.css`).
 * - **OrbitControls listens as a hero must** — through the shared orbit rig, so
 *   links keep working, a plain wheel scrolls the page, and Ctrl-wheel or a
 *   pinch zooms.
 * - **The pointer is the hero's.** The pen reads the mouse over its window;
 *   here the same, over this band, projected onto the same plane.
 * - **Its clock.** The pen steps its physics and moves its snow once per
 *   animation frame; here those steps are taken at its 60 a second, whatever
 *   the screen's rate.
 * - **Its size follows the band** rather than the window.
 */

const STEP = 1 / 60
const MAX_STEPS = 4
/** Steps run before a reduced-motion band's only frame, so snow has fallen in. */
const STILL_STEPS = 240

const CORE_VERTEX = `
varying vec3 vNormal; varying vec3 vPosition;
uniform float time; uniform float meltFactor;

float hash(float n) { return fract(sin(n) * 1e4); }
float noise(vec3 x) {
  const vec3 step = vec3(110, 241, 171);
  vec3 i = floor(x); vec3 f = fract(x);
  float n = dot(i, step);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
             mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
             mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
             mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
}

void main() {
  vNormal = normalize(normalMatrix * normal);
  float spikes = sin(time * 2.0 + position.y * 4.0) * 0.1;
  spikes += noise(position * 3.0 + time) * 0.2;
  float heartbeat = (sin(time * 3.0) * 0.5 + 0.5) * 0.15;
  float pulse = heartbeat * noise(position * 2.0);
  float water = sin(time * 3.0 + position.x * 2.0) * 0.05;
  float finalDisp = mix(spikes + pulse, water, meltFactor);
  vec3 newPos = position + normal * finalDisp;
  vPosition = (modelMatrix * vec4(newPos, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
}
`

const CORE_FRAGMENT = `
varying vec3 vNormal; varying vec3 vPosition;
uniform vec3 color; uniform vec3 cameraPos; uniform float meltFactor;
void main() {
  vec3 viewDir = normalize(cameraPos - vPosition);
  vec3 normal = normalize(vNormal);
  float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
  vec3 iceColor = color * 0.5;
  vec3 waterColor = vec3(0.0, 0.2, 0.5);
  vec3 edgeColor = vec3(1.0);
  vec3 base = mix(iceColor, waterColor, meltFactor);
  vec3 finalColor = mix(base, edgeColor, fresnel * (1.0 - meltFactor * 0.5));
  gl_FragColor = vec4(finalColor, 0.7 + fresnel * 0.3);
}
`

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  } catch {
    host.dataset.gl = 'off'
    return null
  }
  renderer.toneMapping = ReinhardToneMapping

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)

  const scene = new Scene()
  scene.fog = new FogExp2(0x000510, 0.02)

  const camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(0, 2, 12)
  const target = new Vector3(0, 0, 0)
  camera.lookAt(target)

  // ---- physics ----
  const world = new World()
  world.gravity.set(0, -1.0, 0)

  // ---- lights ----
  scene.add(new AmbientLight(0x404040, 2))
  scene.add(new PointLight(0x00ffff, 3, 50))
  const rimLight = new DirectionalLight(0xffffff, 4)
  rimLight.position.set(5, 5, 5)
  scene.add(rimLight)

  // ---- the core ----
  const coreBody = new Body({ mass: 0, material: new Material({ friction: 0.1, restitution: 0.5 }) })
  coreBody.addShape(new Sphere(2))
  world.addBody(coreBody)

  const coreGeometry = new IcosahedronGeometry(2, 30)
  const coreMaterial = new ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new Color('#00ffff') },
      // The pen's core-temperature slider starts here, and without it stays.
      meltFactor: { value: 0 },
      cameraPos: { value: camera.position },
    },
    vertexShader: CORE_VERTEX,
    fragmentShader: CORE_FRAGMENT,
    transparent: true,
    side: DoubleSide,
  })
  const coreMesh = new Mesh(coreGeometry, coreMaterial)
  scene.add(coreMesh)

  // ---- physics snow ----
  const flakeGeometry = new SphereGeometry(0.1, 4, 4)
  const flakeMaterial = new MeshStandardMaterial({ color: 0xffffff, emissive: 0x555555 })
  const flakes: { mesh: Mesh; body: Body }[] = []

  const resetParticle = (body: Body) => {
    const x = (Math.random() - 0.5) * 10
    const z = (Math.random() - 0.5) * 10
    body.position.set(x, 10 + Math.random() * 5, z)
    body.velocity.set(0, 0, 0)
  }

  for (let i = 0; i < 200; i++) {
    const body = new Body({ mass: 0.1, shape: new Sphere(0.1), linearDamping: 0.1 })
    resetParticle(body)
    world.addBody(body)
    const mesh = new Mesh(flakeGeometry, flakeMaterial)
    scene.add(mesh)
    flakes.push({ mesh, body })
  }

  // ---- visual snow ----
  const snowGeometry = new BufferGeometry()
  const pos: number[] = []
  for (let i = 0; i < 2000; i++) {
    pos.push((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30)
  }
  snowGeometry.setAttribute('position', new Float32BufferAttribute(pos, 3))
  const snowMaterial = new PointsMaterial({
    color: 0x88ccff,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    blending: AdditiveBlending,
  })
  const visualSnow = new Points(snowGeometry, snowMaterial)
  scene.add(visualSnow)

  // ---- post-processing ----
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new Vector2(width, height), 1.5, 0.4, 0.85)
  composer.addPass(bloom)

  // ---- the pointer, on the z = 0 plane ----
  const mouse = new Vector2()
  const raycaster = new Raycaster()
  const plane = new Plane(new Vector3(0, 0, 1), 0)
  const mouse3D = new Vector3()
  const untrack = trackPointer(host, (nx, ny) => {
    mouse.x = nx * 2 - 1
    mouse.y = -(ny * 2) + 1
    raycaster.setFromCamera(mouse, camera)
    raycaster.ray.intersectPlane(plane, mouse3D)
  })

  // ---- OrbitControls: damping, auto-rotate at half speed ----
  const orbit = createOrbitRig(camera, target, host, { dampingFactor: 0.05, autoRotateSpeed: 0.5 })

  const force = new Vec3()
  const drift = new Vec3()

  /** One of the pen's frames, minus the render. */
  const step = (time: number) => {
    world.step(STEP)

    for (const p of flakes) {
      p.mesh.position.set(p.body.position.x, p.body.position.y, p.body.position.z)
      p.mesh.quaternion.set(p.body.quaternion.x, p.body.quaternion.y, p.body.quaternion.z, p.body.quaternion.w)
      if (p.body.position.y < -10) resetParticle(p.body)
      const dx = p.body.position.x - mouse3D.x
      const dy = p.body.position.y - mouse3D.y
      const dz = p.body.position.z - mouse3D.z
      if (Math.hypot(dx, dy, dz) < 4) {
        force.set(dx, dy, dz)
        force.normalize()
        force.scale(8, force)
        p.body.applyForce(force, p.body.position)
      }
      drift.set(Math.cos(time + p.body.position.y) * 0.5, 0, Math.sin(time) * 0.5)
      p.body.applyForce(drift, p.body.position)
    }

    const positions = snowGeometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] -= 0.05
      if (positions[i + 1] < -15) positions[i + 1] = 15
      positions[i] += Math.cos(time + positions[i + 1]) * 0.02
    }
    snowGeometry.attributes.position.needsUpdate = true
  }

  let stepsTaken = -1

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
    },
    frame(seconds) {
      if (stepsTaken < 0 && motionIsReduced()) {
        for (let i = 0; i < STILL_STEPS; i++) step(i * STEP)
      }
      const due = Math.floor(seconds / STEP)
      if (stepsTaken < 0) stepsTaken = due - 1
      const count = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < count; i++) step(seconds)

      orbit.frame(seconds)

      coreMesh.rotation.y = seconds * 0.1
      coreMaterial.uniforms.time.value = seconds
      composer.render()
    },
    dispose() {
      untrack()
      orbit.dispose()
      coreGeometry.dispose()
      coreMaterial.dispose()
      flakeGeometry.dispose()
      flakeMaterial.dispose()
      snowGeometry.dispose()
      snowMaterial.dispose()
      bloom.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function ZeropointBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--zeropoint', className)} aria-hidden />
}
