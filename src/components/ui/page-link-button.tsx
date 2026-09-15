'use client'

import { usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { isCurrentPage } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/**
 * A button link for sections that appear both on the home page and on the page
 * they point to. Elsewhere it is an ordinary link; on its own page it becomes a
 * quiet "you are here" marker instead — not a link, so it cannot send the
 * visitor back to the top of the page they are already reading.
 */
export function PageLinkButton({
  href,
  children,
  variant = 'ghost',
  size = 'sm',
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'quiet'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const pathname = usePathname()

  if (isCurrentPage(pathname, href)) {
    return (
      <span
        aria-current="page"
        className={cn(
          'inline-flex h-8 cursor-default items-center justify-center gap-1.5 rounded-ui border border-signal/40 px-3 text-[0.8125rem] font-medium text-steel-100',
          className,
        )}
      >
        <Check size={13} strokeWidth={2} aria-hidden className="text-signal" />
        {children}
        <span className="font-normal text-steel-500">· this page</span>
      </span>
    )
  }

  return (
    <ButtonLink href={href} variant={variant} size={size} className={className}>
      {children}
    </ButtonLink>
  )
}
