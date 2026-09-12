'use client'

import { ShaderBackdrop } from './shader-backdrop'
import { CRM_FRAGMENT_SRC } from './shaders/crm'

/**
 * "Dark City Ambience" by Matthias Hurrle (@atzedent), ported.
 * https://codepen.io/atzedent/pen/zxKmgpj
 *
 * A city of lit slabs marching past in a dark field, raymarched entirely in
 * one fragment shader — the blocks repeat on a grid, every other row slides
 * the other way, and one warm light picks out their faces. The shader is the pen's, unedited; everything around it — the
 * playground's editor, error pane and toggles — is left behind. See
 * <ShaderBackdrop> for what it is handed and why `wheel` is held at zero.
 */
export function CityBackdrop({ className }: { className?: string }) {
  return (
    <ShaderBackdrop
      fragmentSrc={CRM_FRAGMENT_SRC}
      sceneClass="pen-scene--city"
      className={className}
    />
  )
}
