'use client'

import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * "Mediterranean Drift V3 (WebGL)" by Luis Lessrain, ported.
 * https://codepen.io/luis-lessrain/pen/emgBwPj
 *
 * Fourteen thousand tracers advected through a wind field built from six
 * pressure systems, each a rotating vortex with a little inflow. Every frame
 * draws each tracer as a line from where it was to where it is into an
 * offscreen texture that is faded a few percent toward the background rather
 * than cleared, so the paths accumulate into streamlines and then dissolve.
 * Colour is the tracer's own speed read through the pen's eight-stop weather
 * ramp — calm blue through to gale red. The systems wander, breathe and swap
 * spin on a slow cycle, so the map is never twice the same.
 *
 * The field, the advection, the ping-pong fade, the ramp and the six systems
 * are the pen's, values included. What is left behind is the instrument around
 * it: the mode switcher, the caption, the speed legend, and the `L`/`H`
 * letters over each system. The pen ships six named wind modes and opens on
 * Mistral; a backdrop has no control panel, so Mistral is simply what it is.
 *
 * Two things the pen drew in the DOM are drawn here in GL instead:
 *
 * - **The rings.** Three faint circles mark each system. The pen positions
 *   three CSS elements per system every frame, but it also carries a point
 *   shader that draws exactly those three rings — same radii, same falloff —
 *   and never calls it. That shader is used here, so the rings cost one draw
 *   call of six points and no layout. The `L`/`H` label at the centre is text
 *   and does not belong in a band nobody can read; it is dropped.
 * - **The grid.** The 84px map rule is a CSS gradient on the pen's container,
 *   reproduced as one on `.pen-scene--drift`.
 *
 * Three of the pen's own arrays are absent because nothing reads them: it
 * bins each tracer's speed into eight bands and stores that per tracer and
 * per field cell, but the line colour is mixed from the continuous ramp, so
 * the bands are written and never used.
 *
 * The pen reloads the page when the GL context comes back after being lost.
 * Here the scene simply stops — a marketing page may not navigate itself.
 */

/** Tracers. The pen's count, and the reason it throttles itself to 30fps. */
const COUNT = 14000
const TARGET_FPS = 30
const FRAME_MS = 1000 / TARGET_FPS

const ERASE = 0.07
const LINE_ALPHA = 0.54
const LIFE_MIN = 1.15
const LIFE_MAX = 3.9

const INFLOW = 0.32
const SYSTEM_EVOLUTION = 0.08
const MARKER_SMOOTHING = 0.12

const GRID_STEP = 28
const FIELD_ROWS_PER_FRAME = 1

/** The pen's Mistral palette: calm blue through to gale red. */
const COLORS: readonly (readonly [number, number, number])[] = [
  [0x45 / 255, 0x67 / 255, 0x9c / 255],
  [0x43 / 255, 0x83 / 255, 0xad / 255],
  [0x3f / 255, 0xa2 / 255, 0xa4 / 255],
  [0x65 / 255, 0xb4 / 255, 0x83 / 255],
  [0xb6 / 255, 0xc6 / 255, 0x59 / 255],
  [0xd6 / 255, 0xa4 / 255, 0x42 / 255],
  [0xd1 / 255, 0x75 / 255, 0x3d / 255],
  [0xb8 / 255, 0x46 / 255, 0x46 / 255],
]

const NBINS = COLORS.length
const SPEED_COLOR_MAX_SQ = 0.0256
const SPEED_COLOR_GAIN = 1 / SPEED_COLOR_MAX_SQ

/** The pen's Mistral mode, whole. */
const MODE = {
  bg: [10 / 255, 18 / 255, 27 / 255] as const,
  flowSpeed: 2.9,
  fieldGain: 0.43,
  bgU: 0.07,
  bgV: 0.02,
  wander: 0.026,
  systems: [
    { x: 0.14, y: 0.24, spin: -1, r: 0.2, strength: 0.84 },
    { x: 0.34, y: 0.44, spin: 1, r: 0.18, strength: 0.86 },
    { x: 0.54, y: 0.66, spin: 1, r: 0.23, strength: 0.95 },
    { x: 0.74, y: 0.34, spin: -1, r: 0.2, strength: 0.7 },
    { x: 0.88, y: 0.72, spin: 1, r: 0.22, strength: 0.8 },
    { x: 0.46, y: 0.2, spin: -1, r: 0.18, strength: 0.62 },
  ],
} as const

