'use client'

import { cn } from '@/lib/utils'
import {
  type BackdropScene,
  mixRgb,
  rgba,
  tokenRgb,
  trackPointer,
  useBackdropCanvas,
} from './use-backdrop-canvas'

/**
 * A service lattice, with traffic finding its way through it.
 *
 * Written for `/technology`, whose subject is not a diagram of boxes but the
 * fact that the parts are connected and work is routed between them. So the
 * band draws the graph — nodes on a jittered lattice in depth, edges to near
 * neighbours, the whole thing turning slowly — and then sends something
 * through it: a request enters at an edge node and travels, hop by hop, to
 * wherever the pointer is, lighting each edge as it crosses.
 *
 * The route is a breadth-first search, so it is genuinely the shortest path
 * through the graph rather than a line drawn toward the cursor. That is the
 * point of the thing: the picture is of routing, and routing is what it does.
 *
 * **Pointer:** it chooses the destination. Move and the next request arrives
 * somewhere else; hold still and successive requests arrive at the same node
 * along different routes, because they start from different edges. With no
 * pointer it routes to a node right of centre, away from the copy.
 */

/** Nodes, and how far apart neighbours may be to be joined, in lattice units. */
const NODES = 110
/**
 * Nodes sit on a grid of side `ceil(cbrt(NODES))` spanning -1..1, so the
 * spacing between neighbours is `2 / (side - 1)` — 0.5 at this count. The link
 * distance has to clear that or the graph has no edges at all and there is
 * nothing to route through.
 */
const LINK_DISTANCE = 0.62
const MAX_LINKS = 5

/** Requests alive at once, and how long each takes per hop. */
const REQUESTS = 5
const HOP_SECONDS = 0.17
/** How long an edge stays lit after a request crosses it. */
const GLOW_SECONDS = 1.5

/** Perspective and rotation. */
const FOCAL = 2.6
const SPIN = 0.045
const TILT = 0.22

/** Where it routes to when nobody is pointing, 0..1 of the band. */
const REST_X = 0.7
const REST_Y = 0.5

type Node = { x: number; y: number; z: number; links: number[] }
type Edge = { a: number; b: number; lit: number }
type Request = { path: number[]; hop: number; t: number }

function build(): { nodes: Node[]; edges: Edge[]; edgeAt: Map<string, number> } {
  const nodes: Node[] = []
  // A jittered lattice rather than pure noise: a real topology has structure,
  // and structure is what makes the routes legible.
  const side = Math.ceil(Math.cbrt(NODES))
  for (let i = 0; i < NODES; i++) {
    const gx = i % side
    const gy = Math.floor(i / side) % side
    const gz = Math.floor(i / (side * side))
    const jitter = () => (Math.random() - 0.5) * 0.5
    nodes.push({
      x: (gx / (side - 1)) * 2 - 1 + jitter() / side,
      y: (gy / (side - 1)) * 2 - 1 + jitter() / side,
      z: (gz / Math.max(1, side - 1)) * 2 - 1 + jitter() / side,
      links: [],
    })
  }

  const edges: Edge[] = []
  const edgeAt = new Map<string, number>()
  for (let i = 0; i < nodes.length; i++) {
    // Nearest neighbours first, capped — otherwise the middle of the lattice
    // becomes a solid mat and no single route can be read.
    const near = nodes
      .map((n, j) => ({ j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y, n.z - nodes[i].z) }))
      .filter((entry) => entry.j !== i && entry.d < LINK_DISTANCE)
      .sort((p, q) => p.d - q.d)
      .slice(0, MAX_LINKS)

    for (const { j } of near) {
      const key = i < j ? `${i}-${j}` : `${j}-${i}`
      if (edgeAt.has(key)) continue
      edgeAt.set(key, edges.length)
      edges.push({ a: i, b: j, lit: 0 })
      nodes[i].links.push(j)
      nodes[j].links.push(i)
    }
  }
  return { nodes, edges, edgeAt }
}

/** Shortest path, hop count rather than distance — this is a network. */
function route(nodes: Node[], from: number, to: number): number[] {
  const previous = new Map<number, number>([[from, -1]])
  const queue = [from]
  while (queue.length) {
    const at = queue.shift() as number
    if (at === to) break
    for (const next of nodes[at].links) {
      if (previous.has(next)) continue
      previous.set(next, at)
      queue.push(next)
    }
  }
  if (!previous.has(to)) return []
  const path: number[] = []
  for (let at = to; at !== -1; at = previous.get(at) as number) path.unshift(at)
  return path
}

