import { cn } from '@/lib/utils'

/**
 * Brushed-metal type. Reserved for H1s and the 777 numeral (design system §3).
 * Never applied to body copy.
 */
export function ChromeText({
  children,
  className,
  as: Tag = 'span',
}: {
  children: React.ReactNode
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'div'
}) {
  return <Tag className={cn('text-chrome', className)}>{children}</Tag>
}
