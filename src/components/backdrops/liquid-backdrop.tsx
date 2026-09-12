'use client'

import { ShaderBackdrop } from './shader-backdrop'
import { LIQUIDITY_FRAGMENT_SRC } from './shaders/liquidity'

/**
 * "Liquid Metal" by Matthias Hurrle (@atzedent), ported.
 *
 * A raymarched metal surface rolling under its own light, shaded entirely in
 * one fragment shader. The shader is the pen's, unedited; the playground it
 * shipped inside is not. See <ShaderBackdrop> for what it is handed and why
 * `wheel` is held at zero.
 */
export function LiquidBackdrop({ className }: { className?: string }) {
  return (
    <ShaderBackdrop
      fragmentSrc={LIQUIDITY_FRAGMENT_SRC}
      sceneClass="pen-scene--liquid"
      className={className}
    />
  )
}
