import { EMIL_SHORT } from '@/lib/brand'
import { Panel } from '@/components/ui/panel'

const COMPARISON: readonly { ea: string; emil: string }[] = [
  {
    ea: 'Runs a fixed rule set until you turn it off.',
    emil: 'Re-weights its inputs as conditions change, and says when a relationship has stopped holding.',
  },
  {
    ea: 'Optimised on history, then deployed and hoped for.',
    emil: 'Reports what it currently observes rather than what previously worked.',
  },
  {
    ea: 'Opaque: a number changes and you infer why.',
    emil: 'Logs every event in readable language with the inputs that produced it.',
  },
  {
    ea: 'Position sizing lives inside the strategy.',
    emil: 'Bounded by the account risk limits, enforced outside it in the order path.',
  },
  {
    ea: 'Stopping it means finding the setting that stops it.',
    emil: 'One always-visible control disarms it instantly, with no confirmation.',
  },
  {
    ea: 'Sold on a performance curve.',
    emil: 'Described by what it observes and what it is forbidden from doing.',
  },
]

export function NotAnEa() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-h2 uppercase text-steel-100">
        Not an EA. Not a bot. An intelligence layer.
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-6">
          <p className="text-eyebrow uppercase text-steel-500">A conventional expert advisor</p>
          <ul className="mt-4 flex flex-col gap-4">
            {COMPARISON.map((row) => (
              <li key={row.ea} className="border-t border-line-2 pt-3.5 text-[0.9375rem] leading-relaxed text-steel-500">
                {row.ea}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel tone="raised" className="border-signal/30 p-6">
          <p className="text-eyebrow uppercase text-signal">{EMIL_SHORT}</p>
          <ul className="mt-4 flex flex-col gap-4">
            {COMPARISON.map((row) => (
              <li key={row.emil} className="border-t border-line-2 pt-3.5 text-[0.9375rem] leading-relaxed text-steel-300">
                {row.emil}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <p className="max-w-3xl text-[0.9375rem] leading-relaxed text-steel-500">
        None of this makes {EMIL_SHORT} a way to avoid losses. It is a way to see conditions
        earlier, to keep automation inside boundaries you wrote, and to be able to explain
        afterwards what happened and why.
      </p>
    </div>
  )
}
