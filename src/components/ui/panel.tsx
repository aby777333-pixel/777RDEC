import { cn } from '@/lib/utils'

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'article' | 'aside'
  tone?: 'card' | 'raised' | 'glass'
  size?: 'card' | 'panel'
}

export function Panel({
  as: Tag = 'div',
  tone = 'card',
  size = 'card',
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <Tag
      className={cn(
        'border shadow-soft',
        size === 'card' ? 'rounded-card' : 'rounded-panel',
        tone === 'card' && 'border-line-2 bg-bg-1',
        tone === 'raised' && 'border-line-2 bg-bg-2',
        tone === 'glass' && 'glass',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}
