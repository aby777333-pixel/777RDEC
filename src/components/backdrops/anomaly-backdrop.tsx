'use client'

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  FogExp2,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
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
import { ANOMALY_COUNT, ANOMALY_MORPH, ANOMALY_TARGET } from './anomaly-info'

/**
 * "Cosmic Anomaly Visualizer" by VoXelo, ported — as the pen is now.
 * https://codepen.io/VoXelo/pen/KwNXwxY
 *
 * A hundred and thirty-five thousand additive points, positioned entirely in
 * the vertex shader, forming one of three objects: a pulsar with its polar
 * jets and twisting field lines, a spiral galaxy, and a black hole with its
 * accretion disk, Doppler-shifted blue on the approaching side and red on the
 * receding one. Moving between them, every point is thrown outward in a shear
 * and a burst and falls back into the next shape, over a little over two
 * seconds, through an unreal bloom.
 *
 * The shaders, the particle count, the camera fit, the bloom, the fog, the
 * tone mapping and the morph timing are the pen's, values included. So are
 * its controls: the telemetry panel and the previous/next targets are in
 * <AnomalyControls>, wired to this scene by events on the hero.
 *
 * (The older version of this pen — the one with an event horizon mesh and
 * instanced streaks — is still the site's `singularity`. That is a port of
 * the pen as it was, and is left as it was.)
 *
 * What changed to make a page into a hero band:
 *
 * - **OrbitControls is <OrbitRig>.** Auto-rotation, damping, drag and zoom
 *   at the pen's values, listening in a way a hero can live with: a drag
 *   anywhere but a link or a control, and zoom on Ctrl+wheel or a pinch, so a
 *   plain wheel still scrolls the page. See `orbit-rig.ts`.
 * - **The canvas is the band, not the window.** The camera fit, the bloom
 *   resolution and the resize all measure the band.
 * - **On a wide band the view is centred right of the copy**, by offsetting
 *   the camera's frustum rather than moving the camera, so the perspective is
 *   the pen's. Centred, the pulsar's white core sat under the headline and the
 *   scrim that keeps the headline readable greyed it out.
 */

// ---------------------------------------------------------------------------
// The pen's shaders, verbatim.
// ---------------------------------------------------------------------------

