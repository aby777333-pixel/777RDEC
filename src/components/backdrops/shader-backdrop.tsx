'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { type BackdropScene, useBackdropCanvas } from './use-backdrop-canvas'

/**
 * The WebGL2 harness the two Matthias Hurrle (@atzedent) pens run on.
 *
 * Those pens ship as a shader playground: a fragment shader plus a code
 * editor, an error pane, resolution and view toggles, and a Ctrl-L shortcut.
 * The shader is the piece; the editor is the authoring tool around it, and
 * that is what is left behind here. What the shader itself is given is what
 * the playground gave it — a full-viewport quad, `time`, `resolution`, `move`
 * and `wheel` — so the image is the pen's exactly.
 *
 * `move` is the pen's own: deltas accumulated while a pointer is held down,
 * x positive right and y positive *up*, which is what turns the camera. Drag
 * across either band and it turns, as it does in the pen.
 *
 * `wheel` stays at zero, and that is the one deliberate departure. In the pen
 * it accumulates scroll, which on a page would mean the hero eating the
 * visitor's scrolling. Both shaders read it as an offset onto a sensible
 * default — camera distance in one, a time shift in the other — so zero is a
 * value they are built to take.
 */

const VERTEX_SRC = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`

/** The pen's own quad: a triangle strip across clip space. */
const VERTICES = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])

type ShaderScene = {
  gl: WebGL2RenderingContext
  program: WebGLProgram
  buffer: WebGLBuffer
  vs: WebGLShader
  fs: WebGLShader
  locations: {
    time: WebGLUniformLocation | null
    resolution: WebGLUniformLocation | null
    move: WebGLUniformLocation | null
    wheel: WebGLUniformLocation | null
  }
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(gl.getShaderInfoLog(shader))
    }
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createScene(canvas: HTMLCanvasElement, fragmentSrc: string): ShaderScene | null {
  const gl = canvas.getContext('webgl2', {
    antialias: false,
    alpha: false,
    // The band is opaque and never read back, so the compositor can skip both.
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentSrc)
  const program = gl.createProgram()
  if (!vs || !fs || !program) return null

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(gl.getProgramInfoLog(program))
    }
    return null
  }
  gl.useProgram(program)

  const buffer = gl.createBuffer()
  if (!buffer) return null
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  return {
    gl,
    program,
    buffer,
    vs,
    fs,
    locations: {
      time: gl.getUniformLocation(program, 'time'),
      resolution: gl.getUniformLocation(program, 'resolution'),
      move: gl.getUniformLocation(program, 'move'),
      wheel: gl.getUniformLocation(program, 'wheel'),
    },
  }
}

function makeSetup(fragmentSrc: string) {
  return (canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null => {
    const scene = createScene(canvas, fragmentSrc)
    if (!scene) return null
    const { gl, locations } = scene

    const move: [number, number] = [0, 0]
    let dragging = false
    let lastX = 0
    let lastY = 0

    // The pen's drag, kept: deltas accumulate only while a pointer is held,
    // so a click that does not move changes nothing and reading the hero is
    // never disturbed.
    const section = host.parentElement ?? host
    const onDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging) return
      move[0] += e.clientX - lastX
      move[1] += lastY - e.clientY
      lastX = e.clientX
      lastY = e.clientY
    }
    const onUp = () => {
      dragging = false
    }
    section.addEventListener('pointerdown', onDown)
    section.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    section.addEventListener('pointerleave', onUp)

    return {
      resize() {
        gl.viewport(0, 0, canvas.width, canvas.height)
      },
      frame(seconds) {
        gl.uniform1f(locations.time, seconds)
        gl.uniform2f(locations.resolution, canvas.width, canvas.height)
        gl.uniform2f(locations.move, move[0], move[1])
        gl.uniform2f(locations.wheel, 0, 0)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      },
      dispose() {
        section.removeEventListener('pointerdown', onDown)
        section.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        section.removeEventListener('pointerleave', onUp)
        gl.deleteBuffer(scene.buffer)
        gl.deleteProgram(scene.program)
        gl.deleteShader(scene.vs)
        gl.deleteShader(scene.fs)
        // Hand the context back rather than waiting to be evicted: browsers
        // keep only a handful, and client-side navigation between these pages
        // would otherwise walk through them.
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      },
    }
  }
}

/**
 * `fragmentSrc` and `sceneClass` must be constant for the life of the
 * component — both of ours come from a module constant.
 */
export function ShaderBackdrop({
  fragmentSrc,
  sceneClass,
  className,
  maxDpr = 1.25,
}: {
  fragmentSrc: string
  sceneClass: string
  className?: string
  /** Raymarching every pixel: full retina density buys nothing here. */
  maxDpr?: number
}) {
  // Memoised so the contract the hook documents holds: one setup, one scene.
  const setup = useMemo(() => makeSetup(fragmentSrc), [fragmentSrc])
  const { hostRef } = useBackdropCanvas(setup, { maxDpr })
  // The canvas is the hook's; it appends one on mount and drops it on unmount.
  return <div ref={hostRef} className={cn('pen-scene', sceneClass, className)} aria-hidden />
}
