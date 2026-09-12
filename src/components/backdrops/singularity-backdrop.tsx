'use client'

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  CylinderGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  WebGLRenderer,
} from 'three'
import { useCanvasBackdrop, type BackdropRenderer } from './use-canvas-backdrop'
import { cn } from '@/lib/utils'

/**
 * "Cosmic Anomaly Visualizer" by VoXelo, ported.
 * https://codepen.io/VoXelo/pen/KwNXwxY
 *
 * Event horizon, a rim aura, and five thousand instanced streaks orbiting as
 * an accretion disk — morphed by simplex noise, coloured by a Doppler term,
 * cycling through the pen's three states. The HUD text overlay is not
 * reproduced; only the scene is.
 *
 * Two dependencies dropped in the port. OrbitControls is gone because a
 * background that captures pointer events cannot be scrolled past; the camera
 * auto-orbits and takes a gentle offset from the pointer instead. GSAP is gone
 * because the transitions are four-second eases over seven numbers, which is a
 * lerp rather than a reason to ship an animation library.
 *
 * This is the one place the site loads Three.js, against DECISIONS §5. It is
 * imported lazily and mounted only when the closing section is near the
 * viewport, so it costs the homepage's first load nothing.
 */

/** Ashima / Stefan Gustavson simplex noise, as the pen uses it. */
const NOISE = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`

type State = {
  morph: number
  compress: number
  intensity: number
  rotate: number
  camY: number
  camDist: number
  orbit: number
}

/** The pen's three states, minus the copy that labelled them. */
const STATES: readonly State[] = [
  { morph: 0.1, compress: 1.0, intensity: 1.0, rotate: 0.4, camY: 25, camDist: 85, orbit: 1.0 },
  { morph: 4.5, compress: 1.15, intensity: 1.4, rotate: 1.5, camY: 45, camDist: 95, orbit: 1.8 },
  { morph: 0.8, compress: 0.38, intensity: 3.5, rotate: 5.0, camY: 12, camDist: 55, orbit: 4.5 },
]

const HOLD_SECONDS = 10
const TWEEN_SECONDS = 4

/** Stands in for gsap's power2.inOut. */
function easeInOut(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function buildScene(canvas: HTMLCanvasElement): BackdropRenderer | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
  } catch {
    return null
  }
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.6

  const scene = new Scene()
  const camera = new PerspectiveCamera(40, 1, 0.1, 1000)

  const core = new Group()
  scene.add(core)

  const horizonGeo = new SphereGeometry(4, 48, 48)
  const horizonMat = new MeshBasicMaterial({ color: 0x000000 })
  core.add(new Mesh(horizonGeo, horizonMat))

  const auraGeo = new SphereGeometry(4.25, 48, 48)
  const auraMat = new ShaderMaterial({
    uniforms: { uIntensity: { value: 1 } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 4.0);
        gl_FragColor = vec4(vec3(1.0, 0.45, 0.1) * rim * uIntensity * 5.0, 1.0);
      }`,
    side: BackSide,
    transparent: true,
    blending: AdditiveBlending,
  })
  core.add(new Mesh(auraGeo, auraMat))

  const COUNT = 5000
  const streakGeo = new CylinderGeometry(0.01, 0.12, 2.2, 3)
  streakGeo.rotateX(Math.PI / 2)

  const diskMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: STATES[0].morph },
      uCompression: { value: STATES[0].compress },
      uIntensity: { value: STATES[0].intensity },
      uOrbitScale: { value: STATES[0].orbit },
    },
    vertexShader: `
      ${NOISE}
      uniform float uTime;
      uniform float uMorph;
      uniform float uCompression;
      uniform float uIntensity;
      uniform float uOrbitScale;
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        vec4 instPos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float rOriginal = length(instPos.xz);
        float r = rOriginal * uCompression;
        float initialAngle = atan(instPos.z, instPos.x);
        float orbitalVelocity = (1.5 / sqrt(rOriginal)) * uOrbitScale;
        float currentAngle = initialAngle + (uTime * orbitalVelocity);
        vec3 world = vec3(cos(currentAngle) * r, instPos.y, sin(currentAngle) * r);
        float noise = snoise(vec3(world.x * 0.08, world.z * 0.08, uTime * 0.3));
        world.y += noise * uMorph * 4.0;
        vec3 viewDir = normalize(cameraPosition - world);
        vec3 orbitDir = normalize(vec3(-sin(currentAngle), 0.0, cos(currentAngle)));
        float doppler = dot(orbitDir, viewDir);
        vec3 hot = vec3(1.0, 0.95, 0.9);
        vec3 warm = vec3(1.0, 0.45, 0.1);
        vec3 cool = vec3(0.1, 0.35, 1.0);
        vec3 color = mix(cool, warm, smoothstep(45.0, 12.0, r));
        color = mix(color, hot, smoothstep(10.0, 4.0, r));
        vColor = color * (1.3 + doppler * 0.7) * uIntensity;
        vOpacity = (smoothstep(3.8, 5.5, r) * (1.0 - smoothstep(38.0, 48.0, r))) * 0.8;
        float delta = currentAngle - initialAngle;
        float c = cos(delta);
        float s = sin(delta);
        mat3 rotY = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
        vec3 local = (instanceMatrix * vec4(position, 0.0)).xyz;
        gl_Position = projectionMatrix * viewMatrix * vec4(world + rotY * local, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vColor;
      varying float vOpacity;
      void main() { gl_FragColor = vec4(vColor, vOpacity); }`,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })

  const disk = new InstancedMesh(streakGeo, diskMat, COUNT)
  const dummy = new Object3D()
  for (let i = 0; i < COUNT; i++) {
    const radius = 5 + Math.pow(Math.random(), 1.3) * 40
    const angle = Math.random() * Math.PI * 2
    dummy.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * (8 / radius),
      Math.sin(angle) * radius,
    )
    dummy.lookAt(
      dummy.position.x + Math.sin(angle),
      dummy.position.y,
      dummy.position.z - Math.cos(angle),
    )
    dummy.updateMatrix()
    disk.setMatrixAt(i, dummy.matrix)
  }
  scene.add(disk)

  // The pointer nudges the orbit rather than driving OrbitControls, so the
  // section still scrolls and the buttons over it still take clicks.
  let targetX = 0
  let targetY = 0
  let easedX = 0
  let easedY = 0
  const onPointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    targetX = (event.clientX - rect.left) / rect.width - 0.5
    targetY = (event.clientY - rect.top) / rect.height - 0.5
  }
  const onLeave = () => {
    targetX = 0
    targetY = 0
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerdown', onPointer, { passive: true })
  window.addEventListener('pointerleave', onLeave)

  let orbitAngle = Math.PI * 0.25
  let last = 0
  let index = 0
  let phaseStart = 0
  let from: State = { ...STATES[0] }
  let to: State = STATES[0]
  const live: State = { ...STATES[0] }

  return {
    resize(width, height) {
      renderer.setSize(width, height, false)
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
    },
    draw(seconds) {
      const dt = last === 0 ? 0.016 : Math.min(0.05, Math.max(0, seconds - last))
      last = seconds

      const wanted = Math.floor((seconds % (HOLD_SECONDS * STATES.length)) / HOLD_SECONDS)
      if (wanted !== index) {
        from = { ...live }
        index = wanted
        to = STATES[index]
        phaseStart = seconds
      }
      const k = easeInOut(Math.min(1, (seconds - phaseStart) / TWEEN_SECONDS))
      const lerp = (a: number, b: number) => a + (b - a) * k
      live.morph = lerp(from.morph, to.morph)
      live.compress = lerp(from.compress, to.compress)
      live.intensity = lerp(from.intensity, to.intensity)
      live.rotate = lerp(from.rotate, to.rotate)
      live.camY = lerp(from.camY, to.camY)
      live.camDist = lerp(from.camDist, to.camDist)
      live.orbit = lerp(from.orbit, to.orbit)

      diskMat.uniforms.uTime.value = seconds
      diskMat.uniforms.uMorph.value = live.morph
      diskMat.uniforms.uCompression.value = live.compress
      diskMat.uniforms.uIntensity.value = live.intensity
      diskMat.uniforms.uOrbitScale.value = live.orbit
      auraMat.uniforms.uIntensity.value = live.intensity

      easedX += (targetX - easedX) * 0.05
      easedY += (targetY - easedY) * 0.05

      orbitAngle += dt * live.rotate * 0.08
      const distance = live.camDist * (1 - easedY * 0.12)
      camera.position.set(
        Math.sin(orbitAngle + easedX * 0.9) * distance,
        live.camY + easedY * 22,
        Math.cos(orbitAngle + easedX * 0.9) * distance,
      )
      camera.lookAt(0, 0, 0)

      disk.rotation.y += dt * 0.03
      renderer.render(scene, camera)
    },
    dispose() {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointerleave', onLeave)
      horizonGeo.dispose()
      horizonMat.dispose()
      auraGeo.dispose()
      auraMat.dispose()
      streakGeo.dispose()
      diskMat.dispose()
      disk.dispose()
      renderer.dispose()
    },
  }
}

/**
 * Nothing in a decorative backdrop is worth an error boundary. A failed
 * context, a driver that rejects the instanced shader, a device that runs out
 * of memory on 5,000 instances — all of it degrades to an empty canvas and a
 * section that looks exactly as it did before this existed.
 */
function createRenderer(canvas: HTMLCanvasElement): BackdropRenderer | null {
  try {
    return buildScene(canvas)
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Singularity backdrop failed to initialise:', error)
    }
    return null
  }
}

export function SingularityBackdrop({ className }: { className?: string }) {
  const ref = useCanvasBackdrop(createRenderer, { resolution: 0.75, maxDpr: 1.75 })

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}
