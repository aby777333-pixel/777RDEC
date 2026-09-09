'use client'

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Power, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { Chip } from '@/components/ui/chip'
import { RiskLine } from '@/components/layout/risk-line'
import { ArmDialog } from './arm-dialog'
import { EmilLog, type EmilLogEntry } from './emil-log'
import { EMIL_SHORT } from '@/lib/brand'
import { ASSET_CLASSES, INSTRUMENTS } from '@/lib/sim/instruments'
import {
  ANALYSIS_LABELS,
  AUTOMATION_LABELS,
  DEFAULT_MANDATE,
  INITIAL_STATE,
  TRADING_LABELS,
  reduce,
  type AnalysisPermission,
  type AutomationLevel,
  type Mandate,
  type TradingPermission,
} from '@/lib/emil/machine'
import { cn } from '@/lib/utils'

const MARKET_CHOICES = INSTRUMENTS.filter((i) =>
  ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAGUSD', 'NAS100', 'US30', 'BTCUSD', 'ETHUSD', 'WTIUSD'].includes(
    i.symbol,
  ),
)

/**
 * The real EMIL control surface, used in EMIL Lab and in the sandbox.
 * State transitions go through the machine in lib/emil/machine.ts — there is
 * no boolean soup here, and DISARM is rendered in every state.
 */
