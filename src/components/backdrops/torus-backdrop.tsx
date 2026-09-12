'use client'

import { ShaderBackdrop } from './shader-backdrop'
import { CRM_FRAGMENT_SRC } from './shaders/crm'

/**
 * "Wobbly Torus" by Matthias Hurrle (@atzedent), ported.
 *
 * A raymarched torus turning in a dark field, shaded entirely in one fragment
 * shader. The shader is the pen's, unedited; everything around it — the
 * playground's editor, error pane and toggles — is left behind. See
 * <ShaderBackdrop> for what it is handed and why `wheel` is held at zero.
 */
export function TorusBackdrop({ className }: { className?: string }) {
  return (
    <ShaderBackdrop
      fragmentSrc={CRM_FRAGMENT_SRC}
      sceneClass="pen-scene--torus"
      className={className}
    />
  )
}
