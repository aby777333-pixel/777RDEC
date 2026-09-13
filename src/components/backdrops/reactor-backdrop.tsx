'use client'

import { Rajdhani, Space_Mono } from 'next/font/google'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  EllipseCurve,
  FogExp2,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  type Material,
  Mesh,
  MeshBasicMaterial,
  NormalBlending,
  OctahedronGeometry,
  PerspectiveCamera,
  PointLight,
  Points,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  WireframeGeometry,
} from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'
import { createOrbitRig } from './orbit-rig'
import { motionIsReduced } from './motion'

/**
 * "Sacred Geometry Reactor" by VoXelo, ported.
 * https://codepen.io/VoXelo/pen/myOPezP
 *
 * An octahedron of energy tubes — magenta running to gold, with light
 * travelling along every edge and bursting intermittently — around a second,
 * smaller one in blue and cyan turning the other way, the two joined vertex
 * to vertex. Inside, a molten core in amber and violet under a spinning
 * wireframe shell, a halo and three gyroscopic rings. Twelve orbs slide up
 * and down the outer edges, the vertices pulse, a disc of stardust swirls
 * faster the closer it is to the centre, and the whole reactor surges on an
 * irregular beat, through bloom, over a gradient field of cyan, magenta and
 * gold. The camera circles on its own and answers to drag and zoom.
 *
 * Every shader, geometry, colour, light, count, speed and timing is the pen's,
 * as is the bloom and output pass, the tone mapping, the fog, the gradient
 * ground, the scanlines and vignette over it, and the HUD — the frame, the
 * construct's name, the status readout with its live frequency, and the hint.
 *
 * What changed:
 *
 * - **OrbitControls is <OrbitRig>**, at the pen's damping, rotate speed and
 *   distance limits: drag to turn, Ctrl+wheel or pinch to zoom, so the page
 *   still scrolls.
 * - **The HUD is laid out around the headline.** The pen's title sits top
 *   left, where the copy is here; the title and the status sit together top
 *   right, and on a narrow band at the foot.
 * - **The view is centred right of the copy on a wide band**, by offsetting
 *   the camera's frustum, so the perspective is the pen's.
 * - **The rings' per-frame turns step at the pen's 60 a second.**
 */

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-reactor-display',
})
const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-reactor-mono',
})

const STEP_RATE = 60
const MAX_STEPS = 4
const WIDE_CENTRE_X = 0.68
const WIDE_FROM = 1024