function setup(canvas: HTMLCanvasElement, host: HTMLElement): BackdropScene | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const { nodes, edges, edgeAt } = build()
  // Read off the mid steel rather than the dark one: the band behind this is
  // almost black, so --steel-700 at a backdrop's alpha is indistinguishable
  // from the background.
  const steel = tokenRgb(host, '--steel-500', [151, 157, 166])
  const signal = tokenRgb(host, '--signal', [125, 211, 252])

  let width = Math.max(1, host.clientWidth)
  let height = Math.max(1, host.clientHeight)
  let aimX = width * REST_X
  let aimY = height * REST_Y
  let last = -1
  let nextDispatch = 0

  const requests: Request[] = []
  const projected = nodes.map(() => ({ x: 0, y: 0, scale: 1 }))

  const untrack = trackPointer(
    host,
    (nx, ny) => {
      aimX = nx * width
      aimY = ny * height
    },
    () => {
      aimX = width * REST_X
      aimY = height * REST_Y
    },
  )

  /** The node nearest a point on screen, using the current projection. */
  const nearestTo = (x: number, y: number) => {
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < projected.length; i++) {
      const d = Math.hypot(projected[i].x - x, projected[i].y - y)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    return best
  }

  return {
    resize(w, h, dpr) {
      width = w
      height = h
      aimX = w * REST_X
      aimY = h * REST_Y
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    },
    frame(seconds) {
      const dt = last < 0 || seconds < last ? 1 / 60 : Math.min(0.05, seconds - last)
      last = seconds

      ctx.clearRect(0, 0, width, height)

      // ---- project ----
      const yaw = seconds * SPIN
      const cosY = Math.cos(yaw)
      const sinY = Math.sin(yaw)
      const cosT = Math.cos(TILT)
      const sinT = Math.sin(TILT)
      // Sized from the band's height: a hero band is wide and shallow, and
      // the height is what constrains a figure in it.
      const radius = Math.min(width * 0.3, height * 0.62)
      const cx = width * 0.62
      const cy = height * 0.5

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        // Yaw about the vertical, then a fixed tilt, so the lattice reads as a
        // solid rather than as a flat grid turning.
        const x1 = n.x * cosY - n.z * sinY
        const z1 = n.x * sinY + n.z * cosY
        const y1 = n.y * cosT - z1 * sinT
        const z2 = n.y * sinT + z1 * cosT
        const scale = FOCAL / (FOCAL + z2)
        projected[i].x = cx + x1 * radius * scale
        projected[i].y = cy + y1 * radius * scale
        projected[i].scale = scale
      }

      // ---- dispatch a request toward the pointer ----
      if (seconds > nextDispatch) {
        nextDispatch = seconds + 0.55
        const target = nearestTo(aimX, aimY)
        // Enter left of the figure but right of the copy: traffic still
        // crosses most of the lattice without drawing lit edges over the
        // headline.
        const entry = nearestTo(width * 0.46, Math.random() * height)
        const path = route(nodes, entry, target)
        if (path.length > 1) {
          requests.push({ path, hop: 0, t: 0 })
          if (requests.length > REQUESTS) requests.shift()
        }
      }

      // ---- advance requests, lighting edges behind them ----
      for (let i = requests.length - 1; i >= 0; i--) {
        const request = requests[i]
        request.t += dt / HOP_SECONDS
        while (request.t >= 1) {
          request.t -= 1
          const a = request.path[request.hop]
          const b = request.path[request.hop + 1]
          if (b !== undefined) {
            const key = a < b ? `${a}-${b}` : `${b}-${a}`
            const index = edgeAt.get(key)
            if (index !== undefined) edges[index].lit = GLOW_SECONDS
          }
          request.hop += 1
          if (request.hop >= request.path.length - 1) {
            requests.splice(i, 1)
            break
          }
        }
      }

      // ---- edges ----
      for (const edge of edges) {
        const a = projected[edge.a]
        const b = projected[edge.b]
        if (edge.lit > 0) edge.lit = Math.max(0, edge.lit - dt)
        const heat = edge.lit / GLOW_SECONDS
        const depth = (a.scale + b.scale) / 2
        // Depth sets the weight, so the near face of the lattice reads in
        // front of the far one; a lit edge then jumps well clear of both.
        ctx.strokeStyle = rgba(
          mixRgb(steel, signal, heat),
          (0.13 + 0.2 * (depth - 0.7)) * (1 + heat * 3.2),
        )
        ctx.lineWidth = 0.8 + heat * 2.2
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }

      // ---- nodes ----
      for (let i = 0; i < nodes.length; i++) {
        const p = projected[i]
        const size = 1.5 * p.scale
        ctx.fillStyle = rgba(steel, 0.4 * p.scale)
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // ---- the requests themselves ----
      for (const request of requests) {
        const a = projected[request.path[request.hop]]
        const b = projected[request.path[Math.min(request.hop + 1, request.path.length - 1)]]
        if (!a || !b) continue
        const x = a.x + (b.x - a.x) * request.t
        const y = a.y + (b.y - a.y) * request.t
        const scale = a.scale + (b.scale - a.scale) * request.t

        const glow = ctx.createRadialGradient(x, y, 0, x, y, 16 * scale)
        glow.addColorStop(0, rgba(signal, 0.5))
        glow.addColorStop(1, rgba(signal, 0))
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 16 * scale, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = rgba(signal, 0.95)
        ctx.beginPath()
        ctx.arc(x, y, 2 * scale, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    dispose() {
      untrack()
      requests.length = 0
    },
  }
}

export function LatticeRouteBackdrop({ className }: { className?: string }) {
  const { hostRef } = useBackdropCanvas(setup, { maxDpr: 1.75 })
  return <div ref={hostRef} className={cn('pen-scene pen-scene--route', className)} aria-hidden />
}
