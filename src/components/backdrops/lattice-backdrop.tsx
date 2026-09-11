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
uniform float uOpaque;

#define FC gl_FragCoord.xy
#define R uRes
#define T uTime
#define S smoothstep
#define N normalize
#define MN min(R.x, R.y)
#define hue(a) (0.5 + 0.5 * sin(3.14 * (a) + vec3(1, 2, 3)))
#define LP vec3(1.0 + 1.0 * sin(-T), 2.0 - 2.0 * cos(T), -3.0 - 4.0 * sin(sin(T)))

float smin(float a, float b, float k) {
  k *= log(2.0);
  float x = b - a;
  return a + x / (1.0 - exp2(x / k));
}

float box(vec3 p, vec3 s, float r) {
  p = abs(p) - s + r;
  return length(max(p, 0.0)) + min(0.0, max(max(p.x, p.y), p.z)) - r;
}

float glow;

// The cell: a node cube plus struts down each axis, welded with a smooth min.
float map(vec3 p, bool g) {
  float d = 5e5;
  if (g) {
    d = length(p - LP + vec3(0.2, 0.2, 0.0)) - 0.02;
    glow += 0.05 / (0.05 + d * d * 80.0);
  }
  p.z -= T * 3.5;
  p = fract(p) - 0.5;
  vec4 k = vec4(1.0, 0.05, 0.03, 0.1);
  float r = 1e-2;
  return min(d, smin(
    box(p, k.www, r),
    min(box(p, k.zxz, r), min(box(p, k.xyz, r), box(p, k.yzx, r))),
    0.01
  ));
}

vec3 norm(vec3 p) {
  float h = 1e-3;
  vec2 k = vec2(-1, 1);
  return N(
    k.xyy * map(p + k.xyy * h, false) +
    k.yxy * map(p + k.yxy * h, false) +
    k.yyx * map(p + k.yyx * h, false) +
    k.xxx * map(p + k.xxx * h, false)
  );
}

bool march(inout vec3 p, vec3 rd, out float dd, out float at) {
  dd = 0.0;
  at = 0.0;
  for (int i = 0; i < 220; i++) {
    float d = map(p, true);
    if (abs(d) < 1e-3) return true;
    if (d > 100.0) return false;
    p += rd * d;
    dd += d;
    at += 0.05 * (0.05 / max(dd, 1e-4));
  }
  return false;
}

vec3 dir(vec2 uv, vec3 p, vec3 t, float z) {
  vec3 up = vec3(0, 1, 0);
  vec3 f = N(t - p);
  vec3 r = N(cross(up, f));
  vec3 u = N(cross(f, r));
  return mat3(r, u, f) * N(vec3(uv, z));
}

mat3 rotX(float a) { float s = sin(a), c = cos(a); return mat3(vec3(1,0,0), vec3(0,c,-s), vec3(0,s,c)); }
mat3 rotY(float a) { float s = sin(a), c = cos(a); return mat3(vec3(c,0,s), vec3(0,1,0), vec3(-s,0,c)); }

float rnd(float a) {
  vec2 p = fract(a * vec2(12.9898, 78.233));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

float curve(float t, float e) {
  t /= e;
  return mix(rnd(floor(t)), rnd(floor(t) + 1.0), pow(S(0.0, 1.0, fract(t)), 10.0));
}

vec3 org() {
  float k = -0.2 * sin(sin(T));
  float drama = 3.14 * curve(T * 0.2, 2.0);
  vec2 m = uMove;
  vec3 ro = vec3(0, 0, 0.1);
  ro *= rotX(m.y * 6.3 - k - 0.1 + drama / 12.0) * rotY(m.x * 6.3 - 0.45 - sin(cos(T * 0.2 - k + drama)));
  return ro;
}

float shadow(vec3 p, vec3 lp) {
  float shd = 1.0;
  float maxd = length(lp - p);
  vec3 l = N(lp - p);
  for (int j = 0; j < 48; j++) {
    float i = 1e-3 + float(j) * (maxd / 48.0);
    if (i >= maxd) break;
    float d = map(p + l * i, false);
    if (d < 1e-3) { shd = 0.0; break; }
    shd = min(shd, 64.0 * d / i);
  }
  return shd;
}

float calcAO(vec3 p, vec3 n) {
  float occ = 0.0, sca = 1.0;
  for (int i = 0; i < 5; i++) {
    float h = 0.01 + float(i) * 0.09;
    float d = map(p + h * n, false);
    occ += (h - d) * sca;
    sca *= 0.55;
    if (occ > 0.35) break;
  }
  return clamp(1.0 - 3.0 * occ, 0.0, 1.0) * (0.5 + 0.5 * n.y);
}

vec3 render(vec2 uv) {
  glow = 0.0;
  vec3 col = vec3(0);
  vec3 p = org();
  vec3 ro = p;
  vec3 rd = dir(uv, p, vec3(0), 1.0);
  float dd, at;

  if (march(p, rd, dd, at)) {
    vec3 n = norm(p), lp = LP, l = N(lp - p);
    vec3 e = N(ro - p), r = reflect(-l, n);
    float ld = distance(lp, p);
    float atten = 1.0 / (1.0 + ld * 0.25 + ld * ld * 0.125);
    float ao = calcAO(p, n), shd = shadow(p + n * 5e-2, lp);
    col += shd * atten * vec3(0.1, 0.095, 0.09) + clamp(dot(l, n), 0.0, 1.0) * atten * ao * shd;
    col += pow(max(0.0, dot(r, e)), 8.0) * atten * ao * shd;
    col += clamp(dot(-rd, l), 0.0, 1.0) * ao * atten * 1.2;
  }

  float k = mix(max(0.2, 1.0 - distance(LP, ro)), 0.25, fract(sin(dot(ro, vec3(12.9898, 78.233, 156.345))) * 345678.0));
  float f = S(1.0, 0.0, clamp(dd / 200.0, 0.0, 1.0));
  vec3 tint = vec3(1.2, 0.95, 0.9);
  col += tint * at * k;
  col += hue(3.14 * k + f * f * f) * k * k;

  col = mix(col, vec3(1, 0.95, 0.9), S(0.0, 50.0, distance(p, ro)));
  col = tanh(col * col);
  col = sqrt(col);
  col = mix(sqrt(col) * 1.2, col, clamp(S(-0.1, 0.2, dot(uv, uv)), 0.0, 1.0));
  col += tanh(tint * glow);

  vec2 c = FC / R;
  c *= 1.0 - c.yx;
  float vig = c.x * c.y * 25.0;
  vig = pow(vig, 0.25);
  col *= vig;
  return col;
}

void main() {
  vec3 col = render((FC - 0.5 * R) / MN);
  // Opaque in dark, where the pen's own black ground is right. In light the
  // alpha falls back to luminance so the hero is not a dark slab.
  float a = mix(clamp(max(col.r, max(col.g, col.b)) * 1.8, 0.0, 1.0), 1.0, uOpaque);
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
  const uOpaque = gl.getUniformLocation(program, 'uOpaque')
  const syncTheme = () => {
    gl.uniform1f(uOpaque, document.documentElement.classList.contains('dark') ? 1 : 0)
  }
  syncTheme()
  const themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

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
      themeObserver.disconnect()
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
  const ref = useCanvasBackdrop(createRenderer, { resolution: 0.5, maxDpr: 1.25 })

  return (
    <canvas ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />
  )
}