const ORBIT = {
  dampingFactor: 0.05,
  rotateSpeed: 0.6,
  minDistance: 4,
  maxDistance: 20,
  autoRotateSpeed: 0.5,
} as const

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
  } catch {
    host.dataset.gl = 'off'
    return null
  }
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95

  const section = host.parentElement ?? host
  const freqUi = section.querySelector<HTMLElement>('[data-reactor-freq]')

  const scene = new Scene()
  scene.fog = new FogExp2(0x020204, 0.022)

  const camera = new PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.set(2.2, 1.55, 8.6)
  const target = new Vector3(0, 0, 0)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloomPass = new UnrealBloomPass(new Vector2(1, 1), 0.8, 0.44, 0.5)
  composer.addPass(bloomPass)
  const outputPass = new OutputPass()
  composer.addPass(outputPass)

  const colors = {
    cyan: new Color(0x00f0ff),
    deepBlue: new Color(0x0022ff),
    magenta: new Color(0xff0055),
    gold: new Color(0xffaa00),
    amberCore: new Color(0xffbc40),
    violetCore: new Color(0x8a2cff),
    emerald: new Color(0x00ff9d),
    hotWhite: new Color(0xffffff),
  }

  const sharedUniforms = {
    uTime: { value: 0 },
    uFlicker: { value: 1 },
  }

  // Everything that holds GPU memory, so dispose can hand all of it back.
  const geometries: BufferGeometry[] = []
  const materials: Material[] = []
  const geo = <T extends BufferGeometry>(g: T) => (geometries.push(g), g)
  const mat = <T extends Material>(m: T) => (materials.push(m), m)

  const masterGroup = new Group()
  const outerConstruct = new Group()
  const innerConstruct = new Group()
  const auraGroup = new Group()
  masterGroup.add(outerConstruct)
  masterGroup.add(innerConstruct)
  masterGroup.add(auraGroup)
  scene.add(masterGroup)

  const energyTubeMaterial = mat(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uColorA: { value: colors.magenta },
        uColorB: { value: colors.gold },
        uFlicker: sharedUniforms.uFlicker,
      },
      vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      uniform float uTime;
      uniform float uFlicker;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      float intermittent(float t) {
        float gate = step(0.4, sin(t * 5.0) * 0.5 + 0.5);
        float burst = smoothstep(0.8, 1.0, sin(t * 15.0) * 0.5 + 0.5);
        return max(gate * 0.4, burst);
      }

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.35);
        float traveling = smoothstep(0.1, 0.0, abs(fract(vUv.y * 3.0 - uTime * 2.0) - 0.5) - 0.1);
        float filament = 0.5 + 0.5 * sin((vUv.y * 42.0) - uTime * 12.0);
        float pulse = intermittent(uTime + vUv.y * 2.0) * uFlicker;
        float alpha = 0.11 + fresnel * 0.42 + traveling * 0.56 + filament * pulse * 0.22;
        vec3 baseColor = mix(uColorA, uColorB, vUv.y + sin(uTime) * 0.2);
        vec3 brightColor = mix(baseColor, vec3(1.0), traveling * 0.55);
        gl_FragColor = vec4(brightColor * 0.92, alpha);
      }
    `,
    }),
  )

  const holographicFaceMaterial = mat(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uColorA: { value: colors.deepBlue },
        uColorB: { value: colors.cyan },
      },
      vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vec4 mvPosition = viewMatrix * world;
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vViewPosition;

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 1.45);
        float scanline = sin(vWorld.y * 60.0 - uTime * 15.0) * 0.5 + 0.5;
        scanline = smoothstep(0.8, 1.0, scanline);
        float wave = sin(length(vWorld.xz) * 5.0 - uTime * 3.0) * 0.5 + 0.5;
        vec3 color = mix(uColorA, uColorB, wave + fresnel * 0.5);
        float alpha = (fresnel * 0.13) + (scanline * 0.08) + (wave * 0.04);
        gl_FragColor = vec4(color, alpha * 0.72);
      }
    `,
    }),
  )

  const coreShaderMaterial = mat(
    new ShaderMaterial({
      transparent: true,
      depthWrite: true,
      blending: NormalBlending,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uColorA: { value: colors.amberCore },
        uColorB: { value: colors.violetCore },
        uColorC: { value: colors.hotWhite },
      },
      vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vec4 mvPosition = viewMatrix * world;
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying vec3 vViewPosition;

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float rim = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.2);
        float latitude = sin((vWorld.y * 18.0) + uTime * 4.0) * 0.5 + 0.5;
        float lava = sin((vWorld.x + vWorld.y + vWorld.z) * 12.0 - uTime * 7.0) * 0.5 + 0.5;
        vec3 color = mix(uColorA, uColorB, latitude * 0.68 + lava * 0.22);
        color = mix(color, uColorC, rim * 0.38 + smoothstep(0.82, 1.0, lava) * 0.18);
        float alpha = 0.95;
        gl_FragColor = vec4(color, alpha);
      }
    `,
    }),
  )

  function makeTubeBetween(a: Vector3, b: Vector3, radius: number, material: Material) {
    const dir = new Vector3().subVectors(b, a)
    const len = dir.length()
    const mid = new Vector3().addVectors(a, b).multiplyScalar(0.5)
    const geometry = geo(new CylinderGeometry(radius, radius, len, 10, 1, true))
    geometry.rotateX(Math.PI * 0.5)
    const mesh = new Mesh(geometry, material)
    mesh.position.copy(mid)
    mesh.quaternion.setFromUnitVectors(new Vector3(0, 0, 1), dir.normalize())
    return mesh
  }

  function makeGlowNode(position: Vector3, color: Color, scale = 1) {
    const mesh = new Mesh(
      geo(new SphereGeometry(0.08 * scale, 16, 16)),
      mat(
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.8,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    )
    const glow = new Mesh(
      geo(new SphereGeometry(0.2 * scale, 16, 16)),
      mat(
        new MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.2,
          blending: AdditiveBlending,
          depthWrite: false,
        }),
      ),
    )
    const group = new Group()
    group.add(mesh)
    group.add(glow)
    group.position.copy(position)
    group.userData = { phase: Math.random() * Math.PI * 2, baseScale: scale }
    return group
  }

  function makeRing(radius: number, color: number, opacity = 0.32) {
    const curve = new EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0)
    const points = curve.getPoints(220).map((p) => new Vector3(p.x, p.y, 0))
    const geometry = geo(new BufferGeometry().setFromPoints(points))
    const material = mat(
      new LineBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
    return new LineLoop(geometry, material)
  }

  const R = 2.5
  const top = new Vector3(0, R, 0)
  const bottom = new Vector3(0, -R, 0)
  const left = new Vector3(-R, 0, 0)
  const right = new Vector3(R, 0, 0)
  const front = new Vector3(0, 0, R)
  const back = new Vector3(0, 0, -R)

  const outerVertices = { top, bottom, left, right, front, back }
  const outerEdges: [Vector3, Vector3][] = [
    [top, left], [top, right], [top, front], [top, back],
    [bottom, left], [bottom, right], [bottom, front], [bottom, back],
    [left, front], [front, right], [right, back], [back, left],
  ]

  const innerScale = 0.45
  const inner = {
    top: top.clone().multiplyScalar(innerScale),
    bottom: bottom.clone().multiplyScalar(innerScale),
    left: left.clone().multiplyScalar(innerScale),
    right: right.clone().multiplyScalar(innerScale),
    front: front.clone().multiplyScalar(innerScale),
    back: back.clone().multiplyScalar(innerScale),
  }

  const innerEdges: [Vector3, Vector3][] = [
    [inner.top, inner.left], [inner.top, inner.right], [inner.top, inner.front], [inner.top, inner.back],
    [inner.bottom, inner.left], [inner.bottom, inner.right], [inner.bottom, inner.front], [inner.bottom, inner.back],
    [inner.left, inner.front], [inner.front, inner.right], [inner.right, inner.back], [inner.back, inner.left],
  ]

  const sacredConnections: [Vector3, Vector3][] = [
    [top, inner.top], [bottom, inner.bottom], [left, inner.left],
    [right, inner.right], [front, inner.front], [back, inner.back],
  ]

  type Orb = {
    mesh: Group
    glowMat: MeshBasicMaterial
    a: Vector3
    b: Vector3
    speed: number
    offset: number
    direction: 1 | -1
  }
  const animatedElements = {
    nodes: [] as Group[],
    orbs: [] as Orb[],
    rings: [] as LineLoop<BufferGeometry, LineBasicMaterial>[],
  }

  for (const [a, b] of outerEdges) {
    outerConstruct.add(makeTubeBetween(a, b, 0.015, mat(energyTubeMaterial.clone())))
  }

  const innerTubeMat = mat(energyTubeMaterial.clone())
  innerTubeMat.uniforms.uColorA.value = colors.deepBlue
  innerTubeMat.uniforms.uColorB.value = colors.cyan
  for (const [a, b] of innerEdges) innerConstruct.add(makeTubeBetween(a, b, 0.01, innerTubeMat))

  const connMat = mat(energyTubeMaterial.clone())
  connMat.uniforms.uColorA.value = colors.magenta
  connMat.uniforms.uColorB.value = colors.cyan
  for (const [a, b] of sacredConnections) masterGroup.add(makeTubeBetween(a, b, 0.005, connMat))

  const outerFace = new Mesh(geo(new OctahedronGeometry(R * 0.99, 0)), holographicFaceMaterial)
  outerConstruct.add(outerFace)

  const innerFaceMat = mat(holographicFaceMaterial.clone())
  innerFaceMat.uniforms.uColorA.value = colors.magenta
  innerFaceMat.uniforms.uColorB.value = colors.gold
  const innerFace = new Mesh(geo(new OctahedronGeometry(R * innerScale * 0.98, 0)), innerFaceMat)
  innerConstruct.add(innerFace)

  const wireMat = mat(
    new LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.16, blending: AdditiveBlending }),
  )
  innerConstruct.add(new LineSegments(geo(new WireframeGeometry(innerFace.geometry)), wireMat))

  const outerWireMat = mat(
    new LineBasicMaterial({ color: 0xffbc40, transparent: true, opacity: 0.09, blending: AdditiveBlending }),
  )
  outerConstruct.add(new LineSegments(geo(new WireframeGeometry(outerFace.geometry)), outerWireMat))

  for (const p of Object.values(outerVertices)) {
    const n = makeGlowNode(p, colors.magenta, 1.2)
    outerConstruct.add(n)
    animatedElements.nodes.push(n)
  }
  for (const p of Object.values(inner)) {
    const n = makeGlowNode(p, colors.amberCore, 0.78)
    innerConstruct.add(n)
    animatedElements.nodes.push(n)
  }

  const centralCore = new Mesh(geo(new IcosahedronGeometry(0.42, 3)), coreShaderMaterial)
  innerConstruct.add(centralCore)

  const coreWire = new LineSegments(
    geo(new WireframeGeometry(geo(new IcosahedronGeometry(0.475, 2)))),
    mat(
      new LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.38,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    ),
  )
  innerConstruct.add(coreWire)

  const coreHaloMat = mat(
    new MeshBasicMaterial({
      color: colors.amberCore,
      transparent: true,
      opacity: 0.07,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  )
  const coreHalo = new Mesh(geo(new SphereGeometry(0.82, 40, 40)), coreHaloMat)
  innerConstruct.add(coreHalo)

  const ringA = makeRing(0.72, 0xffbc40, 0.46)
  const ringB = makeRing(0.95, 0x8a2cff, 0.32)
  const ringC = makeRing(1.16, 0x00f0ff, 0.22)
  ringA.rotation.x = Math.PI * 0.5
  ringB.rotation.y = Math.PI * 0.5
  ringC.rotation.z = Math.PI * 0.25
  innerConstruct.add(ringA, ringB, ringC)
  animatedElements.rings.push(ringA, ringB, ringC)

  const coreLight = new PointLight(0xffbc40, 7, 9, 2)
  innerConstruct.add(coreLight)
  const violetLight = new PointLight(0x8a2cff, 3, 11, 2.4)
  violetLight.position.set(0.85, 0.6, 0.75)
  innerConstruct.add(violetLight)
  const cyanRimLight = new PointLight(0x00f0ff, 2.5, 15, 2)
  cyanRimLight.position.set(-3.4, 2.2, 4.4)
  scene.add(cyanRimLight)
  const warmFillLight = new PointLight(0xff9d2d, 1.4, 16, 2)
  warmFillLight.position.set(4.4, -2.4, 3.2)
  scene.add(warmFillLight)

  // ---- stardust ----
  const particleCount = 1400
  const particlePos = new Float32Array(particleCount * 3)
  const particleScales = new Float32Array(particleCount)
  const particleColorMix = new Float32Array(particleCount)
  for (let i = 0; i < particleCount; i++) {
    const r = 0.35 + Math.pow(Math.random(), 2.0) * 4.35
    const theta = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * (1.0 / r) * 2.2
    particlePos[i * 3] = Math.cos(theta) * r
    particlePos[i * 3 + 1] = y
    particlePos[i * 3 + 2] = Math.sin(theta) * r
    particleScales[i] = Math.random()
    particleColorMix[i] = Math.random()
  }
  const particleGeo = geo(new BufferGeometry())
  particleGeo.setAttribute('position', new BufferAttribute(particlePos, 3))
  particleGeo.setAttribute('aScale', new BufferAttribute(particleScales, 1))
  particleGeo.setAttribute('aColorMix', new BufferAttribute(particleColorMix, 1))

  const particleMat = mat(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: sharedUniforms.uTime,
        uColorA: { value: colors.cyan },
        uColorB: { value: colors.amberCore },
        uColorC: { value: colors.magenta },
      },
      vertexShader: `
      uniform float uTime;
      attribute float aScale;
      attribute float aColorMix;
      varying float vAlpha;
      varying float vColorMix;

      void main() {
        float distXZ = max(length(position.xz), 0.001);
        float angle = uTime * (0.5 / distXZ);
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

        vec3 pos = position;
        pos.xz = rot * pos.xz;
        pos.y += sin(uTime * 1.2 + distXZ * 3.0 + aScale * 8.0) * 0.045;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (16.0 * aScale + 1.6) * (1.0 / -mvPosition.z);
        vAlpha = (0.28 + 0.72 * sin(uTime * 3.0 + aScale * 10.0)) * (1.0 - smoothstep(0.0, 5.2, length(pos)));
        vColorMix = aColorMix;

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      varying float vAlpha;
      varying float vColorMix;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        float glow = smoothstep(0.5, 0.0, dist);
        vec3 color = mix(uColorA, uColorB, smoothstep(0.25, 0.85, vColorMix));
        color = mix(color, uColorC, smoothstep(0.78, 1.0, vColorMix) * 0.45);

        gl_FragColor = vec4(color * glow, vAlpha * glow);
      }
    `,
    }),
  )
  const stardust = new Points(particleGeo, particleMat)
  scene.add(stardust)

  // ---- stars ----
  const starCount = 900
  const starPos = new Float32Array(starCount * 3)
  const starScale = new Float32Array(starCount)
  for (let i = 0; i < starCount; i++) {
    const radius = 15 + Math.random() * 34
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    starPos[i * 3 + 1] = radius * Math.cos(phi)
    starPos[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)
    starScale[i] = Math.random()
  }
  const starGeo = geo(new BufferGeometry())
  starGeo.setAttribute('position', new BufferAttribute(starPos, 3))
  starGeo.setAttribute('aScale', new BufferAttribute(starScale, 1))
  const starMat = mat(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: { uTime: sharedUniforms.uTime },
      vertexShader: `
      uniform float uTime;
      attribute float aScale;
      varying float vAlpha;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = (8.0 * aScale + 1.0) * (1.0 / -mvPosition.z);
        vAlpha = 0.28 + 0.5 * sin(uTime * 1.5 + aScale * 20.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      varying float vAlpha;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        float glow = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(vec3(0.75, 0.92, 1.0), vAlpha * glow * 0.56);
      }
    `,
    }),
  )
  const stars = new Points(starGeo, starMat)
  scene.add(stars)

  // ---- orbs on the outer edges ----
  outerEdges.forEach((edge, i) => {
    const orbGroup = new Group()
    orbGroup.add(
      new Mesh(geo(new SphereGeometry(0.06, 16, 16)), mat(new MeshBasicMaterial({ color: 0xffffff }))),
    )
    const glowMat = mat(
      new MeshBasicMaterial({
        color: colors.magenta,
        transparent: true,
        opacity: 0.4,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    )
    orbGroup.add(new Mesh(geo(new SphereGeometry(0.15, 16, 16)), glowMat))
    outerConstruct.add(orbGroup)
    animatedElements.orbs.push({
      mesh: orbGroup,
      glowMat,
      a: edge[0],
      b: edge[1],
      speed: 0.2 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
      direction: i % 2 === 0 ? 1 : -1,
    })
  })

  const orbit = createOrbitRig(camera, target, host, ORBIT, () => {
    if (!motionIsReduced()) return
    orbit.nudge()
    composer.render()
  })

  let width = 1
  let height = 1
  let stepsTaken = -1
  const orbPos = new Vector3()
  const orbDir = new Vector3()
  const orbUp = new Vector3()
  const orbRight = new Vector3()

  const frameView = () => {
    if (width >= WIDE_FROM) {
      camera.setViewOffset(width, height, width * (0.5 - WIDE_CENTRE_X), 0, width, height)
    } else {
      camera.clearViewOffset()
    }
  }

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
    frame(time) {
      sharedUniforms.uTime.value = time

      const globalPulse = 0.8 + 0.2 * Math.sin(time * 2.0)
      const randomSurge = smoothstep(0.85, 1.0, Math.sin(time * 7.3) * 0.5 + 0.5)
      sharedUniforms.uFlicker.value = globalPulse + randomSurge * 1.5

      if (freqUi && Math.floor(time * 10) % 5 === 0) {
        freqUi.textContent = (144.0 + (Math.random() * 2 - 1) + randomSurge * 15).toFixed(1)
      }

      masterGroup.position.y = Math.sin(time * 0.5) * 0.1

      outerConstruct.rotation.y = time * 0.1
      outerConstruct.rotation.x = Math.sin(time * 0.15) * 0.1
      outerConstruct.rotation.z = Math.cos(time * 0.1) * 0.05

      innerConstruct.rotation.y = -time * 0.25
      innerConstruct.rotation.x = Math.cos(time * 0.2) * 0.15

      centralCore.rotation.x = time * 1.5
      centralCore.rotation.y = time * 1.2
      centralCore.rotation.z = time * 0.38
      centralCore.scale.setScalar(1.0 + Math.sin(time * 8.0) * 0.045 + randomSurge * 0.16)

      coreWire.rotation.x = -time * 1.1
      coreWire.rotation.y = time * 1.35
      coreWire.scale.setScalar(1.0 + Math.sin(time * 6.0) * 0.035 + randomSurge * 0.11)

      coreHalo.scale.setScalar(1.0 + Math.sin(time * 3.4) * 0.02 + randomSurge * 0.05)
      coreHaloMat.opacity = 0.055 + Math.sin(time * 3.1) * 0.015 + randomSurge * 0.03

      coreLight.intensity = 4.5 + Math.sin(time * 10) * 0.8 + randomSurge * 2.2
      violetLight.intensity = 2.2 + Math.sin(time * 4.0) * 0.8 + randomSurge * 2.5
      cyanRimLight.intensity = 2.0 + Math.sin(time * 2.5) * 0.5

      // The rings turn by a fixed amount per frame in the pen: per 60th here.
      const due = Math.floor(time * STEP_RATE)
      if (stepsTaken < 0) stepsTaken = due - 1
      const steps = Math.max(0, Math.min(MAX_STEPS, due - stepsTaken))
      stepsTaken = Math.max(due, stepsTaken)
      animatedElements.rings.forEach((ring, index) => {
        ring.rotation.x += (0.004 + index * 0.001) * steps
        ring.rotation.y += (0.003 + index * 0.0015) * steps
        ring.rotation.z += (0.002 + index * 0.0008) * steps
        ring.scale.setScalar(1.0 + Math.sin(time * (2.0 + index) + index) * 0.025 + randomSurge * 0.05)
        ring.material.opacity = ring === ringA ? 0.42 + randomSurge * 0.14 : 0.22 + randomSurge * 0.1
      })

      stardust.rotation.y = time * 0.025
      stars.rotation.y = time * 0.004
      stars.rotation.x = Math.sin(time * 0.08) * 0.02

      for (const node of animatedElements.nodes) {
        const s =
          node.userData.baseScale *
          (1.0 + 0.15 * Math.sin(time * 5.0 + node.userData.phase) + randomSurge * 0.3)
        node.scale.setScalar(s)
      }

      for (const orb of animatedElements.orbs) {
        const raw = (time * orb.speed + orb.offset) % 2.0
        const t = raw > 1.0 ? 2.0 - raw : raw
        orbPos.lerpVectors(orb.a, orb.b, orb.direction === 1 ? t : 1.0 - t)
        orbDir.subVectors(orb.b, orb.a).normalize()
        if (Math.abs(orbDir.y) > 0.9) orbUp.set(1, 0, 0)
        else orbUp.set(0, 1, 0)
        orbRight.crossVectors(orbDir, orbUp).normalize()
        orbPos.addScaledVector(orbRight, Math.sin(time * 15.0 + orb.offset) * 0.02)
        orb.mesh.position.copy(orbPos)

        const flare = Math.sin(time * 10.0 + orb.offset) * 0.5 + 0.5
        orb.mesh.scale.setScalar(1.0 + flare * 0.5)
        orb.glowMat.opacity = 0.3 + flare * 0.4
      }

      orbit.frame(time)
      composer.render()
    },
    dispose() {
      orbit.dispose()
      for (const g of geometries) g.dispose()
      for (const m of materials) m.dispose()
      bloomPass.dispose()
      outputPass.dispose()
      composer.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
    },
  }
}

export function ReactorBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 2 })
  return (
    <>
      <div ref={hostRef} className={cn('pen-scene pen-scene--reactor', className)} aria-hidden />
      <div className={cn('reactor-ui', rajdhani.variable, spaceMono.variable)} aria-hidden>
        <div className="reactor-frame" />
        <div className="reactor-header">
          <div className="reactor-title">
            <div className="reactor-title__name">Construct_04</div>
            <p>Intermittent Energy Matrix</p>
          </div>
          <div className="reactor-status">
            SYS.ONLINE
            <br />
            FREQ: <span data-reactor-freq>144.0</span>HZ
            <br />
            CORE: <span className="reactor-status__gold">VISIBLE</span>
            <br />
            STB: <span className="reactor-status__cyan">99.9%</span>
          </div>
        </div>
        <div className="reactor-footer">
          <div className="reactor-hint">Initialize Interaction [Drag/Zoom]</div>
          <svg width="40" height="40" viewBox="0 0 40 40" className="reactor-glyph">
            <circle cx="20" cy="20" r="18" fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="20" cy="20" r="10" fill="none" stroke="#ffbc40" strokeWidth="1" />
            <circle cx="20" cy="20" r="2" fill="#fff" />
          </svg>
        </div>
      </div>
    </>
  )
}