const VERTEX = `
  uniform float uTime;
  uniform float uMorphProgress;
  uniform int uCurrentShape;
  uniform int uTargetShape;

  attribute float aId;
  attribute vec3 aRandom;

  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  varying float vGlowMult;

  #define PI 3.14159265359
  #define TAU 6.28318530718

  float safePow(float base, float exp) {
      return pow(max(abs(base), 0.00001), exp);
  }

  vec3 safeNormalize(vec3 v) {
      float len = length(v);
      return len > 0.00001 ? v / len : vec3(0.0, 1.0, 0.0);
  }

  float cubicInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - safePow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  mat3 rotateY(float a) {
    float s = sin(a); float c = cos(a);
    return mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c);
  }

  mat3 rotateX(float a) {
    float s = sin(a); float c = cos(a);
    return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
  }

  vec3 getPulsarPos(float id, vec3 rnd) {
    float t = uTime * 2.5;
    if (rnd.x < 0.1) {
       float u = rnd.y * TAU;
       float v = acos(2.0 * rnd.z - 1.0);
       float r = 2.0 + sin(u*12.0 + t)*0.15 + cos(v*8.0 - t)*0.15;
       return vec3(r * sin(v) * cos(u), r * cos(v), r * sin(v) * sin(u));
    }
    else if (rnd.x < 0.25) {
       float isTop = (rnd.y > 0.5) ? 1.0 : -1.0;
       float h = safePow(abs(rnd.y * 2.0 - 1.0), 3.0) * 70.0;
       float taper = safePow(1.0 - (h / 70.0), 2.0);
       float r = rnd.z * 1.5 * taper;
       float u = id * TAU * 150.0;
       float wobble = sin(h * 0.15 - t * 8.0) * 0.8 * taper;
       return vec3(r * cos(u) + wobble, h * isTop, r * sin(u) + wobble);
    }
    else {
       float lines = 42.0;
       float lineId = floor((rnd.x - 0.25) / 0.75 * lines);
       float lineAngle = (lineId / lines) * TAU;

       float v = rnd.y * PI;
       float maxL = 12.0 + fract(lineId * 17.5) * 25.0;
       float r = maxL * safePow(sin(v), 2.0);

       float twist = sin(v * PI - t) * 0.8;
       lineAngle += t * 2.0 + twist;

       float noise = sin(v * 15.0 - t * 4.0) * 0.4;
       return vec3((r + noise) * cos(lineAngle), (maxL * 0.6) * cos(v), (r + noise) * sin(lineAngle));
    }
  }

  vec3 getGalaxyPos(float id, vec3 rnd) {
    float t = uTime * 0.2;
    if (rnd.x < 0.2) {
       float u = rnd.y * TAU;
       float v = acos(2.0 * rnd.z - 1.0);
       float r = 5.0 * safePow(rnd.y, 2.5);
       return vec3(r * sin(v) * cos(u), r * cos(v) * 0.25, r * sin(v) * sin(u));
    }
    else {
       float arms = (rnd.x > 0.8) ? 4.0 : 2.0;
       float armId = floor(fract(rnd.x * 23.0) * arms);
       float u = rnd.y * TAU * 1.8;

       float baseR = 2.5 * exp(0.32 * u);

       float cluster = sign(rnd.z - 0.5) * safePow(abs(rnd.z - 0.5) * 2.0, 2.0);
       float spread = cluster * baseR * 0.25;

       float clumps = sin(baseR * 3.0) * 0.5;
       float r = baseR + spread + clumps;

       float angle = u + (armId * TAU / arms) - t;
       angle += sin(r * 2.0 - t * 3.0) * 0.1 * cluster;

       float yThickness = exp(-r * 0.12) * 2.0;
       float y = cluster * yThickness + sin(angle * 4.0) * 0.3;

       return vec3(r * cos(angle), y, r * sin(angle)) * 0.85;
    }
  }

  vec3 getBlackHolePos(float id, vec3 rnd) {
    float t = uTime * 1.5;
    float eventHorizon = 5.0;
    float maxDisk = 38.0;
    vec3 pos;

    if (rnd.x < 0.7) {
       float u = rnd.y * TAU;
       float r = eventHorizon + sqrt(rnd.z) * (maxDisk - eventHorizon);

       float velocity = t * (55.0 / safePow(r, 1.2));
       float angle = u + velocity;

       float thicknessStr = exp(-(r - eventHorizon) * 0.25) * 3.5;
       float clusterY = sign(rnd.x - 0.35) * safePow(abs(rnd.x - 0.35)*2.8, 2.0);
       float y = clusterY * thicknessStr;

       y += sin(r * 5.0 - t * 4.0) * cos(angle * 8.0) * 0.4;
       pos = vec3(r * cos(angle), y, r * sin(angle));
    }
    else if (rnd.x < 0.9) {
       float u = rnd.y * TAU;
       float v = rnd.z * PI;
       float r = eventHorizon * (1.0 + 0.05 * rnd.z);

       float angle1 = u + t * 18.0;
       float angle2 = v + t * 8.0;

       float distort = sin(angle1 * 3.0 + t) * 0.5;
       pos = vec3(
           (r+distort) * cos(angle1) * sin(angle2),
           (r+distort) * cos(angle2) * 1.5,
           (r+distort) * sin(angle1) * sin(angle2)
       );
    }
    else {
       float u = rnd.y * TAU;
       float h = (rnd.z - 0.5) * 2.0;
       float heightSq = sign(h) * safePow(abs(h), 1.5) * 25.0;
       float r = eventHorizon + 0.2 + safePow(abs(h), 2.0) * 8.0;
       float angle = u + t * 12.0 - heightSq * 0.4;
       pos = vec3(r * cos(angle), heightSq, r * sin(angle));
    }

    return pos * 1.35;
  }

  vec3 getPos(int shape, float id, vec3 rnd) {
    if (shape == 0) return getPulsarPos(id, rnd);
    if (shape == 1) return getGalaxyPos(id, rnd);
    if (shape == 2) return getBlackHolePos(id, rnd);
    return vec3(0.0);
  }

  vec3 getColor(int shape, float id, vec3 rnd, vec3 pos) {
    if (shape == 0) {
       if (rnd.x < 0.1) return vec3(1.0, 0.2, 1.0);
       if (rnd.x < 0.25) return vec3(0.0, 0.9, 1.0);
       float lineId = floor((rnd.x - 0.25) / 0.75 * 42.0);
       return mix(vec3(0.4, 0.0, 1.0), vec3(0.1, 0.5, 1.0), fract(lineId * 0.3));
    }

    if (shape == 1) {
       if (rnd.x < 0.2) {
           return mix(vec3(1.0, 0.8, 0.2), vec3(1.0, 0.3, 0.0), rnd.y);
       } else {
           vec3 brightArm = mix(vec3(0.0, 1.0, 0.8), vec3(0.0, 0.5, 1.0), rnd.y);
           vec3 darkDust = vec3(0.02, 0.0, 0.15);
           float clusterVal = safePow(abs(rnd.z - 0.5) * 2.0, 1.5);
           return mix(brightArm, darkDust, clusterVal);
       }
    }

    if (shape == 2) {
       vec3 hot = vec3(1.0, 0.5, 0.1);
       vec3 mid = vec3(0.8, 0.1, 0.0);
       vec3 cold = vec3(0.2, 0.0, 0.1);

       vec3 baseCol;
       if (rnd.x > 0.7 && rnd.x < 0.9) {
           baseCol = mix(vec3(1.0, 0.8, 0.3), hot, rnd.y);
       } else if (rnd.x >= 0.9) {
           baseCol = mix(hot, mid, rnd.z);
       } else {
           float distNorm = length(pos.xz) / 38.0;
           if (distNorm < 0.3) baseCol = mix(hot, mid, distNorm * 3.33);
           else baseCol = mix(mid, cold, (distNorm - 0.3) * 1.42);
       }

       float dopplerBias = clamp(pos.x / 20.0, -1.0, 1.0);
       vec3 blueShift = vec3(0.0, 0.4, 1.0);
       vec3 redShift = vec3(1.0, 0.0, 0.0);

       if (dopplerBias > 0.0) {
           baseCol = mix(baseCol, blueShift, dopplerBias * 0.8);
           baseCol *= (1.0 + dopplerBias * 0.5);
       } else {
           baseCol = mix(baseCol, redShift, abs(dopplerBias) * 0.8);
           baseCol *= (1.0 - abs(dopplerBias) * 0.5);
       }

       return baseCol;
    }
    return vec3(1.0);
  }

  float getAlpha(int shape, vec3 rnd) {
      if (shape == 0) {
         if (rnd.x < 0.1) return 1.0;
         if (rnd.x < 0.25) return 0.7;
         return 0.25;
      }
      if (shape == 1) {
         if (rnd.x < 0.2) return 0.8;
         float clusterVal = safePow(abs(rnd.z - 0.5) * 2.0, 1.5);
         return mix(0.6, 0.15, clusterVal);
      }
      if (shape == 2) {
         if (rnd.x > 0.7 && rnd.x < 0.9) return 0.9;
         if (rnd.x >= 0.9) return 0.4;
         return 0.5;
      }
      return 0.5;
  }

  float getGlowMult(int shape) {
      if (shape == 0) return 2.2;
      if (shape == 1) return 1.4;
      if (shape == 2) return 1.1;
      return 1.0;
  }

  void main() {
    vec3 p1 = getPos(uCurrentShape, aId, aRandom);
    vec3 p2 = getPos(uTargetShape, aId, aRandom);

    vec3 c1 = getColor(uCurrentShape, aId, aRandom, p1);
    vec3 c2 = getColor(uTargetShape, aId, aRandom, p2);

    float a1 = getAlpha(uCurrentShape, aRandom);
    float a2 = getAlpha(uTargetShape, aRandom);

    float g1 = getGlowMult(uCurrentShape);
    float g2 = getGlowMult(uTargetShape);

    float morph = cubicInOut(uMorphProgress);
    vGlowMult = mix(g1, g2, morph);
    vAlpha = mix(a1, a2, morph);
    vColor = mix(c1, c2, morph);

    vec3 finalPos = mix(p1, p2, morph);

    float breatheMask = sin(uMorphProgress * PI);

    float distFromCenter = length(finalPos);
    float shearVelocity = (20.0 / (distFromCenter + 1.0)) * breatheMask;

    finalPos = rotateY(shearVelocity + breatheMask * PI * 2.0) * finalPos;

    vec3 chaosVec = safeNormalize(finalPos + vec3(sin(aId*PI), cos(aId*TAU), sin(aId*PI*1.5)));
    finalPos += chaosVec * breatheMask * (15.0 + aRandom.y * 20.0);

    float twinkle = 0.7 + 0.3 * sin(uTime * 10.0 + aId * TAU * 100.0);
    vAlpha *= twinkle * (1.0 - breatheMask * 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vDepth = -mvPosition.z;

    float baseSize = 4.0 + aRandom.x * 6.0;
    gl_PointSize = baseSize * (65.0 / max(vDepth, 0.1));
  }
`

