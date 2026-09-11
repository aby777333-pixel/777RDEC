'use client'

import { useCanvasBackdrop, type BackdropRenderer } from './use-canvas-backdrop'
import { cn } from '@/lib/utils'

/**
 * An infinite lattice flying toward the viewer, raymarched in a fragment
 * shader and steered by the pointer.
 *
 * After "Grid Run" by Matthias Hurrle (@atzedent) — the repeating
 * strut-and-node cell, the travel along Z and the pointer-driven camera are
 * his. The march here accumulates proximity glow rather than resolving
 * surfaces with soft shadows and ambient occlusion, which is what makes it
 * affordable under a marketing hero on a phone.
 *
 * The canvas keeps `pointer-events-none` so the hero's buttons and links stay
 * clickable; the pointer is read from the window instead, and the camera is
 * eased toward it so the motion stays the lattice's own rather than a cursor
 * glued to a value.
 */

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMove;

#define S smoothstep
#define hue(a) (0.5 + 0.5 * sin(3.14 * (a) + vec3(1, 2, 3)))

float sdBox(vec3 p, vec3 s, float r) {
  p = abs(p) - s + r;
  return length(max(p, 0.0)) + min(0.0, max(max(p.x, p.y), p.z)) - r;
}

float map(vec3 p) {
  p.z -= uTime * 2.3;
  vec3 q = fract(p) - 0.5;
  float r = 0.012;
  float sx = sdBox(q, vec3(1.0, 0.019, 0.019), r);
  float sy = sdBox(q, vec3(0.019, 1.0, 0.019), r);
  float sz = sdBox(q, vec3(0.019, 0.019, 1.0), r);
  float node = sdBox(q, vec3(0.06), r);
  return min(node, min(sx, min(sy, sz)));
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

  vec3 ro = vec3(0.34 * sin(uTime * 0.19) + uMove.x * 0.55,
                 0.28 * cos(uTime * 0.16) - uMove.y * 0.45,
                 0.0);
  vec3 rd = normalize(vec3(uv, 1.05));

  rd.yz *= rot(uMove.y * 0.95 + 0.06 * sin(uTime * 0.11));
  rd.xz *= rot(-uMove.x * 1.25 + 0.08 * sin(uTime * 0.08));

  vec3 p = ro;
  float t = 0.0;
  float glow = 0.0;
  float at = 0.0;

  for (int i = 0; i < 72; i++) {
    float d = map(p);
    glow += 0.019 / (0.019 + d * d * 58.0);
    float step = max(d, 0.018);
    p += rd * step;
    t += step;
    at += 0.05 * (0.05 / max(t, 1e-3));
    if (t > 26.0) break;
  }

  // Grading lifted from the pen: warm tint, the hue() sweep, the double
  // tanh/sqrt curve and the edge lift. These are its colours, not the site's
  // tokens — see DECISIONS.md.
  float k = mix(max(0.2, 1.0 - t * 0.055), 0.25, 0.35);
  float f = S(1.0, 0.0, clamp(t / 26.0, 0.0, 1.0));
  vec3 tint = vec3(1.2, 0.95, 0.9);

  vec3 col = vec3(0.0);
  col += tint * at * k;
  col += hue(3.14 * k + f * f * f) * k * k;
  col += tanh(tint * glow * 0.085);

  col = tanh(col * col);
  col = sqrt(col);
  col = mix(sqrt(col) * 1.2, col, clamp(S(-0.1, 0.2, dot(uv, uv)), 0.0, 1.0));

  vec2 c = gl_FragCoord.xy / uRes;
  c *= 1.0 - c.yx;
  col *= pow(clamp(c.x * c.y * 25.0, 0.0, 1.0), 0.25);

  // Alpha from luminance so the page still shows through the void and the
  // light theme is not turned into a dark box.
  float a = clamp(max(col.r, max(col.g, col.b)) * 1.9, 0.0, 1.0);
  fragColor = vec4(col, a);
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
  const uRes = gl.getUniformLocation(program, 'uRes')
  const uTime = gl.getUniformLocation(program, 'uTime')
  const uMove = gl.getUniformLocation(program, 'uMove')
  // Read from the window, because the canvas has to stay click-through. The
  // target is set here and eased in draw(), so the camera glides.
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

  return {
    resize(width, height) {
      gl.viewport(0, 0, width, height)
      gl.uniform2f(uRes, width, height)
    },
    draw(seconds) {
      easedX += (targetX - easedX) * 0.06
      easedY += (targetY - easedY) * 0.06
      gl.uniform2f(uMove, easedX, easedY)
      gl.uniform1f(uTime, seconds)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('pointerleave', onLeave)
      gl.deleteProgram(program)
      // Deliberately NOT loseContext(): getContext() hands back the same
      // object for a given canvas, so killing it here leaves a re-mounted
      // component holding a dead context and a blank canvas forever.
    },
  }
}

export function LatticeBackdrop({ className }: { className?: string }) {
  const ref = useCanvasBackdrop(createRenderer, { resolution: 0.6, maxDpr: 1.5 })

  return (
    <canvas ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />
  )
}
