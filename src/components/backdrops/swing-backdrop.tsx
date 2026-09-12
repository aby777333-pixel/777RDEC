import { cn } from '@/lib/utils'

/**
 * "A swinging robot (CSS only)" by amit_sheen, ported.
 *
 * Pure CSS — no canvas, no WebGL, no JavaScript at all. Every box is six
 * absolutely-positioned faces sized from `--width` / `--height` / `--depth`,
 * and the whole scene turns on a 48s keyframe while the swing, legs, torso,
 * head, arms and hands run their own loops off a shared `--duration`.
 *
 * That also means it needs nothing from the backdrop hook: the site's
 * reduce-motion rules already stop CSS animations, and a hidden tab already
 * stops compositing them. It costs no JavaScript and no render loop.
 *
 * Styles live in `globals.css` under `.swing-scene`, flattened and scoped —
 * see the comment there for what had to change from the pen.
 */

/** One box. The pen builds every solid from exactly six `<i>` faces. */
function Box({ className, children }: { className: string; children?: React.ReactNode }) {
  return (
    <div className={className}>
      <i />
      <i />
      <i />
      <i />
      <i />
      <i />
      {children}
    </div>
  )
}

function Leg() {
  return (
    <div className="legs">
      <Box className="" />
      <Box className="" />
    </div>
  )
}

export function SwingBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn('swing-scene', className)} aria-hidden>
      {/* The outer box is the size container; `.fit` reads the hero's height
          off it and picks the scale the whole rig is measured in. */}
      <div className="fit">
        <div className="scene">
          <div className="floor">
            <div className="shadow" />
          </div>

          <div className="swing">
            <div className="structure">
              <Box className="top" />
              <Leg />
              <Leg />
            </div>

            <div className="moving">
              <div className="line" />
              <div className="line" />
              <Box className="seat" />

              <div className="robot">
                <Box className="thigh">
                  <Box className="calf">
                    <Box className="foot" />
                  </Box>
                </Box>
                <Box className="thigh">
                  <Box className="calf">
                    <Box className="foot" />
                  </Box>
                </Box>

                <Box className="thorax">
                  <Box className="neck">
                    <Box className="head" />
                  </Box>
                  <Box className="arm">
                    <Box className="hand" />
                  </Box>
                  <Box className="arm">
                    <Box className="hand" />
                  </Box>
                </Box>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
