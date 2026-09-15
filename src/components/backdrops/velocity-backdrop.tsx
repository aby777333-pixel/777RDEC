'use client'

import {
  ACESFilmicToneMapping,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  FogExp2,
  Group,
  HemisphereLight,
  InstancedMesh,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three'
import { useLogoSources } from '@/components/layout/brand-provider'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'
import { motionIsReduced } from './motion'

/**
 * "VELOCITY", the Raptor roller coaster, from the owner's own CodePen, ported.
 *
 * A first-person ride through a night-time steel coaster: a slow climb to the
 * crest, a near-vertical drop, a blast along the ground, a huge banked left, a
 * dive, a run through a tunnel of red-lit frames, blast doors swinging shut, a
 * violent right and a final plunge onto a long straight. Lightning flashes, rain
 * and dust hang in the fog, sparks fly off the rails, and speed lines, a wider
 * field of view and a shaking camera come up with the speed.
 *
 * The track's path, the rails, sleepers, supports, pillars, tunnel frames and
 * blast doors, the lights and materials, the fog, tone mapping and
 * exposure, the particles, sparks and lightning, the ride's pacing curve, the
 * speed model, the camera's vibration, shake, banking and field of view, the
 * speed lines and vignette, and the logo's light burst and reveal are the pen's,
 * values included.
 *
 * What changed:
 *
 * - **It starts on its own, and there is no text, as asked.** The pen opens on
 *   a start screen — "777 RAPTOR PRESENTS", the VELOCITY title, a warning, the
 *   "ENTER THE RAPTOR" button and a headphones hint — and runs a HUD with the
 *   speed and a status line; its logo screen carries a tagline. None of it is
 *   drawn here. The ride begins when the band does.
 * - **The ride stops at the logo, and loops, as asked.** The pen runs flat out
 *   into a wall at the end of the track, cuts to a white impact flash and a
 *   black frame, and brings the logo up on a screen of its own, once. Here the
 *   wall is gone: the coaster brakes over the last straight and comes to rest
 *   looking down the empty track, and the logo — the site's master logo; the
 *   pen leaves a placeholder URL — rises out of the pen's light burst over the
 *   stopped scene, with the pen's logo-screen gradient drawn down over it
 *   rather than replacing it. The shake, speed lines, sparks and field of view
 *   settle with the speed as it brakes. After a hold the logo fades, the
 *   gradient closes to black, and under it the ride restarts from the station,
 *   so the jump back is never seen.
 * - **It shares the hero with its copy.** On a wide band the camera's centre of
 *   view, the speed lines, the vignette and the logo sit in the space to the
 *   right of the heading; on a narrow one the ride stays centred behind the
 *   copy, and the logo is not shown rather than printed over the heading.
 * - **Its clock.** The pen moves sparks and rolls for new ones once per
 *   animation frame; here those steps are taken at its 60 a second, whatever
 *   the screen's rate. The ride runs on the band's own clock, which pauses while
 *   the band is off screen, and the pen's timers — the lightning's 70ms — are
 *   read off the same clock.
 * - **Cheaper to draw, drawn the same.** The six hundred identical sleepers are
 *   one instanced mesh, and the sparks share one geometry and material rather
 *   than each making (and never releasing) its own. The red warning lights are
 *   capped to what the GPU's fragment-uniform budget can compile — every
 *   desktop keeps all of them — so a small phone gets a lit ride rather than a
 *   black one. The backing store is capped at 1.5x, since seventy-odd point
 *   lights are shaded on every pixel.
 * - **A still band is a composed one.** With motion reduced there is one frame:
 *   the coaster stopped at the end of the track, the logo up.
 * - **Its size follows the band** rather than the window.
 */

const RIDE_DURATION = 29
/** Where along the track the coaster comes to rest, on the final straight. */
const STOP_T = 0.982
/** Seconds of braking on the final straight. */
const BRAKE_SECONDS = 3.5
/** Pause between coming to rest and the logo's light burst. */
const REVEAL_DELAY = 0.4
/** From coming to rest until the logo fades: the delay, the 3.5s reveal, then a hold. */
const HOLD_SECONDS = 6.5
/** The curtain closing to black before the ride restarts under it (its transition is 1.4s, plus margin for a slow frame). */
const COVER_SECONDS = 2

const STEP = 1 / 60
const MAX_STEPS = 4

/** From this band width the copy leaves room on the right. Tailwind's `lg`. */
const WIDE_FROM = 1024
/** Where the camera's centre of view sits across a wide band. */
const WIDE_CENTRE_X = 0.72

const PATH: readonly (readonly [number, number, number])[] = [
  // station
  [0, 15, 0],
  [0, 18, -80],
  // climb
  [0, 35, -170],
  [0, 75, -250],
  [0, 130, -330],
  [0, 200, -410],
  [0, 260, -470],
  // crest
  [0, 280, -520],
  // terrifying drop
  [3, 265, -550],
  [10, 190, -590],
  [18, 80, -640],
  [10, 5, -720],
  // ground blast
  [-20, 8, -850],
  [-100, 18, -960],
  // huge left bank
  [-210, 55, -1050],
  [-260, 130, -1140],
  [-200, 190, -1230],
  [-80, 160, -1320],
  // dive
  [50, 80, -1400],
  [120, 10, -1510],
  // tunnel run
  [140, 5, -1650],
  [100, 7, -1800],
  // violent right
  [20, 20, -1910],
  [-100, 90, -2000],
  [-130, 160, -2100],
  // final plunge
  [-60, 110, -2200],
  [0, 10, -2320],
  // final launch
  [0, 6, -2500],
  [0, 6, -2750],
  [0, 6, -3050],
]

/** The pen's pacing: a slower climb, then much faster after the crest. */
function penProgress(elapsed: number) {
  const p = MathUtils.clamp(elapsed / RIDE_DURATION, 0, 1)
  if (p < 0.22) return Math.pow(p / 0.22, 1.5) * 0.22
  const after = (p - 0.22) / 0.78
  return 0.22 + Math.pow(after, 0.78) * 0.78
}

/**
 * When to start braking so that, slowing evenly from the pen's speed at that
 * moment, the coaster comes to rest exactly at STOP_T. Solved once.
 */
function brakePlan() {
  const velocity = (e: number) => (penProgress(e + 0.001) - penProgress(e - 0.001)) / 0.002
  const restsAt = (e: number) => penProgress(e) + (velocity(e) * BRAKE_SECONDS) / 2
  let lo = 1
  let hi = RIDE_DURATION - 0.01
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2
    if (restsAt(mid) < STOP_T) lo = mid
    else hi = mid
  }
  const start = lo
  return { start, t: penProgress(start), velocity: velocity(start) }
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  } catch {
    return null
  }

  const speedLines = host.querySelector<HTMLElement>('[data-velocity-lines]')
  const flash = host.querySelector<HTMLElement>('[data-velocity-flash]')

  const brake = brakePlan()
  const stopAt = brake.start + BRAKE_SECONDS
  /** One lap: the ride, the logo held over the stopped scene, the close to black. */
  const loop = stopAt + HOLD_SECONDS + COVER_SECONDS

  /** Track position for a ride time: the pen's curve, then an even brake to rest. */
  const rideProgress = (elapsed: number) => {
    if (elapsed <= brake.start) return { t: penProgress(elapsed), pace: 1 }
    const tau = Math.min(elapsed - brake.start, BRAKE_SECONDS)
    return {
      t: brake.t + brake.velocity * (tau - (tau * tau) / (2 * BRAKE_SECONDS)),
      pace: 1 - tau / BRAKE_SECONDS,
    }
  }

  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15

  const disposables: { dispose: () => void }[] = []
  const keep = <T extends { dispose: () => void }>(thing: T) => {
    disposables.push(thing)
    return thing
  }

  const scene = new Scene()
  scene.background = new Color(0x020407)
  scene.fog = new FogExp2(0x050910, 0.0024)

  const camera = new PerspectiveCamera(80, 1, 0.05, 6000)
  camera.position.set(0, 15, 0)

  // LIGHTS
  scene.add(new HemisphereLight(0x607b9b, 0x050302, 1.3))
  const moon = new DirectionalLight(0xc8e0ff, 3)
  moon.position.set(-150, 300, -200)
  scene.add(moon)

  // TRACK PATH
  const curve = new CatmullRomCurve3(PATH.map(([x, y, z]) => new Vector3(x, y, z)))
  curve.curveType = 'centripetal'

  // RAILS
  const railMaterial = keep(new MeshStandardMaterial({ color: 0x414952, metalness: 0.95, roughness: 0.22 }))
  const up = new Vector3(0, 1, 0)
  const createRail = (offset: number) => {
    const points: Vector3[] = []
    for (let i = 0; i <= 1200; i++) {
      const t = i / 1200
      const position = curve.getPointAt(t)
      const tangent = curve.getTangentAt(t).normalize()
      const side = new Vector3().crossVectors(tangent, up)
      if (side.lengthSq() < 0.001) side.set(1, 0, 0)
      side.normalize()
      points.push(position.clone().add(side.multiplyScalar(offset)))
    }
    const geometry = keep(new TubeGeometry(new CatmullRomCurve3(points), 1200, 0.55, 8, false))
    scene.add(new Mesh(geometry, railMaterial))
  }
  createRail(-2.2)
  createRail(2.2)

  // SLEEPERS — one instanced mesh, placed exactly as the pen places each one.
  const sleeperGeometry = keep(new BoxGeometry(6.5, 0.45, 0.8))
  const sleeperMaterial = keep(new MeshStandardMaterial({ color: 0x20252a, metalness: 0.85, roughness: 0.35 }))
  const sleepers = new InstancedMesh(sleeperGeometry, sleeperMaterial, 600)
  const placer = new Object3D()
  for (let i = 0; i < 600; i++) {
    const t = i / 600
    const position = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t)
    placer.position.copy(position)
    placer.rotation.set(0, 0, 0)
    placer.lookAt(position.clone().add(tangent))
    placer.rotateY(Math.PI / 2)
    placer.updateMatrix()
    sleepers.setMatrixAt(i, placer.matrix)
  }
  sleepers.instanceMatrix.needsUpdate = true
  scene.add(sleepers)

  // GROUND
  const groundGeometry = keep(new PlaneGeometry(7000, 7000))
  const groundMaterial = keep(new MeshStandardMaterial({ color: 0x050708, roughness: 0.98 }))
  const ground = new Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -5
  scene.add(ground)

  // TRACK SUPPORTS
  const supportMaterial = keep(new MeshStandardMaterial({ color: 0x161a1e, metalness: 0.8, roughness: 0.35 }))
  for (let i = 0; i < 180; i++) {
    const position = curve.getPointAt(i / 180)
    if (position.y < 15) continue
    const height = position.y + 5
    const support = new Mesh(keep(new CylinderGeometry(0.7, 1, height, 6)), supportMaterial)
    support.position.set(position.x, position.y - height / 2, position.z)
    scene.add(support)
  }

  // WARNING LIGHTS — every bulb is drawn; the point lights behind them are
  // capped to what this GPU's fragment shader can hold (see the note above).
  const maxUniforms = renderer.capabilities.maxFragmentUniforms || 1024
  const lightBudget = Math.max(0, Math.floor((maxUniforms - 64) / 2))
  let lightsPlaced = 0
  const bulbGeometry = keep(new SphereGeometry(0.65, 10, 10))
  const bulbMaterials = new Map<number, MeshBasicMaterial>()
  const warningLight = (position: Vector3, color = 0xff2400) => {
    if (lightsPlaced < lightBudget) {
      const light = new PointLight(color, 45, 55, 2)
      light.position.copy(position)
      scene.add(light)
      lightsPlaced++
    }
    let material = bulbMaterials.get(color)
    if (!material) {
      material = keep(new MeshBasicMaterial({ color }))
      bulbMaterials.set(color, material)
    }
    const bulb = new Mesh(bulbGeometry, material)
    bulb.position.copy(position)
    scene.add(bulb)
  }

  for (let i = 0; i < 45; i++) {
    const t = 0.18 + Math.random() * 0.78
    const p = curve.getPointAt(t)
    warningLight(p.clone().add(new Vector3(Math.random() > 0.5 ? 7 : -7, Math.random() * 5, 0)))
  }

  // NEAR MISS PILLARS
  const pillarGeometry = keep(new BoxGeometry(5, 70, 5))
  const pillarMaterial = keep(new MeshStandardMaterial({ color: 0x15191d, metalness: 0.75, roughness: 0.3 }))
  const createPillar = (position: Vector3, side: number) => {
    const pillar = new Mesh(pillarGeometry, pillarMaterial)
    pillar.position.set(position.x + side * 6.5, position.y - 70 / 2 + 10, position.z)
    scene.add(pillar)
  }
  for (let i = 0; i < 28; i++) {
    const p = curve.getPointAt(0.43 + i * 0.006)
    createPillar(p, -1)
    createPillar(p, 1)
  }

  // TUNNEL FRAMES
  const tunnelMaterial = keep(new MeshStandardMaterial({ color: 0x252a30, metalness: 0.85, roughness: 0.3 }))
  const postGeometry = keep(new BoxGeometry(1, 18, 1))
  const beamGeometry = keep(new BoxGeometry(15, 1, 1))
  for (let i = 0; i < 32; i++) {
    const t = 0.56 + i * 0.004
    const p = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t)
    const group = new Group()
    const left = new Mesh(postGeometry, tunnelMaterial)
    left.position.set(-7, 7, 0)
    const right = left.clone()
    right.position.x = 7
    const top = new Mesh(beamGeometry, tunnelMaterial)
    top.position.y = 16
    group.add(left, right, top)
    group.position.copy(p)
    group.lookAt(p.clone().add(tangent))
    scene.add(group)
    warningLight(p.clone().add(new Vector3(0, 14, 0)), 0xff1200)
  }

  // CLOSING BLAST DOOR
  const doorGeometry = keep(new BoxGeometry(18, 30, 3))
  const doorMaterial = keep(new MeshStandardMaterial({ color: 0x33383d, metalness: 0.95, roughness: 0.18 }))
  const doorPoint = curve.getPointAt(0.7)
  const leftDoor = new Mesh(doorGeometry, doorMaterial)
  const rightDoor = new Mesh(doorGeometry, doorMaterial)
  leftDoor.position.copy(doorPoint)
  rightDoor.position.copy(doorPoint)
  leftDoor.position.x -= 13
  rightDoor.position.x += 13
  leftDoor.position.y += 10
  rightDoor.position.y += 10
  scene.add(leftDoor, rightDoor)

  // PARTICLES / RAIN / DUST
  const particleCount = 8000
  const positions = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1400
    positions[i * 3 + 1] = Math.random() * 450
    positions[i * 3 + 2] = -Math.random() * 3400
  }
  const particleGeometry = keep(new BufferGeometry())
  particleGeometry.setAttribute('position', new BufferAttribute(positions, 3))
  const particleMaterial = keep(
    new PointsMaterial({ color: 0xbad8ff, size: 0.65, transparent: true, opacity: 0.5 }),
  )
  const particles = new Points(particleGeometry, particleMaterial)
  scene.add(particles)

  // SPARKS
  type Spark = { mesh: Mesh; velocity: Vector3; life: number }
  const sparks: Spark[] = []
  const sparkGeometry = keep(new SphereGeometry(0.08, 4, 4))
  const sparkMaterial = keep(new MeshBasicMaterial({ color: 0xff9a25 }))
  const createSparkBurst = (position: Vector3) => {
    for (let i = 0; i < 20; i++) {
      const mesh = new Mesh(sparkGeometry, sparkMaterial)
      mesh.position.copy(position)
      scene.add(mesh)
      sparks.push({
        mesh,
        velocity: new Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.2, (Math.random() - 0.5) * 1.5),
        life: Math.random() * 30,
      })
    }
  }

  // RIDE STATE
  let width = 1
  let height = 1
  let nextLightning = 4
  let flashUntil = -1
  let phase = ''
  let lap = -1
  let lastDrawn = -1
  let stepsTaken = -1
  let clockOffset = 0
  let intensity = 0
  let rideT = 0

  const setSpeedLines = (elapsed: number) => {
    if (!speedLines) return
    speedLines.style.opacity = String(intensity * 0.45)
    speedLines.style.transform = `scale(${1.6 + intensity * 1.2}) rotate(${elapsed * 2}deg)`
  }

  /** Where the coaster is and how it looks at a ride time. Everything per render frame. */
  const pose = (elapsed: number) => {
    const { t, pace } = rideProgress(elapsed)
    rideT = t
    const position = curve.getPointAt(t)
    const tangent = curve.getTangentAt(t).normalize()
    const ahead = curve.getPointAt(Math.min(t + 0.004, 1))

    // SPEED — the pen's model, eased down with the brake.
    const downhill = Math.max(0, -tangent.y)
    let speed = 35 + t * 150 + downhill * 150
    if (t > 0.82) speed += (t - 0.82) * 750
    speed = Math.min(speed, 348) * pace

    // CAMERA
    intensity = MathUtils.clamp((speed - 50) / 270, 0, 1)
    camera.position.copy(position)
    camera.position.y += 2.3
    const vibration = Math.sin(elapsed * (25 + intensity * 90))
    camera.position.y += vibration * 0.05 * intensity
    camera.position.x += Math.sin(elapsed * 47) * 0.035 * intensity
    if (speed > 220) {
      camera.position.x += (Math.random() - 0.5) * 0.13
      camera.position.y += (Math.random() - 0.5) * 0.1
    }
    camera.lookAt(ahead)

    // BANKING
    const nextTangent = curve.getTangentAt(Math.min(t + 0.012, 1))
    const turn = tangent.clone().cross(nextTangent).y
    const desiredBank = MathUtils.clamp(-turn * 18, -0.95, 0.95)
    camera.rotation.z = MathUtils.lerp(camera.rotation.z, desiredBank, 0.08)

    // FOV SPEED EFFECT
    camera.fov = MathUtils.lerp(78, 116, intensity)
    camera.updateProjectionMatrix()

    setSpeedLines(elapsed)

    // BLAST DOORS
    if (t > 0.62 && t < 0.71) {
      const closing = MathUtils.clamp((t - 0.62) / 0.09, 0, 1)
      leftDoor.position.x = doorPoint.x + MathUtils.lerp(-13, -4, closing)
      rightDoor.position.x = doorPoint.x + MathUtils.lerp(13, 4, closing)
    }

    // LIGHTNING — off once the brakes are on.
    if (elapsed < brake.start && elapsed > nextLightning) {
      flashUntil = elapsed + 0.07
      nextLightning = elapsed + 3 + Math.random() * 6
    }
    const flashing = elapsed < flashUntil
    if (flash) flash.style.opacity = flashing ? '0.75' : '0'
    renderer.toneMappingExposure = flashing ? 2.3 : 1.15

    // PARTICLE MOTION
    particles.rotation.z = Math.sin(elapsed * 0.4) * 0.01
  }

  /** The pen's once-a-frame work, at 60 a second. */
  const step = () => {
    if (Math.random() < 0.025 * intensity) {
      const sparkPosition = curve.getPointAt(Math.min(rideT + 0.025, 1))
      sparkPosition.x += Math.random() > 0.5 ? 4 : -4
      createSparkBurst(sparkPosition)
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i]
      spark.mesh.position.add(spark.velocity)
      spark.velocity.y -= 0.03
      spark.life--
      if (spark.life <= 0) {
        scene.remove(spark.mesh)
        sparks.splice(i, 1)
      }
    }
  }

  /** `ride`, `logo` (up over the stopped scene) or `cover` (closing to black). Styled in CSS. */
  const setPhase = (next: string) => {
    if (next === phase) return
    phase = next
    host.dataset.phase = next
  }

  /** A new lap starts from the station with the doors open and the sky quiet. */
  const resetLap = () => {
    leftDoor.position.x = doorPoint.x - 13
    rightDoor.position.x = doorPoint.x + 13
    nextLightning = 4
    flashUntil = -1
    for (const spark of sparks) scene.remove(spark.mesh)
    sparks.length = 0
  }

  const applyView = () => {
    camera.aspect = width / height
    if (width >= WIDE_FROM) camera.setViewOffset(width, height, width * (0.5 - WIDE_CENTRE_X), 0, width, height)
    else camera.clearViewOffset()
    camera.updateProjectionMatrix()
    host.style.setProperty('--velocity-x', `${width >= WIDE_FROM ? width * WIDE_CENTRE_X : width / 2}px`)
  }

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      renderer.setPixelRatio(dpr)
      renderer.setSize(w, h, false)
      applyView()
      // A still band draws no frames of its own, so a resize draws the new size.
      if (lastDrawn >= 0) renderer.render(scene, camera)
    },
    frame(seconds) {
      if (stepsTaken < 0 && motionIsReduced()) {
        // The end of the ride is the frame to keep: stopped, logo up. Moving
        // the clock there, rather than drawing it once, means motion switched
        // back on later carries on from the hold instead of starting mid-ride.
        clockOffset = stopAt + REVEAL_DELAY + 4
      }
      const elapsed = seconds + clockOffset
      const thisLap = Math.floor(elapsed / loop)
      const lapTime = elapsed - thisLap * loop
      if (thisLap !== lap) {
        if (lap >= 0) resetLap()
        lap = thisLap
      }

      pose(Math.min(lapTime, stopAt + HOLD_SECONDS))

      const due = Math.floor(elapsed / STEP)
      if (stepsTaken < 0) stepsTaken = due - 1
      const count = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      for (let i = 0; i < count; i++) step()

      if (lapTime >= stopAt + HOLD_SECONDS) setPhase('cover')
      else if (lapTime >= stopAt + REVEAL_DELAY) setPhase('logo')
      else setPhase('ride')

      renderer.render(scene, camera)
      lastDrawn = elapsed
    },
    dispose() {
      for (const spark of sparks) scene.remove(spark.mesh)
      sparks.length = 0
      sleepers.dispose()
      for (const thing of disposables) thing.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function VelocityBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.5 })
  const logo = useLogoSources().default

  return (
    <div ref={hostRef} className={cn('pen-scene pen-scene--velocity', className)} aria-hidden>
      <div className="velocity-lines" data-velocity-lines />
      <div className="velocity-vignette" />
      <div className="velocity-flash" data-velocity-flash />
      <div className="velocity-curtain" />
      <div className="velocity-reveal">
        <div className="velocity-light" />
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element -- static brand asset, no optimisation needed
          <img src={logo} alt="" className="velocity-logo" />
        ) : null}
      </div>
    </div>
  )
}
