'use client'

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from 'three'
import { cn } from '@/lib/utils'
import {
  type BackdropScene,
  isInteractiveTarget,
  trackPointer,
  useBackdropCanvas,
} from './use-backdrop-canvas'

/**
 * "Three.js + GLSL Particle Animation" by VoXelo, ported.
 * https://codepen.io/VoXelo/pen/NPbGqrx
 *
 * A hundred thousand points, each given an id and three random numbers and
 * then told where to be by the vertex shader. Three figures are defined there
 * — an astrolabe of rings, a DNA double helix, and a heart that beats in three
 * layers — and the swarm morphs from one to the next on a cubic ease, pushing
 * outward at the midpoint so the change reads as a breath rather than a slide.
 * Every point is additive, sized by distance, and flickers on its own phase.
 *
 * All of that is the pen's, shaders included, down to the ACES tone map and
 * the 38-unit extent the camera pulls back to frame.
 *
 * Its nature is that you advance it: the pen morphs to the next figure on a
 * click and turns under the pointer, and both are kept. The listeners move
 * from the window to the hero band, so a click anywhere in the band — the
 * call to action included, which keeps working — advances the figure, and the
 * pointer turns it only while it is over the band.
 *
 * The one thing moved rather than kept is where the figure sits: the pen puts
 * it in the middle of the window, and the middle of this band is under the
 * headline. It sits right of centre instead, and never past the band's right
 * edge. See OFFSET_RIGHT.
 *
 * The pen's own button, a glass pill reading "click to morph", is left behind
 * with the rest of the demo's furniture.
 *
 * This is the second place the site loads Three.js, against DECISIONS §5, and
 * it is loaded the same way as the first: a chunk of its own that the route
 * bundle does not carry. See <LazyMorph>.
 */

const PARTICLE_COUNT = 100000
const TOTAL_SHAPES = 3

/** The extent the pen frames: the widest figure, plus its breath. */
const SHAPE_EXTENT = 38

/**
 * How far right of centre the figure sits, as a fraction of the half-width the
 * camera can see. The pen centres it in the window; this band has the hero's
 * copy down its left, so the figure moves right — far enough that the halo of
 * orbiting points clears the headline, not just the bright core. Taken as a
 * fraction rather than in pixels so it lands in the same place at every width.
 *
 * Whatever this asks for, the cap below wins: the whole figure stays inside
 * the band.
 */
const OFFSET_RIGHT = 0.42

/**
 * The margin left between the figure and the right edge of the band, on top of
 * the figure's own radius.
 *
 * SHAPE_EXTENT *is* that radius as the band sees it — it is the half-height the
 * camera is pulled back to frame, which is why the pen picked it — so the
 * offset can never exceed `halfWidth - SHAPE_EXTENT`, and this keeps the
 * outermost ring of points off the edge rather than on it. The rings are
 * tilted in three dimensions, so their near side projects wider than its
 * radius; the margin covers that too.
 */
const EDGE_MARGIN = 6

