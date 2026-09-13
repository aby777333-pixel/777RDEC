import { cn } from '@/lib/utils'

/**
 * "Tunnel" by julien_rno, ported.
 * https://codepen.io/julien_rno/pen/WNLvLz
 *
 * Thirty outlined squares in teal, each with a soft glow cast below it, rising
 * out of the dark toward the viewer through a very short perspective — so they
 * swell past the edges as they arrive — one every 400 milliseconds on a
 * twelve-second loop. The staggering is done with negative delays, so the
 * tunnel is already full on the first frame.
 *
 * Pure CSS, as the pen is. The pen's LESS loop is written out as thirty
 * delays; the sizes, colours, glow, perspective and keyframes are the pen's.
 * The square's `padding-bottom: 40%` still measures against the band's width,
 * as the pen's measures against its window, so the squares stay square.
 */

const SQUARES = 30

export function SquaresBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn('pen-scene pen-scene--squares', className)} aria-hidden>
      {Array.from({ length: SQUARES }, (_, i) => (
        <div
          key={i}
          className="squares-square"
          style={{ animationDelay: `${-400 * (i + 1)}ms` }}
        />
      ))}
    </div>
  )
}
