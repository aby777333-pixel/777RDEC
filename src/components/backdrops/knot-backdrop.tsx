'use client'

import { ShaderBackdrop } from './shader-backdrop'
import { LIQUIDITY_FRAGMENT_SRC } from './shaders/liquidity'

/**
 * "Not a Mobius Knot" by Matthias Hurrle (@atzedent), ported.
 * https://codepen.io/atzedent/pen/QwdOWmZ
 *
 * A metal band twisted around a ring and turning under its own light, its
 * hue running with depth — raymarched entirely in one fragment shader. The shader is the pen's, unedited; the playground it
 * shipped inside is not. See <ShaderBackdrop> for what it is handed and why
 * `wheel` is held at zero.
 */
export function KnotBackdrop({ className }: { className?: string }) {
  return (
    <ShaderBackdrop
      fragmentSrc={LIQUIDITY_FRAGMENT_SRC}
      sceneClass="pen-scene--knot"
      className={className}
    />
  )
}
