import { EMIL_SHORT } from '@/lib/brand'
import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

/**
 * Two numbers that are deliberately not the same number.
 *
 * The Trust & Metacognition surface asks one question continuously — how much
 * should I trust my own judgement right now — and keeps the answer separate
 * from how good any individual setup looks. The rule between them is stated on
 * the surface and is the whole point: high confidence in a setup can never
 * override low trust in the environment.
 *
 * The two figures here are the example the app itself uses to show the rule.
 * They are labelled as an example rather than presented as a live reading,
 * because that is what they are.
 */

const BANDS: readonly { band: string; level: string; behaviour: string }[] = [
  {
    band: 'High',
    level: 'Full permitted autonomy',
    behaviour: 'Normal sizing, inside every cap that already applies',
  },
  {
    band: 'Moderate',
    level: 'Normal operation, tighter filters',
    behaviour: 'Marginal setups are skipped rather than taken small',
  },
  {
    band: 'Low',
    level: 'Reduced or refused',
    behaviour: 'Risk cut, confirmation required, or it stands down and says why',
  },
  {
    band: 'Extreme novelty',
    level: 'Capital protection',
    behaviour: 'Regardless of how attractive any individual setup appears',
  },
]

export function TrustVsConfidence({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <Panel tintIndex={0} className="flex flex-col gap-5 p-6">
        <p className="text-eyebrow uppercase text-steel-500">
          The distinction · the application’s own example
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-ui border border-line-2 bg-bg-1 p-5">
            <p className="text-eyebrow uppercase text-steel-500">Setup confidence</p>
            <p className="mt-2 font-mono text-[1.75rem] tabular-nums text-up">82%</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-steel-300">
              “This pattern looks excellent.”
            </p>
          </div>
          <div className="rounded-ui border border-line-2 bg-bg-1 p-5">
            <p className="text-eyebrow uppercase text-steel-500">Environment trust</p>
            <p className="mt-2 font-mono text-[1.75rem] tabular-nums text-warn">46%</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-steel-300">
              “But I don’t trust these conditions.”
            </p>
          </div>
        </div>

        <div className="rounded-ui border border-down/30 bg-bg-1 p-5">
          <p className="text-eyebrow uppercase text-down">The rule</p>
          <p className="mt-2 text-body text-steel-300">
            High setup confidence can never override low environment trust. On this example{' '}
            {EMIL_SHORT} does <span className="text-steel-100">not</span> trade — it reduces risk,
            requires confirmation, or stands down entirely, and tells you which number was
            responsible.
          </p>
        </div>
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel tintIndex={1} className="p-6">
          <p className="text-eyebrow uppercase text-steel-500">What each trust band means</p>
          <ul className="mt-4 flex flex-col">
            {BANDS.map((row) => (
              <li key={row.band} className="border-t border-line-2 py-3.5">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-signal">
                    {row.band}
                  </span>
                  <span className="text-[0.9375rem] leading-snug text-steel-100">{row.level}</span>
                </p>
                <p className="mt-1 text-data leading-relaxed text-steel-500">{row.behaviour}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel tintIndex={2} className="p-6">
          <p className="text-eyebrow uppercase text-steel-500">Novelty, as its own input</p>
          <p className="mt-3 border-t border-line-2 pt-3.5 text-[0.9375rem] leading-relaxed text-steel-300">
            A dedicated detector watches for behaviour that matches no learned regime — correlation
            breaking, a volatility signature it has not seen, price action outside the historical
            distribution. The penalty it raises pushes trust down on its own, without waiting for a
            loss to prove the point.
          </p>
        </Panel>
      </div>
    </div>
  )
}
