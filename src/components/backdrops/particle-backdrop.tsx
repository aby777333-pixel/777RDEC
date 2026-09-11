'use client'

import { useCanvasBackdrop, tokenRgb, type BackdropRenderer } from './use-canvas-backdrop'
import { cn } from '@/lib/utils'

/**
 * A slow particle drift, orbiting in a wide flattened band.
 *
 * After "Day54: WebGL Particle Animation" by kenjiSpecial. That pen keeps
 * 40,000 particles in JavaScript arrays and rewrites the whole vertex buffer
 * every frame; this one uploads each particle's orbit once and advances it in
 * the vertex shader, so per frame the CPU does nothing but set a uniform. That
 * is what makes it affordable behind a section that is already on the page.
 *
 * Count scales with the area it has to cover, so a phone draws a fraction of
 * what a desktop does.
 *
 * Colour comes from `--signal` and `--steel-700`, so it re-tints with the
 * theme and no literal appears here.
 */

const VERT = `#version 300 es
precision highp float;

in float aTheta;
in float aRadius;
in float aSpeed;
in float aSeed;
in float aSize;

uniform float uTime;
uniform float uScale;

out float vGlow;

void main() {
  float th = aTheta + uTime * aSpeed;

  vec2 p = vec2(cos(th), sin(th)) * aRadius;
  p.y *= 0.46;
  p.x += 0.13 * sin(uTime * 1.1 + aSeed * 6.2831);
  p.y += 0.07 * cos(uTime * 0.9 + aSeed * 3.1416);

  // Stand-in for depth: particles on the far side of the orbit read smaller
  // and dimmer, which is what gives the band its volume.
  float depth = 0.5 + 0.5 * sin(th);

  vGlow = 0.58 + 0.42 * depth;
  gl_PointSize = aSize * (1.15 + depth) * uScale;
  gl_Position = vec4(p, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;

in float vGlow;
out vec4 fragColor;

uniform vec3 uInk;
uniform vec3 uBase;

void main() {
  // Round the square point sprite off, and fade it at the rim.
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;

  float soft = smoothstep(0.25, 0.0, r);
  vec3 col = mix(uBase, uInk, vGlow);
  fragColor = vec4(col, soft * vGlow);
}`

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createRenderer(canvas: HTMLCanvasElement): BackdropRenderer | null {
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null

  const vert = compile(gl, gl.VERTEX_SHADER, VERT)
  const frag = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vert || !frag) return null

  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vert)
  gl.attachShader(program, frag)
  gl.linkProgram(program)
  gl.deleteShader(vert)
  gl.deleteShader(frag)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  gl.useProgram(program)

  const rect = canvas.getBoundingClientRect()
  const area = Math.max(1, rect.width * rect.height)
  const count = Math.round(Math.min(22000, Math.max(5000, area * 2.0)))

  // One interleaved buffer, written once. theta, radius, speed, seed, size.
  const stride = 5
  const data = new Float32Array(count * stride)
  for (let i = 0; i < count; i++) {
    const o = i * stride
    // sqrt keeps areal density even; the 0.42 floor clears the middle so the
    // field reads as a halo around the copy rather than a blob behind it.
    const radius = (0.42 + 0.58 * Math.sqrt(Math.random())) * 1.18
    data[o] = Math.random() * Math.PI * 2
    data[o + 1] = radius
    // Inner orbits turn faster, and a third of them turn the other way.
    // 0.14–0.40 rad/s is one revolution every 16–45s. The first pass ran at
    // 0.035–0.10, which is 60–180s per revolution — running perfectly and
    // indistinguishable from a still image.
    data[o + 2] = (0.34 + (1.2 - radius) * 0.46) * (Math.random() < 0.33 ? -1 : 1)
    data[o + 3] = Math.random()
    data[o + 4] = 1.9 + Math.random() * 3.1
  }

  const buffer = gl.createBuffer()
  const vao = gl.createVertexArray()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

  const bytes = stride * 4
  const names = ['aTheta', 'aRadius', 'aSpeed', 'aSeed', 'aSize'] as const
  names.forEach((name, index) => {
    const location = gl.getAttribLocation(program, name)
    if (location < 0) return
    gl.enableVertexAttribArray(location)
    gl.vertexAttribPointer(location, 1, gl.FLOAT, false, bytes, index * 4)
  })

  const uTime = gl.getUniformLocation(program, 'uTime')
  const uScale = gl.getUniformLocation(program, 'uScale')
  const uInk = gl.getUniformLocation(program, 'uInk')
  const uBase = gl.getUniformLocation(program, 'uBase')

  const palette = () => {
    const ink = tokenRgb('--signal', [0.49, 0.83, 0.99])
    const base = tokenRgb('--steel-700', [0.29, 0.31, 0.35])
    gl.uniform3f(uInk, ink[0], ink[1], ink[2])
    gl.uniform3f(uBase, base[0], base[1], base[2])
  }
  palette()

  const themeObserver = new MutationObserver(palette)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

  return {
    resize(width, height) {
      gl.viewport(0, 0, width, height)
      // Points are sized in device pixels, so they have to follow the buffer.
      gl.uniform1f(uScale, Math.max(1.1, Math.min(height, width) / 430))
    },
    draw(seconds) {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(uTime, seconds)
      gl.bindVertexArray(vao)
      gl.drawArrays(gl.POINTS, 0, count)
    },
    dispose() {
      themeObserver.disconnect()
      gl.deleteBuffer(buffer)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      // Deliberately NOT loseContext(): getContext() hands back the same
      // object for a given canvas, so killing it here leaves a re-mounted
      // component holding a dead context and a blank canvas forever.
    },
  }
}

export function ParticleBackdrop({ className }: { className?: string }) {
  const ref = useCanvasBackdrop(createRenderer, { resolution: 0.6, maxDpr: 1.5 })

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full opacity-95 dark:opacity-100',
        className,
      )}
    />
  )
}
