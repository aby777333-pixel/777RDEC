import { cn } from '@/lib/utils'
import { Eyebrow } from './eyebrow'

export function Section({
  children,
  className,
  grid = false,
  id,
}: {
  children: React.ReactNode
  className?: string
  grid?: boolean
  id?: string
}) {
  return (
    <section id={id} className={cn('relative py-20 md:py-28', className)}>
      {grid ? <div className="grid-field pointer-events-none absolute inset-0" aria-hidden /> : null}
      <div className="container-raptor relative">{children}</div>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  lead,
  className,
  align = 'left',
  size = 'default',
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: string
  className?: string
  align?: 'left' | 'center'
  /** `compact` for a heading that introduces a component rather than a section of argument. */
  size?: 'default' | 'compact'
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'items-center text-center' : 'items-start',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn(
          'w-full uppercase text-steel-100',
          size === 'compact' ? 'text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.02] tracking-[-0.02em]' : 'text-h2',
        )}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={cn(
            'w-full max-w-2xl text-steel-300',
            size === 'compact' ? 'text-[1rem] leading-relaxed' : 'text-body',
            align === 'center' && 'mx-auto',
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  )
}
