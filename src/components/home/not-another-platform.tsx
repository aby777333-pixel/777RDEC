'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ECOSYSTEM_PILLARS } from '@/lib/brand'
import { Eyebrow } from '@/components/ui/eyebrow'

/** Scattered start positions, in percent, so the blocks visibly dock. */
const SCATTER = [
  { x: -34, y: -26 },
  { x: 30, y: -34 },
  { x: -28, y: 30 },
  { x: 36, y: 24 },
  { x: -6, y: -42 },
  { x: 10, y: 40 },
] as const

export function NotAnotherPlatform() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="relative border-y border-line-1 py-20 md:py-28">
      <div className="container-raptor" ref={ref}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Eyebrow>The premise</Eyebrow>
          <motion.h2
            initial={{ opacity: 1 }}
            animate={inView ? { opacity: 0.28 } : { opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-h2 uppercase text-steel-100"
          >
            This is not another trading platform.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-h2 uppercase text-chrome"
          >
            This is Raptor.
          </motion.p>
        </div>

        <div className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-panel border border-line-2 p-4 md:p-6">
          <span className="absolute -top-2.5 left-6 bg-bg-0 px-2 text-eyebrow uppercase text-steel-500">
            One ecosystem
          </span>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {ECOSYSTEM_PILLARS.map((pillar, index) => {
              const from = SCATTER[index] ?? { x: 0, y: 0 }
              return (
                <motion.div
                  key={pillar.id}
                  initial={{ opacity: 0, x: `${from.x}%`, y: `${from.y}%`, scale: 0.9 }}
                  animate={inView ? { opacity: 1, x: '0%', y: '0%', scale: 1 } : {}}
                  transition={{
                    duration: 0.85,
                    delay: 1.3 + index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={pillar.href}
                    className="lift surface-sheen flex h-full flex-col gap-1.5 rounded-card border border-line-2 bg-bg-1 p-4 hover:border-signal/50 hover:bg-bg-2"
                  >
                    <span className="font-display text-[1rem] uppercase tracking-tight text-steel-100">
                      {pillar.label}
                    </span>
                    <span className="text-[0.8125rem] leading-snug text-steel-500">{pillar.line}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
