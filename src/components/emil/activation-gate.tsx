import { EMIL_SHORT } from '@/lib/brand'
import { Panel } from '@/components/ui/panel'
import { cn } from '@/lib/utils'

/**
 * What activation actually asks of you.
 *
 * The Control Cockpit will not let EMIL turn itself on. The activation screen
 * puts three things in front of the operator in order — a disclosure of what
 * the system cannot do, every limit that will be in force, and a set of
 * acknowledgements that have to be ticked — and this reproduces that screen's
 * structure rather than describing it.
 *
 * Two decisions about honesty here.
 *
 * The limit sheet names the fields and not the numbers. The numbers on any
 * given screen are whatever that operator set; the fields are the product. A
 * website quoting one account's daily loss limit as though it were a default
 * would be quoting a setting as a specification.
 *
 * And the acknowledgements are rendered as marks, not as checkboxes. They are
 * the application's gate, not this page's — a real input here would suggest
 * the website was collecting a consent it has no business collecting.
 */

/** The disclosure, in the app's own words. */
const DISCLOSURE: readonly string[] = [
  `${EMIL_SHORT} is an AI-assisted trading system capable of analysing markets and, depending on the permissions you select, opening, modifying, hedging and closing trades.`,
  'Trading carries substantial financial risk.',
  `${EMIL_SHORT} cannot guarantee profit, eliminate losses, predict market movements with certainty, prevent gaps, prevent slippage, guarantee stop-loss execution, eliminate liquidity risk, eliminate broker risk, or eliminate technology failure.`,
  'Historical results, simulations, backtests, AI predictions, strategy confidence and previous profitable trades do not guarantee future performance.',
]

/** Every field the activation screen makes you read before it will arm. */
const REVIEW: readonly { field: string; note: string }[] = [
  { field: 'Mode', note: 'Which of the nine, and therefore whether it can act at all' },
  { field: 'Base lot', note: 'The unit every size is built from' },
  { field: 'Maximum aggregate exposure', note: 'The ceiling across everything it holds at once' },
  { field: 'Maximum risk per trade', note: 'As a share of the account, per position' },
  { field: 'Daily loss limit', note: 'The budget for the session' },
  { field: 'Weekly loss limit', note: 'The budget above that one' },
  { field: 'Maximum drawdown', note: 'Measured from the high-water mark, not from the open' },
  { field: 'Maximum margin utilisation', note: 'How much of the account may be committed' },
  { field: 'Maximum open positions', note: 'A count, not a notional' },
  { field: 'Allowed assets', note: 'The classes it may touch; everything else is refused' },
  { field: 'Allowed sessions', note: 'The hours it may act in' },
  { field: 'Hedge permission', note: 'Granted or not, as its own decision' },
  { field: 'News-event behaviour', note: 'What it does as a high-impact event approaches' },
  { field: 'Profit capital mode', note: 'Whether banked profit may be worked, or preserved' },
  { field: 'Emergency behaviour', note: 'What happens the moment the stop is hit' },
]

/** The acknowledgements, in the app's own words. */
const ACKNOWLEDGEMENTS: readonly string[] = [
  'I understand that trading can produce substantial financial losses.',
  `I understand ${EMIL_SHORT} may act automatically within the permissions shown above.`,
  `I understand the stated figure is the current default maximum ${EMIL_SHORT}-controlled exposure.`,
  'I understand hedging can introduce additional risk and costs.',
]

export function ActivationGate({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <Panel tintIndex={0} className="flex flex-col gap-4 p-6">
        <p className="text-eyebrow uppercase text-steel-500">The disclosure</p>
        {DISCLOSURE.map((paragraph, index) => (
          <p
            key={paragraph}
            className={cn(
              'border-t border-line-2 pt-3.5 text-[0.9375rem] leading-relaxed',
              // The second line is the one the whole screen is built around.
              index === 1 ? 'text-warn' : 'text-steel-300',
            )}
          >
            {paragraph}
          </p>
        ))}
        <p className="mt-2 text-data text-steel-500">
          Shown every time, before anything can be armed. It is not a footnote and it is not
          dismissible.
        </p>
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel tintIndex={1} className="p-6">
          <p className="text-eyebrow uppercase text-steel-500">
            Reviewed before it will arm · {REVIEW.length} fields
          </p>
          <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
            {REVIEW.map((row) => (
              <li key={row.field} className="border-t border-line-2 py-3">
                <p className="text-[0.9375rem] leading-snug text-steel-100">{row.field}</p>
                <p className="mt-1 text-data leading-relaxed text-steel-500">{row.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-data text-steel-500">
            The fields are the product. The values are whatever the operator set, which is why none
            are quoted here.
          </p>
        </Panel>

        <Panel tintIndex={2} className="p-6">
          <p className="text-eyebrow uppercase text-steel-500">
            Then ticked · {ACKNOWLEDGEMENTS.length} acknowledgements
          </p>
          <ul className="mt-4 flex flex-col gap-3.5">
            {ACKNOWLEDGEMENTS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 border-t border-line-2 pt-3.5 text-[0.9375rem] leading-relaxed text-steel-300"
              >
                <span
                  aria-hidden
                  className="mt-[0.2rem] h-3.5 w-3.5 shrink-0 rounded-[3px] border border-steel-700"
                />
                {item}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
