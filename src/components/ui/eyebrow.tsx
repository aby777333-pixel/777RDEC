import { cn } from '@/lib/utils'

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-eyebrow font-medium uppercase text-steel-500', className)}>{children}</p>
  )
}