export function EmilControlPanel({ className }: { className?: string }) {
  const [state, dispatch] = useReducer(reduce, INITIAL_STATE)
  const [draft, setDraft] = useState<Mandate>(DEFAULT_MANDATE)
  const [log, setLog] = useState<readonly EmilLogEntry[]>([])
  const logId = useRef(0)
  const panelRef = useRef<HTMLDivElement>(null)

  const armed = state.status === 'ARMED'

  const append = useCallback((tone: EmilLogEntry['tone'], text: string) => {
    logId.current += 1
    const at = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLog((previous) => [{ id: logId.current, at, tone, text }, ...previous].slice(0, 40))
  }, [])

  // Esc disarms whenever focus is inside the panel.
  useEffect(() => {
    const node = panelRef.current
    if (!node) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.status === 'ARMED') {
        dispatch({ type: 'disarm' })
        append('protect', `${EMIL_SHORT} disarmed by keyboard. All authorisation withdrawn.`)
      }
    }
    node.addEventListener('keydown', onKeyDown)
    return () => node.removeEventListener('keydown', onKeyDown)
  }, [state.status, append])

  /** While armed, narrate believable intelligence events. No profit claims. */
  const events = useMemo(() => buildEventScript(draft), [draft])

  useEffect(() => {
    if (!armed) return
    let index = 0
    const timer = setInterval(() => {
      const event = events[index % events.length]
      if (event) append(event.tone, event.text)
      index += 1
    }, 3200)
    return () => clearInterval(timer)
  }, [armed, events, append])

  function commitDraft(next: Mandate) {
    setDraft(next)
    dispatch({ type: 'configure', mandate: next })
  }

  function requestArm() {
    dispatch({ type: 'configure', mandate: draft })
    dispatch({ type: 'requestArm' })
  }

  function acknowledge() {
    dispatch({ type: 'acknowledge', at: Date.now() })
    append('act', `${EMIL_SHORT} armed. Mandate: ${describeMandate(draft)}.`)
  }

  function disarm() {
    if (state.status === 'DISARMED') return
    dispatch({ type: 'disarm' })
    append('protect', `${EMIL_SHORT} disarmed. All authorisation withdrawn.`)
  }

  return (
    <div ref={panelRef} className={cn('flex flex-col gap-4', className)}>
      <Panel
        tone="raised"
        size="panel"
        className={cn(
          'overflow-hidden transition-colors duration-500',
          armed ? 'border-armed/50' : 'border-line-2',
        )}
      >
        {/* Status header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-1 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 items-center justify-center" aria-hidden>
              {armed ? (
                <span className="absolute inset-[-6px] rounded-full border border-armed/50 motion-safe:animate-breathe" />
              ) : null}
              <span
                className={cn('h-2 w-2 rounded-full', armed ? 'bg-armed' : 'bg-steel-700')}
              />
            </span>
            <div className="flex flex-col">
              <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
                {EMIL_SHORT} Control
              </span>
              <span
                className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-steel-500"
                aria-live="polite"
              >
                {statusLabel(state.status)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip tone={armed ? 'armed' : 'steel'} dot>
              {armed ? 'Armed' : 'Disarmed'}
            </Chip>
            {/* DISARM is rendered in every state, always high-contrast. */}
            <Button
              variant="danger"
              size="sm"
              onClick={disarm}
              disabled={state.status === 'DISARMED'}
              aria-keyshortcuts="Escape"
              className="disabled:opacity-50"
            >
              <Power size={14} strokeWidth={2} aria-hidden />
              Disarm
            </Button>
          </div>
        </div>

        {/* Mandate form */}
        <fieldset disabled={armed} className="grid gap-6 px-5 py-5 lg:grid-cols-2">
          <legend className="sr-only">EMIL mandate</legend>

          <Field label="Analysis permissions" hint="What EMIL is allowed to look at.">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ANALYSIS_LABELS) as AnalysisPermission[]).map((key) => (
                <Toggle
                  key={key}
                  checked={draft.analysis.includes(key)}
                  label={ANALYSIS_LABELS[key]}
                  onChange={(checked) =>
                    commitDraft({
                      ...draft,
                      analysis: checked
                        ? [...draft.analysis, key]
                        : draft.analysis.filter((a) => a !== key),
                    })
                  }
                />
              ))}
            </div>
          </Field>

          <Field label="Markets" hint="EMIL may not act outside this selection.">
            <div className="scroll-steel flex max-h-28 flex-wrap gap-2 overflow-y-auto">
              {MARKET_CHOICES.map((instrument) => (
                <Toggle
                  key={instrument.symbol}
                  checked={draft.markets.includes(instrument.symbol)}
                  label={instrument.symbol}
                  mono
                  onChange={(checked) =>
                    commitDraft({
                      ...draft,
                      markets: checked
                        ? [...draft.markets, instrument.symbol]
                        : draft.markets.filter((m) => m !== instrument.symbol),
                    })
                  }
                />
              ))}
            </div>
          </Field>

          <Field label="Risk limits" hint="Breaching either limit stops EMIL acting.">
            <div className="flex flex-col gap-4">
              <Slider
                label="Max drawdown from high-water mark"
                value={draft.maxDrawdownPct}
                min={1}
                max={25}
                step={1}
                unit="%"
                onChange={(value) => commitDraft({ ...draft, maxDrawdownPct: value })}
              />
              <Slider
                label="Max daily loss"
                value={draft.maxDailyLossPct}
                min={0.5}
                max={10}
                step={0.5}
                unit="%"
                onChange={(value) => commitDraft({ ...draft, maxDailyLossPct: value })}
              />
              <Slider
                label="Max aggregate exposure"
                value={draft.maxExposureLots}
                min={0.01}
                max={2}
                step={0.01}
                unit=" lots"
                onChange={(value) => commitDraft({ ...draft, maxExposureLots: value })}
              />
            </div>
          </Field>

          <Field label="Automation level" hint="How far EMIL may go without you.">
            <div className="flex flex-col gap-2">
              {(Object.keys(AUTOMATION_LABELS) as AutomationLevel[]).map((level) => (
                <label
                  key={level}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-card border px-3.5 py-3 transition-colors duration-200',
                    draft.automation === level
                      ? 'border-signal/50 bg-signal/[0.06]'
                      : 'border-line-2 hover:bg-bg-3',
                  )}
                >
                  <input
                    type="radio"
                    name="automation"
                    value={level}
                    checked={draft.automation === level}
                    onChange={() => commitDraft({ ...draft, automation: level })}
                    className="mt-1 h-3.5 w-3.5 shrink-0 accent-[var(--signal)]"
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[0.9375rem] text-steel-100">
                      {AUTOMATION_LABELS[level].label}
                    </span>
                    <span className="text-[0.8125rem] leading-snug text-steel-500">
                      {AUTOMATION_LABELS[level].detail}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Field>

          <Field
            label="Trading permissions"
            hint={
              draft.automation === 'execute'
                ? 'Only these actions are permitted.'
                : 'Only applies at the Execute automation level.'
            }
            className="lg:col-span-2"
          >
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TRADING_LABELS) as TradingPermission[]).map((key) => (
                <Toggle
                  key={key}
                  checked={draft.trading.includes(key)}
                  label={TRADING_LABELS[key]}
                  dimmed={draft.automation !== 'execute'}
                  onChange={(checked) =>
                    commitDraft({
                      ...draft,
                      trading: checked
                        ? [...draft.trading, key]
                        : draft.trading.filter((t) => t !== key),
                    })
                  }
                />
              ))}
            </div>
          </Field>
        </fieldset>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-1 bg-bg-1 px-5 py-4">
          <p className="max-w-lg text-[0.8125rem] leading-relaxed text-steel-500">
            {armed
              ? `${EMIL_SHORT} is armed inside the mandate above. Press Disarm, or Escape, to withdraw authorisation immediately.`
              : `Arming requires you to read the authorisation text and type ${'ARM'}. Nothing is permitted before that.`}
          </p>
          <Button variant="primary" onClick={requestArm} disabled={armed || !isArmable(draft)}>
            <Sparkles size={14} strokeWidth={1.5} aria-hidden />
            Request arm
          </Button>
        </div>
      </Panel>

      <Panel className="overflow-hidden p-0">
        <EmilLog entries={log} />
      </Panel>

      <RiskLine />

      <ArmDialog
        open={state.status === 'CONFIRMING'}
        mandate={state.status === 'CONFIRMING' ? state.mandate : draft}
        onCancel={() => dispatch({ type: 'cancel' })}
        onAcknowledge={acknowledge}
      />
    </div>
  )
}

