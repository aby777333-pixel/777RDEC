import Link from 'next/link'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'quiet' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-signal text-bg-0 border border-signal hover:brightness-110 hover:shadow-[0_0_0_4px_var(--signal-soft)]',
  ghost: 'border border-line-2 text-steel-100 bg-transparent hover:bg-bg-2 hover:border-steel-700',
  quiet: 'border border-transparent text-steel-300 hover:text-steel-100 hover:bg-bg-2',
  danger: 'bg-down text-bg-0 border border-down hover:brightness-110',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[0.8125rem]',
  md: 'h-10 px-4 text-[0.9375rem]',
  lg: 'h-12 px-6 text-[1rem]',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-ui font-medium transition-all duration-200 ease-raptor disabled:cursor-not-allowed disabled:border-steel-700 disabled:bg-transparent disabled:text-steel-700 disabled:shadow-none'

export function Button({
  variant = 'ghost',
  size = 'md',
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest} />
}

export function ButtonLink({
  href,
  variant = 'ghost',
  size = 'md',
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...rest}>
      {children}
    </Link>
  )
}
