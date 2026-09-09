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
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: string
  className?: string
  align?: 'left' | 'center'
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
      <h2 className="text-h2 uppercase text-steel-100">{title}</h2>
      {lead ? (
        <p className={cn('max-w-2xl text-body text-steel-300', align === 'center' && 'mx-auto')}>
          {lead}
        </p>
      ) : null}
    </div>
  )
}
