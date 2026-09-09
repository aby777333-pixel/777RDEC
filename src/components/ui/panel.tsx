import { cn } from '@/lib/utils'

const TINTS = ['tint-1', 'tint-2', 'tint-3', 'tint-4', 'tint-5', 'tint-6'] as const

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article' | 'aside'
  tone?: 'card' | 'raised' | 'glass'
  size?: 'card' | 'panel'
  /** Adds a hover rise. Only for panels that are themselves interactive. */
  interactive?: boolean
  /**
   * Selects one of six card tints. Pass the item's index in a grid and the
   * cards cycle through the hues; omit it for the default ice-blue wash.
   */
  tintIndex?: number
}

/**
 * The site's surface primitive.
 *
 * `surface-sheen` supplies the layered shadow plus a one-pixel top highlight
 * and a quiet vertical gradient, which is what makes a card read as lit rather
 * than as a flat rectangle. Both re-tint with the theme because every value in
 * them is a token.
 */
export function Panel({
  as: Tag = 'div',
  tone = 'card',
  size = 'card',
  interactive = false,
  tintIndex,
  className,
  children,
  ...rest
}: PanelProps) {
  // Literal strings, not a template — so the class names are greppable and
  // survive any future content-scanning tool.
  const tint = tintIndex === undefined ? null : TINTS[Math.abs(tintIndex) % TINTS.length]
  return (
    <Tag
      className={cn(
        'border',
        'surface-sheen',
        size === 'card' ? 'rounded-card' : 'rounded-panel',
        tone === 'card' && 'border-line-2 bg-bg-1',
        tone === 'raised' && 'border-line-2 bg-bg-2 shadow-raised',
        tone === 'glass' && 'glass shadow-panel',
        interactive && 'lift hover:border-signal/40',
        tint,
        className,
      )}
      {...rest}
    >
      <div className="relative">{children}</div>
    </Tag>
  )
}