function statusLabel(status: string): string {
  switch (status) {
    case 'DISARMED':
      return 'Disarmed · observing only'
    case 'CONFIGURED':
      return 'Configured · not yet authorised'
    case 'CONFIRMING':
      return 'Awaiting authorisation'
    case 'ARMED':
      return 'Armed · acting inside mandate'
    default:
      return status
  }
}

function isArmable(mandate: Mandate): boolean {
  if (mandate.markets.length === 0) return false
  if (mandate.analysis.length === 0) return false
  if (mandate.automation === 'execute' && mandate.trading.length === 0) return false
  return true
}

function describeMandate(mandate: Mandate): string {
  return `${AUTOMATION_LABELS[mandate.automation].label.toLowerCase()}, ${mandate.markets.length} market(s), max ${mandate.maxExposureLots.toFixed(2)} lots, drawdown guard ${mandate.maxDrawdownPct}%`
}

/** Believable narration. Describes observation and enforcement, never returns. */
function buildEventScript(mandate: Mandate): readonly { tone: EmilLogEntry['tone']; text: string }[] {
  const first = mandate.markets[0] ?? 'EURUSD'
  const second = mandate.markets[1] ?? 'XAUUSD'
  const assetClass = ASSET_CLASSES[0] ?? 'FX'

  return [
    { tone: 'observe', text: `Regime shift detected: ${first} trending → ranging.` },
    { tone: 'observe', text: `Spread on ${second} widened 1.8x above session median.` },
    { tone: 'protect', text: `Exposure 62% of mandate (${mandate.maxExposureLots.toFixed(2)} lots).` },
    {
      tone: 'refuse',
      text: 'Order rejected: would breach concentration limit on correlated positions.',
    },
    { tone: 'observe', text: `Correlation cluster forming: ${first} / ${second}.` },
    {
      tone: 'protect',
      text: `Drawdown from high-water mark 1.4% of ${mandate.maxDrawdownPct}% guard.`,
    },
    {
      tone: mandate.automation === 'execute' ? 'act' : 'observe',
      text:
        mandate.automation === 'execute'
          ? `Reduced ${first} exposure by 0.02 lots within mandate.`
          : `Proposal logged for review: reduce ${first} exposure. No action taken.`,
    },
    { tone: 'observe', text: `Volatility in ${assetClass} classified normal for this session.` },
    { tone: 'refuse', text: `Instrument outside mandate: request for USDJPY declined.` },
    { tone: 'protect', text: 'Daily loss budget 18% consumed. Continuing to observe.' },
  ]
}

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <div className="flex flex-col gap-0.5">
        <span className="text-eyebrow uppercase text-steel-500">{label}</span>
        {hint ? <span className="text-[0.8125rem] text-steel-500">{hint}</span> : null}
      </div>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  label,
  onChange,
  mono = false,
  dimmed = false,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
  mono?: boolean
  dimmed?: boolean
}) {
  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-ui border px-2.5 py-1.5 text-[0.8125rem] transition-colors duration-200',
        checked ? 'border-signal/50 bg-signal/[0.08] text-steel-100' : 'border-line-2 text-steel-300 hover:bg-bg-3',
        mono && 'font-mono text-[0.75rem]',
        dimmed && 'opacity-55',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-3.5 w-3.5 accent-[var(--signal)]"
      />
      {label}
    </label>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="text-[0.8125rem] text-steel-300">{label}</span>
        <span className="font-mono text-[0.8125rem] text-steel-100" data-numeric>
          {step < 1 ? value.toFixed(2) : value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-bg-3 accent-[var(--signal)]"
      />
    </label>
  )
}
