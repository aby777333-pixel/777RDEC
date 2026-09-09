'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { EmilStatusCard } from '@/components/emil/emil-status-card'
import { EMIL_EXPANSION, EMIL_SHORT } from '@/lib/brand'

const LINES = ['Markets change.', 'Strategies decay.', 'Relationships shift.', 'Risk moves.'] as const

export function EmilReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="relative border-b border-line-1 bg-bg-0 py-24 md:py-32">
      <div className="container-raptor" ref={ref}>
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <Eyebrow>{EMIL_EXPANSION}</Eyebrow>

            <div className="flex flex-col gap-1.5">
              {LINES.map((line, index) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[1.5rem] leading-tight text-steel-500 md:text-[1.875rem]"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
              className="text-h2 uppercase text-chrome"
            >
              {EMIL_SHORT} evolves with them.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.4 }}
              className="max-w-xl text-body text-steel-300"
            >
              {EMIL_SHORT} observes the market and your book, states what it sees in plain language,
              and acts only inside a mandate you have written and confirmed. It is not an expert
              advisor and it is not a bot.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.6 }}
              className="flex flex-wrap gap-3"
            >
              <ButtonLink href="/platform/emil" variant="primary">
                See how {EMIL_SHORT} thinks
              </ButtonLink>
              <ButtonLink href="/intelligence/emil-lab" variant="ghost">
                Open {EMIL_SHORT} Lab
              </ButtonLink>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <EmilStatusCard awake={inView} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