const VERTEX_SRC = `
uniform float uTime;
uniform float uMorphProgress;
uniform int uCurrentShape;
uniform int uTargetShape;
uniform vec2 uMouse;

attribute float aId;
attribute vec3 aRandom;

varying vec3 vColor;
varying float vAlpha;

#define PI 3.14159265359

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 getAstrolabe(float id, vec3 rnd) {
    vec3 pos;

    if (rnd.x > 0.3) {
        float t = id * PI * 2.0;
        float u = t * 13.0;
        float v = t * 8.0;

        float r = 12.0 + 3.0 * cos(v);
        pos = vec3(r * cos(u), r * sin(u), 4.0 * sin(v));

        float noiseAngle = rnd.y * PI * 2.0;
        float noiseRadius = rnd.z * 1.5;
        pos += vec3(cos(noiseAngle), sin(noiseAngle), cos(noiseAngle)) * noiseRadius;
    } else {
        float ringIdx = floor(rnd.y * 3.0);
        float angle = id * PI * 2.0 * 1000.0 + uTime * 0.2 * (ringIdx > 1.0 ? -1.0 : 1.0);
        float r = 24.0 + ringIdx * 4.0 + (rnd.z * 0.5);

        pos = vec3(r * cos(angle), (rnd.x - 0.15) * 2.0, r * sin(angle));

        float tilt = 0.5 + ringIdx * 0.8;
        float rotX = cos(tilt); float rotY = sin(tilt);
        pos.yz = mat2(rotX, -rotY, rotY, rotX) * pos.yz;
        pos.xy = mat2(rotX, -rotY, rotY, rotX) * pos.xy;
    }
    return pos * 0.85;
}

vec3 getDNA(float id, vec3 rnd) {
    float h = (id - 0.5) * 75.0;
    float angle = h * 0.5 + uTime * 0.5;
    float radius = 16.0;

    float strand = step(0.5, rnd.x);
    angle += strand * PI;

    vec3 pos = vec3(cos(angle) * radius, h, sin(angle) * radius);

    float rungZone = fract(h * 0.5);
    if (rungZone < 0.15 && rnd.y > 0.4) {
        float span = (rnd.z * 2.0 - 1.0);
        pos = vec3(span * cos(angle - strand*PI) * radius, h, span * sin(angle - strand*PI) * radius);
    } else {
        pos += (rnd - 0.5) * 1.0;
    }

    return pos;
}

vec3 getHeart(float id, vec3 rnd) {
    float u = rnd.x * PI * 2.0;
    float v = acos(2.0 * rnd.y - 1.0);

    float x = 16.0 * pow(sin(u), 3.0);
    float y = 13.0 * cos(u) - 5.0 * cos(2.0 * u) - 2.0 * cos(3.0 * u) - cos(4.0 * u) + 3.0;
    float z = 5.0 * cos(v);

    vec3 pos = vec3(x, y, z);

    float layer = floor(rnd.z * 3.0);
    float scale = 1.0 - (layer * 0.35);

    float beat = 1.0 + pow(sin(uTime * 3.0 - layer * 0.8), 8.0) * 0.12;

    return pos * scale * beat * 1.5;
}

vec3 getShapePosition(int shape, float id, vec3 rnd) {
    if (shape == 0) return getAstrolabe(id, rnd);
    if (shape == 1) return getDNA(id, rnd);
    if (shape == 2) return getHeart(id, rnd);
    return vec3(0.0);
}

vec3 getShapeColor(int shape, float id, vec3 rnd) {
    if (shape == 0) return palette(id + uTime*0.05, vec3(0.5, 0.5, 0.6), vec3(0.3, 0.3, 0.4), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.33, 0.67));
    if (shape == 1) {
        float h = (id - 0.5) * 60.0;
        float rungZone = fract(h * 0.5);
        if(rungZone < 0.15 && rnd.y > 0.4) return vec3(0.0, 0.9, 0.4);
        return palette(id * 0.1, vec3(0.2, 0.6, 0.8), vec3(0.1, 0.3, 0.4), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.2, 0.4));
    }
    if (shape == 2) {
        float layer = floor(rnd.z * 3.0);
        if (layer == 2.0) return vec3(1.0, 0.6, 0.8);
        return palette(id, vec3(0.9, 0.1, 0.2), vec3(0.3, 0.0, 0.1), vec3(1.0, 0.5, 0.5), vec3(0.0, 0.0, 0.0));
    }
    return vec3(1.0);
}

float cubicInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
    vec3 p1 = getShapePosition(uCurrentShape, aId, aRandom);
    vec3 p2 = getShapePosition(uTargetShape, aId, aRandom);

    vec3 c1 = getShapeColor(uCurrentShape, aId, aRandom);
    vec3 c2 = getShapeColor(uTargetShape, aId, aRandom);

    float easedMorph = cubicInOut(uMorphProgress);

    vec3 finalPos = mix(p1, p2, easedMorph);

    float breatheMask = sin(uMorphProgress * PI);
    finalPos += normalize(finalPos) * breatheMask * 8.0;

    float autoRot1 = (uCurrentShape == 2) ? 0.0 : uTime * 0.1;
    float autoRot2 = (uTargetShape == 2) ? 0.0 : uTime * 0.1;
    float rotY = mix(autoRot1, autoRot2, easedMorph) + uMouse.x * 0.5;
    float rotX = uMouse.y * 0.5;

    mat3 rotMatY = mat3(
        cos(rotY), 0.0, sin(rotY),
        0.0, 1.0, 0.0,
        -sin(rotY), 0.0, cos(rotY)
    );

    mat3 rotMatX = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(rotX), -sin(rotX),
        0.0, sin(rotX), cos(rotX)
    );

    finalPos = rotMatY * rotMatX * finalPos;

    vColor = mix(c1, c2, easedMorph);

    vAlpha = 0.3 + 0.7 * sin(uTime * 5.0 + aId * PI * 20.0);

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    gl_PointSize = (2.0 + aRandom.x * 2.5) * (40.0 / -mvPosition.z);
}`

