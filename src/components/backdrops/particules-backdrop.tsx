import { cn, createRng } from '@/lib/utils'

/**
 * "CSS multicolor particule explosion" by alexandremasse, ported.
 * https://codepen.io/alexandremasse/pen/apqarX
 *
 * Five hundred five-pixel dots, each a random colour, bursting from the middle
 * of the band to a random place on it and fading as they go — every one on its
 * own duration between two and three seconds and its own delay of up to three,
 * so the burst never stops and never repeats in step.
 *
 * Pure CSS, as the pen is: no script runs. The pen's SCSS rolls every dot's
 * colour, destination, duration and delay once, when the stylesheet is
 * compiled; here they are rolled once at render from a fixed seed, so every
 * visit sees the same burst the way every visit to the pen's compiled CSS
 * does, and the server and the browser agree on it.
 *
 * The only translation is the unit. The pen measures in `vw` and `vh` against
 * its window; the band is a size container here, so the same numbers are in
 * `cqw` and `cqh` against the band.
 */

const COUNT = 500
const SEED = 0x5ca1ab1e

type Dot = { color: string; x: number; y: number; duration: number; delay: number }

function dots(): Dot[] {
  const rng = createRng(SEED)
  /** Sass `random($limit)`: an integer from 1 to $limit. */
  const random = (limit: number) => Math.floor(rng() * limit) + 1
  return Array.from({ length: COUNT }, () => {
    const red = random(256) - 1
    const green = random(256) - 1
    const blue = random(256) - 1
    return {
      color: `rgb(${red}, ${green}, ${blue})`,
      x: random(100),
      y: random(100),
      duration: random(100) * 0.01 + 2,
      delay: random(300) * 0.01,
    }
  })
}

const DOTS = dots()

export function ParticulesBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn('pen-scene pen-scene--particules', className)} aria-hidden>
      {DOTS.map((dot, i) => (
        <div
          key={i}
          className="particules-dot"
          style={{
            backgroundColor: dot.color,
            transform: `translate(${dot.x}cqw, ${dot.y}cqh)`,
            animation: `particules-move ${dot.duration.toFixed(2)}s ease-in ${dot.delay.toFixed(2)}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