const FRAGMENT = `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vDepth;
  varying float vGlowMult;

  void main() {
    vec2 uv = gl_PointCoord.xy - vec2(0.5);
    float dist = length(uv);

    if (dist > 0.5) discard;

    float core = exp(-dist * 14.0);
    float halo = exp(-dist * 4.0);

    vec3 col = vColor * vGlowMult;

    col = mix(col, vec3(1.0), core * 0.6);

    float depthFade = smoothstep(250.0, 15.0, vDepth);
    float finalAlpha = vAlpha * (halo * 0.5 + core) * depthFade;

    gl_FragColor = vec4(col, finalAlpha);
  }
`

// ---------------------------------------------------------------------------
// The pen's settings.
// ---------------------------------------------------------------------------

const PARTICLES = 135000

/** Camera: fov, and the shape extent the pen fits the view to. */
const FOV = 50
const MAX_SHAPE_EXTENT = 55.0

/** Bloom: strength, radius, threshold. */
const BLOOM = [1.6, 0.65, 0.25] as const

/** Where the centre of the view sits across a wide band. */
const WIDE_CENTRE_X = 0.68
const WIDE_FROM = 1024

/** Morph progress per second: the pen's `delta * 0.45`. */
const MORPH_RATE = 0.45

/** OrbitControls as the pen configures them. */
const ORBIT = {
  dampingFactor: 0.03,
  autoRotateSpeed: 0.5,
  minDistance: 20,
  maxDistance: 300,
} as const

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' })
  } catch {
    // No WebGL: the band stays black, and the controls have nothing to drive.
    host.dataset.gl = 'off'
    return null
  }
  renderer.setClearColor(0x000001)
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const section = host.parentElement ?? host

  const scene = new Scene()
  scene.fog = new FogExp2(0x000001, 0.0025)

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)

  const camera = new PerspectiveCamera(FOV, width / height, 0.1, 1000)
  const target = new Vector3(0, 0, 0)

  const updateCameraZ = () => {
    const aspect = width / height
    const fovRad = (camera.fov * Math.PI) / 180
    let requiredZ = MAX_SHAPE_EXTENT / Math.tan(fovRad / 2)
    if (aspect < 1.0) requiredZ /= aspect
    camera.position.set(0, requiredZ * 0.35, requiredZ)
    camera.lookAt(target)
  }
  updateCameraZ()

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloomPass = new UnrealBloomPass(new Vector2(width, height), BLOOM[0], BLOOM[1], BLOOM[2])
  composer.addPass(bloomPass)

  const geometry = new BufferGeometry()
  const positions = new Float32Array(PARTICLES * 3)
  const ids = new Float32Array(PARTICLES)
  const randoms = new Float32Array(PARTICLES * 3)
  for (let i = 0; i < PARTICLES; i++) {
    ids[i] = i / PARTICLES
    randoms[i * 3] = Math.random()
    randoms[i * 3 + 1] = Math.random()
    randoms[i * 3 + 2] = Math.random()
  }
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aId', new BufferAttribute(ids, 1))
  geometry.setAttribute('aRandom', new BufferAttribute(randoms, 3))

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMorphProgress: { value: 0.0 },
      uCurrentShape: { value: 0 },
      uTargetShape: { value: 0 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })
  const particles = new Points(geometry, material)
  // The positions are all computed in the shader, so the geometry's own
  // bounds (a point at the origin) say nothing about where it draws.
  particles.frustumCulled = false
  scene.add(particles)

  // ---- the pen's morph state ----
  let currentShape = 0
  let targetShape = 0
  let isTransitioning = false
  let morphProgress = 0

  let last = -1
  let lastSeconds = 0

  const render = (seconds: number) => {
    material.uniforms.uTime.value = seconds
    material.uniforms.uMorphProgress.value = morphProgress
    material.uniforms.uCurrentShape.value = currentShape
    material.uniforms.uTargetShape.value = targetShape
    composer.render()
  }

  // ---- the pen's previous / next ----
  const onMorph = (event: Event) => {
    const direction = (event as CustomEvent<number>).detail
    if (isTransitioning) return
    targetShape = (currentShape + direction + ANOMALY_COUNT) % ANOMALY_COUNT
    isTransitioning = true
    morphProgress = 0
    section.dispatchEvent(new CustomEvent(ANOMALY_TARGET, { detail: targetShape }))
    if (motionIsReduced()) {
      // Nothing is animating, so there is no morph to watch: arrive.
      currentShape = targetShape
      isTransitioning = false
      render(lastSeconds)
    }
  }
  section.addEventListener(ANOMALY_MORPH, onMorph)

  // ---- the pen's OrbitControls ----
  const orbit = createOrbitRig(camera, target, host, ORBIT, () => {
    if (!motionIsReduced()) return
    orbit.nudge()
    render(lastSeconds)
  })

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      renderer.setPixelRatio(dpr)
      // `false`: the hook owns the element's CSS size, three owns its buffer.
      renderer.setSize(w, h, false)
      composer.setPixelRatio(dpr)
      composer.setSize(w, h)
      camera.aspect = w / h
      if (w >= WIDE_FROM) camera.setViewOffset(w, h, w * (0.5 - WIDE_CENTRE_X), 0, w, h)
      else camera.clearViewOffset()
      camera.updateProjectionMatrix()
      // As the pen does on resize: refit, which also sets the orbit back.
      updateCameraZ()
      if (last >= 0) render(lastSeconds)
    },
    frame(seconds) {
      const delta = last < 0 || seconds < last ? 0 : seconds - last
      last = seconds
      lastSeconds = seconds

      orbit.frame(seconds)

      if (isTransitioning) {
        morphProgress += delta * MORPH_RATE
        if (morphProgress >= 1) {
          morphProgress = 0
          currentShape = targetShape
          isTransitioning = false
        }
      }

      render(seconds)
    },
    dispose() {
      section.removeEventListener(ANOMALY_MORPH, onMorph)
      orbit.dispose()
      geometry.dispose()
      material.dispose()
      bloomPass.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function AnomalyBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--anomaly', className)} aria-hidden />
}
