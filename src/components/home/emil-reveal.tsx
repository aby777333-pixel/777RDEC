'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Quote } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { Eyebrow } from '@/components/ui/eyebrow'
import { EmilStatusCard } from '@/components/emil/emil-status-card'
import { EMIL_EXPANSION, EMIL_SHORT } from '@/lib/brand'

const LINES = ['Markets change.', 'Strategies decay.', 'Relationships shift.', 'Risk moves.'] as const

const CLAIMS = [
  {
    label: 'It learns',
    body: 'Inputs are scored against what actually happened and re-ranked continuously. A relationship that stops holding stops driving the reading.',
  },
  {
    label: 'It acts',
    body: 'Armed, it opens, closes, modifies and hedges — only with the permissions you granted, only in the markets you selected.',
  },
  {
    label: 'It protects',
    body: 'Protected capital, a profit floor that only ratchets up, and a drawdown guard from the high-water mark. Breach it and it disarms itself.',
  },
  {
    label: 'It explains',
    body: 'Every event is logged in plain language, refusals included — which are the lines that tell you where the boundaries really are.',
  },
] as const

/**
 * The home page's EMIL band. The heading, the explanation and the four claims
 * hold the left column; the right column is EMIL itself — the four-line quote
 * in a card of its own, above the live status card — so the quote sits with
 * the thing it describes and the heading leads the section.
 */
export function EmilReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section className="relative border-b border-line-1 bg-bg-0 py-24 md:py-32">
      <div className="container-raptor" ref={ref}>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-center lg:gap-14">
          <div className="flex flex-col gap-6">
            <Eyebrow>{EMIL_EXPANSION}</Eyebrow>

            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-h2 uppercase text-chrome"
            >
              {EMIL_SHORT} evolves with them.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="max-w-xl text-body text-steel-300"
            >
              {EMIL_SHORT} adjusts its own inputs from what the market is actually doing — nobody
              retunes it every quarter. Armed, it takes trades: opening, closing, modifying and
              hedging, strictly inside a mandate you wrote and confirmed. And it holds the capital
              boundaries you set, enforced in the order path where the intelligence layer cannot
              reach them.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              {CLAIMS.map((claim) => (
                <li key={claim.label} className="flex gap-3 border-t border-line-2 pt-3">
                  <span className="w-[7.5rem] shrink-0 text-eyebrow uppercase text-signal">
                    {claim.label}
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-steel-300">
                    {claim.body}
                  </span>
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.6 }}
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

          <div className="flex flex-col gap-5">
            <motion.figure
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <Panel tone="raised" size="panel" className="flex flex-col gap-4 p-6 md:p-8">
                <Quote size={22} strokeWidth={1.5} aria-hidden className="text-signal" />
                <blockquote className="flex flex-col gap-1">
                  {LINES.map((line, index) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0, x: -12 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.6, delay: 0.4 + index * 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-[1.5rem] leading-tight text-steel-100 md:text-[1.875rem]"
                    >
                      {line}
                    </motion.p>
                  ))}
                </blockquote>
                <figcaption className="text-eyebrow uppercase text-steel-500">{EMIL_EXPANSION}</figcaption>
              </Panel>
            </motion.figure>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <EmilStatusCard awake={inView} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