const QUAD_VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`

const QUAD_FRAG = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec3 u_bg;
uniform float u_keep;
uniform float u_mode;
varying vec2 v_uv;
void main() {
  vec3 c = texture2D(u_tex, v_uv).rgb;
  vec3 faded = mix(u_bg, c, u_keep);
  vec3 outColor = mix(c, faded, u_mode);
  gl_FragColor = vec4(outColor, 1.0);
}`

const LINE_VERT = `
attribute vec2 a_pos;
attribute vec4 a_color;
uniform float u_aspect;
varying vec4 v_color;
void main() {
  float x = (a_pos.x / u_aspect) * 2.0 - 1.0;
  float y = 1.0 - a_pos.y * 2.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
  v_color = a_color;
}`

const LINE_FRAG = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}`

const RING_VERT = `
attribute vec2 a_pos;
attribute vec4 a_color;
attribute float a_size;
uniform float u_aspect;
varying vec4 v_color;
void main() {
  float x = (a_pos.x / u_aspect) * 2.0 - 1.0;
  float y = 1.0 - a_pos.y * 2.0;
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = a_size;
  v_color = a_color;
}`

const RING_FRAG = `
precision mediump float;
varying vec4 v_color;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p) * 2.0;
  float outer = smoothstep(1.0, 0.94, d) * smoothstep(0.88, 0.94, d);
  float mid = smoothstep(0.74, 0.69, d) * smoothstep(0.63, 0.69, d);
  float inner = smoothstep(0.48, 0.43, d) * smoothstep(0.36, 0.43, d);
  float alpha = max(max(outer, mid * 0.72), inner * 0.58);
  gl_FragColor = vec4(v_color.rgb, alpha * v_color.a);
}`

type System = {
  x: number
  y: number
  spin: number
  r: number
  strength: number
  baseR: number
  baseStrength: number
  displayX: number
  displayY: number
  phaseX: number
  phaseY: number
  phaseStrength: number
  phaseRadius: number
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}

function setup(canvas: HTMLCanvasElement): BackdropScene | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  })
  if (!gl) return null

  const shaders: WebGLShader[] = []
  const programs: WebGLProgram[] = []
  const buffers: WebGLBuffer[] = []
  let textures: WebGLTexture[] = []
  let framebuffers: WebGLFramebuffer[] = []

  const giveUp = () => {
    for (const b of buffers) gl.deleteBuffer(b)
    for (const p of programs) gl.deleteProgram(p)
    for (const s of shaders) gl.deleteShader(s)
    for (const t of textures) gl.deleteTexture(t)
    for (const f of framebuffers) gl.deleteFramebuffer(f)
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return null
  }

  const compile = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type)
    if (!shader) return null
    shaders.push(shader)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(gl.getShaderInfoLog(shader))
      }
      return null
    }
    return shader
  }

  const link = (vertexSrc: string, fragmentSrc: string): WebGLProgram | null => {
    const vs = compile(gl.VERTEX_SHADER, vertexSrc)
    const fs = compile(gl.FRAGMENT_SHADER, fragmentSrc)
    const program = gl.createProgram()
    if (!vs || !fs || !program) return null
    programs.push(program)
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(gl.getProgramInfoLog(program))
      }
      return null
    }
    return program
  }

  const quadProgram = link(QUAD_VERT, QUAD_FRAG)
  const lineProgram = link(LINE_VERT, LINE_FRAG)
  const ringProgram = link(RING_VERT, RING_FRAG)
  if (!quadProgram || !lineProgram || !ringProgram) return giveUp()

  const makeBuffer = (): WebGLBuffer | null => {
    const buffer = gl.createBuffer()
    if (buffer) buffers.push(buffer)
    return buffer
  }

  const quadBuffer = makeBuffer()
  const linePositionBuffer = makeBuffer()
  const lineColorBuffer = makeBuffer()
  const ringPositionBuffer = makeBuffer()
  const ringColorBuffer = makeBuffer()
  const ringSizeBuffer = makeBuffer()
  if (
    !quadBuffer ||
    !linePositionBuffer ||
    !lineColorBuffer ||
    !ringPositionBuffer ||
    !ringColorBuffer ||
    !ringSizeBuffer
  ) {
    return giveUp()
  }

  const quad = {
    aPos: gl.getAttribLocation(quadProgram, 'a_pos'),
    uTex: gl.getUniformLocation(quadProgram, 'u_tex'),
    uBg: gl.getUniformLocation(quadProgram, 'u_bg'),
    uKeep: gl.getUniformLocation(quadProgram, 'u_keep'),
    uMode: gl.getUniformLocation(quadProgram, 'u_mode'),
  }
  const lines = {
    aPos: gl.getAttribLocation(lineProgram, 'a_pos'),
    aColor: gl.getAttribLocation(lineProgram, 'a_color'),
    uAspect: gl.getUniformLocation(lineProgram, 'u_aspect'),
  }
  const rings = {
    aPos: gl.getAttribLocation(ringProgram, 'a_pos'),
    aColor: gl.getAttribLocation(ringProgram, 'a_color'),
    aSize: gl.getAttribLocation(ringProgram, 'a_size'),
    uAspect: gl.getUniformLocation(ringProgram, 'u_aspect'),
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  const xs = new Float32Array(COUNT)
  const ys = new Float32Array(COUNT)
  const ages = new Float32Array(COUNT)
  const lifes = new Float32Array(COUNT)
  const linePositions = new Float32Array(COUNT * 4)
  const lineColors = new Float32Array(COUNT * 8)

  gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, linePositions.byteLength, gl.DYNAMIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, lineColors.byteLength, gl.DYNAMIC_DRAW)

  const systemCount = MODE.systems.length
  const ringPositions = new Float32Array(systemCount * 2)
  const ringColors = new Float32Array(systemCount * 4)
  const ringSizes = new Float32Array(systemCount)

  gl.bindBuffer(gl.ARRAY_BUFFER, ringPositionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, ringPositions.byteLength, gl.DYNAMIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, ringColorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, ringColors.byteLength, gl.DYNAMIC_DRAW)
  gl.bindBuffer(gl.ARRAY_BUFFER, ringSizeBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, ringSizes.byteLength, gl.DYNAMIC_DRAW)

  const systems: System[] = MODE.systems.map((s) => ({
    x: s.x,
    y: s.y,
    spin: s.spin,
    r: s.r,
    strength: s.strength,
    baseR: s.r,
    baseStrength: s.strength,
    displayX: s.x,
    displayY: s.y,
    phaseX: rand(0, Math.PI * 2),
    phaseY: rand(0, Math.PI * 2),
    phaseStrength: rand(0, Math.PI * 2),
    phaseRadius: rand(0, Math.PI * 2),
    // The pen also gives each system a drift velocity, which it never
    // integrates; the wobble in stepSystems is what actually moves them, so
    // that dead field is not carried over.
  }))

  let width = 1
  let height = 1
  let aspect = 1
  let gridW = 2
  let gridH = 2
  let fieldRow = 0
  let fieldU = new Float32Array(4)
  let fieldV = new Float32Array(4)
  let sampleU = 0
  let sampleV = 0
  let sampleSpeedSq = 0
  let lastSeconds = -1
  let lastStepMs = 0
  let elapsedMs = 0
  let read: { tex: WebGLTexture; fbo: WebGLFramebuffer } | null = null
  let write: { tex: WebGLTexture; fbo: WebGLFramebuffer } | null = null
  let contextLost = false

  const onLost = (event: Event) => {
    event.preventDefault()
    contextLost = true
  }
  canvas.addEventListener('webglcontextlost', onLost)

  const spawn = (i: number) => {
    const x = rand(0, aspect)
    const y = rand(0, 1)
    xs[i] = x
    ys[i] = y
    ages[i] = rand(0, LIFE_MAX)
    lifes[i] = rand(LIFE_MIN, LIFE_MAX)
  }
  for (let i = 0; i < COUNT; i++) spawn(i)

  const clearFramebuffer = (fbo: WebGLFramebuffer) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.disable(gl.BLEND)
    gl.clearColor(MODE.bg[0], MODE.bg[1], MODE.bg[2], 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  const rebuildRenderTargets = () => {
    for (const t of textures) gl.deleteTexture(t)
    for (const f of framebuffers) gl.deleteFramebuffer(f)
    textures = []
    framebuffers = []

    const pair: { tex: WebGLTexture; fbo: WebGLFramebuffer }[] = []
    for (let i = 0; i < 2; i++) {
      const tex = gl.createTexture()
      const fbo = gl.createFramebuffer()
      if (!tex || !fbo) return false
      textures.push(tex)
      framebuffers.push(fbo)
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      // prettier-ignore
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null,
      )
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      clearFramebuffer(fbo)
      pair.push({ tex, fbo })
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    read = pair[0]
    write = pair[1]
    return true
  }

  const computeCell = (fx: number, fy: number, p: number) => {
    let u = MODE.bgU
    let v = MODE.bgV

    for (let k = 0; k < systems.length; k++) {
      const s = systems[k]
      const rx = fx - s.x * aspect
      const ry = fy - s.y
      const d2 = rx * rx + ry * ry + 0.0001
      const d = Math.sqrt(d2)
      const invD = 1 / d
      const r = s.r
      const mag = s.strength * (d / r) * Math.exp(-d2 / (2 * r * r)) * MODE.fieldGain

      u += s.spin * mag * (-ry * invD)
      v += s.spin * mag * (rx * invD)

      const radial = -s.spin * INFLOW * mag
      u += rx * invD * radial
      v += ry * invD * radial
    }

    fieldU[p] = u
    fieldV[p] = v
  }

  const updateFieldRows = (rows: number) => {
    for (let r = 0; r < rows; r++) {
      const fy = fieldRow / (gridH - 1)
      let p = fieldRow * gridW
      for (let x = 0; x < gridW; x++) {
        computeCell((x / (gridW - 1)) * aspect, fy, p)
        p++
      }
      fieldRow++
      if (fieldRow >= gridH) fieldRow = 0
    }
  }

  const rebuildField = () => {
    gridW = Math.max(2, Math.ceil(width / GRID_STEP))
    gridH = Math.max(2, Math.ceil(height / GRID_STEP))
    fieldRow = 0
    const total = gridW * gridH
    fieldU = new Float32Array(total)
    fieldV = new Float32Array(total)
    for (let y = 0; y < gridH; y++) updateFieldRows(1)
  }

  const sampleField = (fx: number, fy: number) => {
    const gx = clamp((fx / aspect) * (gridW - 1), 0, gridW - 1)
    const gy = clamp(fy * (gridH - 1), 0, gridH - 1)
    const x0 = gx | 0
    const y0 = gy | 0
    const x1 = x0 < gridW - 1 ? x0 + 1 : x0
    const y1 = y0 < gridH - 1 ? y0 + 1 : y0
    const tx = gx - x0
    const ty = gy - y0
    const i00 = y0 * gridW + x0
    const i10 = y0 * gridW + x1
    const i01 = y1 * gridW + x0
    const i11 = y1 * gridW + x1

    const u0 = fieldU[i00] + (fieldU[i10] - fieldU[i00]) * tx
    const u1 = fieldU[i01] + (fieldU[i11] - fieldU[i01]) * tx
    const v0 = fieldV[i00] + (fieldV[i10] - fieldV[i00]) * tx
    const v1 = fieldV[i01] + (fieldV[i11] - fieldV[i01]) * tx

    sampleU = u0 + (u1 - u0) * ty
    sampleV = v0 + (v1 - v0) * ty
    sampleSpeedSq = sampleU * sampleU + sampleV * sampleV
  }

  const writeLineColor = (offset: number, sp2: number) => {
    const scaled = clamp(sp2 * SPEED_COLOR_GAIN, 0, 1) * (NBINS - 1)
    const idx = scaled | 0
    const next = idx < NBINS - 1 ? idx + 1 : idx
    const mix = scaled - idx
    const c0 = COLORS[idx]
    const c1 = COLORS[next]
    const r = c0[0] + (c1[0] - c0[0]) * mix
    const g = c0[1] + (c1[1] - c0[1]) * mix
    const b = c0[2] + (c1[2] - c0[2]) * mix

    lineColors[offset++] = r
    lineColors[offset++] = g
    lineColors[offset++] = b
    lineColors[offset++] = LINE_ALPHA
    lineColors[offset++] = r
    lineColors[offset++] = g
    lineColors[offset++] = b
    lineColors[offset++] = LINE_ALPHA
    return offset
  }

  const stepSystems = (dt: number, seconds: number) => {
    const driftEase = Math.min(1, dt * 0.32)

    for (let i = 0; i < systems.length; i++) {
      const s = systems[i]
      const src = MODE.systems[i]
      const wobbleX = Math.sin(seconds * 0.071 + s.phaseX) * MODE.wander
      const wobbleY = Math.cos(seconds * 0.064 + s.phaseY) * MODE.wander
      const tx = clamp(src.x + wobbleX, 0.1, 0.9)
      const ty = clamp(src.y + wobbleY, 0.14, 0.86)

      s.x += (tx - s.x) * driftEase
      s.y += (ty - s.y) * driftEase

      const strengthWave = Math.sin(seconds * 0.045 + s.phaseStrength)
      const radiusWave = Math.cos(seconds * 0.038 + s.phaseRadius)

      s.baseStrength += (src.strength - s.baseStrength) * driftEase
      s.baseR += (src.r - s.baseR) * driftEase
      s.strength = s.baseStrength * (1 + strengthWave * SYSTEM_EVOLUTION)
      s.r = s.baseR * (1 + radiusWave * SYSTEM_EVOLUTION * 0.7)

      s.displayX += (s.x - s.displayX) * MARKER_SMOOTHING
      s.displayY += (s.y - s.displayY) * MARKER_SMOOTHING
    }
  }

  const simulate = (dt: number) => {
    let vp = 0
    let cp = 0

    for (let i = 0; i < COUNT; i++) {
      const x = xs[i]
      const y = ys[i]
      sampleField(x, y)
      const nx = x + sampleU * dt * MODE.flowSpeed
      const ny = y + sampleV * dt * MODE.flowSpeed

      ages[i] += dt

      if (ages[i] > lifes[i] || nx < 0 || nx > aspect || ny < 0 || ny > 1) {
        spawn(i)
        // A respawned tracer draws a zero-length line at its new home, so it
        // arrives without a streak across the band from wherever it died.
        linePositions[vp++] = xs[i]
        linePositions[vp++] = ys[i]
        linePositions[vp++] = xs[i]
        linePositions[vp++] = ys[i]
        cp = writeLineColor(cp, 0)
        continue
      }

      xs[i] = nx
      ys[i] = ny

      linePositions[vp++] = x
      linePositions[vp++] = y
      linePositions[vp++] = nx
      linePositions[vp++] = ny
      cp = writeLineColor(cp, sampleSpeedSq)
    }
  }

  const drawQuad = (texture: WebGLTexture, mode: number) => {
    gl.useProgram(quadProgram)
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.enableVertexAttribArray(quad.aPos)
    gl.vertexAttribPointer(quad.aPos, 2, gl.FLOAT, false, 0, 0)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.uniform1i(quad.uTex, 0)
    gl.uniform3f(quad.uBg, MODE.bg[0], MODE.bg[1], MODE.bg[2])
    gl.uniform1f(quad.uKeep, 1 - ERASE)
    gl.uniform1f(quad.uMode, mode)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  const drawLines = () => {
    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, linePositions)
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, lineColors)

    gl.useProgram(lineProgram)
    gl.uniform1f(lines.uAspect, aspect)
    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer)
    gl.enableVertexAttribArray(lines.aPos)
    gl.vertexAttribPointer(lines.aPos, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer)
    gl.enableVertexAttribArray(lines.aColor)
    gl.vertexAttribPointer(lines.aColor, 4, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.LINES, 0, COUNT * 2)
    gl.disable(gl.BLEND)
  }

  const drawRings = () => {
    let pp = 0
    let cp = 0
    for (let i = 0; i < systems.length; i++) {
      const s = systems[i]
      ringPositions[pp++] = s.displayX * aspect
      ringPositions[pp++] = s.displayY
      ringColors[cp++] = 0.94
      ringColors[cp++] = 0.92
      ringColors[cp++] = 0.84
      ringColors[cp++] = 0.34
      ringSizes[i] = Math.max(72, Math.min(width, height) * s.r * 1.15)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, ringPositionBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, ringPositions)
    gl.bindBuffer(gl.ARRAY_BUFFER, ringColorBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, ringColors)
    gl.bindBuffer(gl.ARRAY_BUFFER, ringSizeBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, ringSizes)

    gl.useProgram(ringProgram)
    gl.uniform1f(rings.uAspect, aspect)
    gl.bindBuffer(gl.ARRAY_BUFFER, ringPositionBuffer)
    gl.enableVertexAttribArray(rings.aPos)
    gl.vertexAttribPointer(rings.aPos, 2, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, ringColorBuffer)
    gl.enableVertexAttribArray(rings.aColor)
    gl.vertexAttribPointer(rings.aColor, 4, gl.FLOAT, false, 0, 0)
    gl.bindBuffer(gl.ARRAY_BUFFER, ringSizeBuffer)
    gl.enableVertexAttribArray(rings.aSize)
    gl.vertexAttribPointer(rings.aSize, 1, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.POINTS, 0, systems.length)
    gl.disable(gl.BLEND)
  }

  /**
   * The pen's two passes: the trail texture is redrawn faded with this frame's
   * lines on top, then that texture is shown unfaded and the pair swaps.
   */
  const render = () => {
    if (!read || !write) return

    gl.bindFramebuffer(gl.FRAMEBUFFER, write.fbo)
    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.disable(gl.BLEND)
    drawQuad(read.tex, 1)
    drawLines()
    drawRings()

    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, canvas.width, canvas.height)
    drawQuad(write.tex, 0)

    const tmp = read
    read = write
    write = tmp
  }

  return {
    resize(w, h) {
      width = w
      height = h
      aspect = w / h
      rebuildRenderTargets()
      rebuildField()
      // The tracer field is aspect-wide; a narrower band leaves some of them
      // outside it.
      for (let i = 0; i < COUNT; i++) {
        if (xs[i] > aspect) spawn(i)
      }
      lastSeconds = -1
    },
    frame(seconds) {
      if (contextLost) return

      const nowMs = seconds * 1000
      // Coming back on screen rebases the hook's clock to zero. Without this
      // the throttle below would be comparing against a step that is now in
      // the future and would never let another frame through.
      if (seconds < lastSeconds) lastSeconds = -1
      // The pen runs its own 30fps clock rather than the display's: the
      // advection is a fourteen-thousand-iteration JS loop, and it is paced
      // for that rate rather than for 120Hz.
      if (lastSeconds >= 0 && nowMs - lastStepMs < FRAME_MS) return
      lastStepMs = nowMs

      let dt = lastSeconds < 0 ? 1 / TARGET_FPS : seconds - lastSeconds
      lastSeconds = seconds
      if (!Number.isFinite(dt) || dt <= 0 || dt > 0.05) dt = 1 / TARGET_FPS
      // The systems evolve on their own clock so a band that was off screen
      // does not come back to a field that jumped while nobody was looking.
      elapsedMs += dt * 1000

      stepSystems(dt, elapsedMs * 0.001)
      updateFieldRows(FIELD_ROWS_PER_FRAME)
      simulate(dt)
      render()
    },
    dispose() {
      canvas.removeEventListener('webglcontextlost', onLost)
      giveUp()
    },
  }
}

export function DriftBackdrop({ className }: { className?: string }) {
  // The pen renders at one device pixel per CSS pixel — the trail texture is
  // two full-screen buffers and the fill cost is the whole budget.
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--drift', className)} aria-hidden />
}