const FRAGMENT_SRC = `
varying vec3 vColor;
varying float vAlpha;

void main() {
    vec2 uv = gl_PointCoord.xy - vec2(0.5);
    float dist = length(uv);

    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.1, dist);

    gl_FragColor = vec4(vColor, alpha * vAlpha);
}`

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  const scene = new Scene()
  const camera = new PerspectiveCamera(60, 1, 0.1, 1000)

  const positions = new Float32Array(PARTICLE_COUNT * 3)
  const ids = new Float32Array(PARTICLE_COUNT)
  const randoms = new Float32Array(PARTICLE_COUNT * 3)
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    ids[i] = i / PARTICLE_COUNT
    randoms[i * 3] = Math.random()
    randoms[i * 3 + 1] = Math.random()
    randoms[i * 3 + 2] = Math.random()
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('aId', new BufferAttribute(ids, 1))
  geometry.setAttribute('aRandom', new BufferAttribute(randoms, 3))

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMorphProgress: { value: 0 },
      uCurrentShape: { value: 0 },
      uTargetShape: { value: 0 },
      uMouse: { value: new Vector2(0, 0) },
    },
    vertexShader: VERTEX_SRC,
    fragmentShader: FRAGMENT_SRC,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  })

  const particles = new Points(geometry, material)
  // Every position attribute is zero — the figures are built in the vertex
  // shader — so the bounding sphere Three would cull against has no radius.
  // The pen never notices because its camera never moves off the origin.
  particles.frustumCulled = false
  scene.add(particles)

  let morphProgress = 0
  let currentShape = 0
  let targetShape = 0
  let transitioning = false

  const mouse = new Vector2(0, 0)
  const targetMouse = new Vector2(0, 0)

  const untrack = trackPointer(host, (nx, ny) => {
    // The pen reads the window in clip space, y up; this is the same reading
    // taken against the band.
    targetMouse.x = nx * 2 - 1
    targetMouse.y = 1 - ny * 2
  })

  const section = host.parentElement ?? host
  const advance = (e: Event) => {
    if (isInteractiveTarget(e.target)) return
    if (transitioning) return
    targetShape = (targetShape + 1) % TOTAL_SHAPES
    transitioning = true
    morphProgress = 0
  }
  section.addEventListener('click', advance)
  // Passive, and without preventDefault: the pen takes the touch, which on a
  // page would be taking the visitor's scroll.
  section.addEventListener('touchstart', advance, { passive: true })

  let seconds = 0

  return {
    resize(width, height, dpr) {
      renderer.setPixelRatio(dpr)
      // `false`: the hook owns the element's CSS size, Three owns its buffer.
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      // The pen's framing: pull back far enough for the widest figure, and
      // further still when the band is taller than it is wide.
      const fovRad = (camera.fov * Math.PI) / 180
      let z = SHAPE_EXTENT / Math.tan(fovRad / 2)
      if (camera.aspect < 1) z /= camera.aspect
      camera.position.z = z
      camera.updateProjectionMatrix()

      // Landscape only: a portrait band carries its copy across the full width
      // and has nothing to clear, so it keeps the pen's own centring.
      const halfWidth = camera.aspect >= 1 ? SHAPE_EXTENT * camera.aspect : SHAPE_EXTENT
      const room = Math.max(0, halfWidth - SHAPE_EXTENT - EDGE_MARGIN)
      particles.position.x =
        camera.aspect >= 1 ? Math.min(OFFSET_RIGHT * halfWidth, room) : 0
    },
    frame(elapsed) {
      const delta = Math.min(Math.max(elapsed - seconds, 0), 0.1)
      seconds = elapsed

      mouse.x += (targetMouse.x - mouse.x) * delta * 2
      mouse.y += (targetMouse.y - mouse.y) * delta * 2

      if (transitioning) {
        morphProgress += delta * 0.8
        if (morphProgress >= 1) {
          morphProgress = 0
          currentShape = targetShape
          transitioning = false
        }
      }

      material.uniforms.uTime.value = elapsed
      material.uniforms.uMorphProgress.value = morphProgress
      material.uniforms.uCurrentShape.value = currentShape
      material.uniforms.uTargetShape.value = targetShape
      material.uniforms.uMouse.value.copy(mouse)

      renderer.render(scene, camera)
    },
    dispose() {
      untrack()
      section.removeEventListener('click', advance)
      section.removeEventListener('touchstart', advance)
      geometry.dispose()
      material.dispose()
      // Hands the WebGL context back; browsers keep only a handful.
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function MorphBackdrop({ className }: { className?: string }) {
  // A hundred thousand additive points: the vertex work is the cost, and a
  // backdrop nobody inspects gains nothing from full retina density.
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.25 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--morph', className)} aria-hidden />
}
