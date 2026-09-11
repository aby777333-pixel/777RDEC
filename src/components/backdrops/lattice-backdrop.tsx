'use client'

import { useCanvasBackdrop, tokenRgb, type BackdropRenderer } from './use-canvas-backdrop'
import { cn } from '@/lib/utils'

/**
 * An infinite lattice flying toward the viewer, raymarched in a fragment
 * shader.
 *
 * After "Grid Run" by Matthias Hurrle (@atzedent) — the idea of repeating a
 * strut-and-node cell through `fract()` and travelling along Z is his. The
 * shader here is written against that idea rather than copied: it accumulates
 * proximity glow instead of resolving surfaces, which drops the per-pixel cost
 * from a 400-step march with soft shadows and ambient occlusion to a single
 * 64-step loop. At the opacity this sits behind a scrim, the two are hard to
 * tell apart, and the original would have been far too expensive to put under
 * a marketing hero on a phone.
 *
 * Colour is never written down here: the accent and the base are read from
 * `--signal` and `--steel-700`, so the lattice re-tints with the theme like
 * everything else.
 */

const VERT = `#version 300 es
void main() {
  // Full-screen triangle from the vertex id — no buffers, no attributes.
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uInk;
uniform vec3 uBase;

float sdBox(vec3 p, vec3 s, float r) {
  p = abs(p) - s + r;
  return length(max(p, 0.0)) + min(0.0, max(max(p.x, p.y), p.z)) - r;
}

// One cell: three struts through the axes plus a node where they meet.
float map(vec3 p) {
  p.z -= uTime * 1.9;
  vec3 q = fract(p) - 0.5;
  float r = 0.010;
  float sx = sdBox(q, vec3(1.0, 0.016, 0.016), r);
  float sy = sdBox(q, vec3(0.016, 1.0, 0.016), r);
  float sz = sdBox(q, vec3(0.016, 0.016, 1.0), r);
  float node = sdBox(q, vec3(0.052), r);
  return min(node, min(sx, min(sy, sz)));
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

  vec3 ro = vec3(0.32 * sin(uTime * 0.19), 0.26 * cos(uTime * 0.16), 0.0);
  vec3 rd = normalize(vec3(uv, 1.1));
  rd.xy *= rot(0.07 * sin(uTime * 0.11));
  rd.xz *= rot(0.09 * sin(uTime * 0.08));

  vec3 p = ro;
  float t = 0.0;
  float glow = 0.0;

  for (int i = 0; i < 64; i++) {
    float d = map(p);
    glow += 0.016 / (0.016 + d * d * 70.0);
    // Never step less than this, or the loop stalls against a surface and the
    // march never reaches the far cells.
    float step = max(d, 0.019);
    p += rd * step;
    t += step;
    if (t > 22.0) break;
  }

  float g = glow * 0.055 * exp(-t * 0.085);
  vec3 col = mix(uBase, uInk, clamp(g * 1.25, 0.0, 1.0)) * g;

  vec2 c = gl_FragCoord.xy / uRes;
  c *= 1.0 - c.yx;
  col *= pow(clamp(c.x * c.y * 22.0, 0.0, 1.0), 0.30);

  col = col / (1.0 + col);

  // Straight (un-premultiplied) alpha, so the page background shows through
  // the gaps in both themes rather than the canvas painting its own ground.
  float a = clamp(max(col.r, max(col.g, col.b)) * 1.6, 0.0, 1.0);
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
  const uInk = gl.getUniformLocation(program, 'uInk')
  const uBase = gl.getUniformLocation(program, 'uBase')

  // Re-read on theme change rather than every frame — getComputedStyle in a
  // render loop is a layout read 60 times a second.
  const palette = () => {
    const ink = tokenRgb('--signal', [0.49, 0.83, 0.99])
    const base = tokenRgb('--steel-700', [0.29, 0.31, 0.35])
    gl.uniform3f(uInk, ink[0], ink[1], ink[2])
    gl.uniform3f(uBase, base[0], base[1], base[2])
  }
  palette()

  const themeObserver = new MutationObserver(palette)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  return {
    resize(width, height) {
      gl.viewport(0, 0, width, height)
      gl.uniform2f(uRes, width, height)
    },
    draw(seconds) {
      gl.uniform1f(uTime, seconds)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    dispose() {
      themeObserver.disconnect()
      gl.deleteProgram(program)
      // Deliberately NOT loseContext(): getContext() hands back the same
      // object for a given canvas, so killing it here leaves a re-mounted
      // component holding a dead context and a blank canvas forever.
    },
  }
}

export function LatticeBackdrop({ className }: { className?: string }) {
  const ref = useCanvasBackdrop(createRenderer, { resolution: 0.5, maxDpr: 1.5 })

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full opacity-70 dark:opacity-90',
        className,
      )}
    />
  )
}
