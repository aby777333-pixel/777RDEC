'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EMIL_SHORT, RISK_LINE_SHORT } from '@/lib/brand'
import {
  ARM_CONFIRMATION_WORD,
  AUTOMATION_LABELS,
  TRADING_LABELS,
  type Mandate,
} from '@/lib/emil/machine'

/**
 * Authorisation modal. Deliberately not dismissible by clicking outside, and
 * requires the confirmation word to be typed. Arming EMIL is an act of
 * authorisation, not a UI convenience.
 */
export function ArmDialog({
  open,
  mandate,
  onCancel,
  onAcknowledge,
}: {
  open: boolean
  mandate: Mandate
  onCancel: () => void
  onAcknowledge: () => void
}) {
  const [typed, setTyped] = useState('')
  const matches = typed.trim().toUpperCase() === ARM_CONFIRMATION_WORD

  function cancel() {
    setTyped('')
    onCancel()
  }

  function acknowledge() {
    if (!matches) return
    setTyped('')
    onAcknowledge()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? null : cancel())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg-0/85 backdrop-blur-sm" />
        <Dialog.Content
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 flex max-h-[90dvh] w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-panel border border-armed/40 bg-bg-1 shadow-panel"
        >
          <div className="flex items-start gap-3 border-b border-line-1 px-6 py-5">
            <ShieldAlert size={20} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-armed" />
            <div>
              <Dialog.Title className="font-display text-[1.25rem] uppercase tracking-tight text-steel-100">
                Authorise {EMIL_SHORT}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[0.875rem] text-steel-500">
                Read this before you arm. It describes exactly what you are permitting.
              </Dialog.Description>
            </div>
          </div>

          <div className="scroll-steel flex-1 overflow-y-auto px-6 py-5">
            <dl className="flex flex-col gap-4 text-[0.875rem]">
              <Row label="EMIL will be permitted to">
                {AUTOMATION_LABELS[mandate.automation].detail}
                {mandate.automation === 'execute' && mandate.trading.length > 0 ? (
                  <span className="mt-1 block text-steel-500">
                    Trading permissions granted:{' '}
                    {mandate.trading.map((p) => TRADING_LABELS[p]).join(', ')}.
                  </span>
                ) : null}
              </Row>
              <Row label="Hard limits it cannot exceed">
                Maximum exposure {mandate.maxExposureLots.toFixed(2)} lots. Maximum drawdown{' '}
                {mandate.maxDrawdownPct}% from the high-water mark. Maximum daily loss{' '}
                {mandate.maxDailyLossPct}% of account equity. Markets:{' '}
                {mandate.markets.length > 0 ? mandate.markets.join(', ') : 'none selected'}.
              </Row>
              <Row label="What it cannot do">
                {EMIL_SHORT} cannot remove market risk. It cannot exceed the limits above, trade
                instruments you have not selected, or act at all once disarmed. Every action it
                proposes passes the same pre-trade checks as an order you place yourself.
              </Row>
              <Row label="And">Not trading is also a trading decision.</Row>
            </dl>

            <p className="mt-5 rounded-card border border-line-2 bg-bg-2 px-4 py-3 text-[0.8125rem] leading-relaxed text-steel-500">
              {RISK_LINE_SHORT}
            </p>

            <label className="mt-5 block">
              <span className="text-eyebrow uppercase text-steel-500">
                Type {ARM_CONFIRMATION_WORD} to confirm
              </span>
              <input
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') acknowledge()
                }}
                autoComplete="off"
                spellCheck={false}
                aria-label={`Type ${ARM_CONFIRMATION_WORD} to confirm`}
                className="mt-2 w-full rounded-ui border border-line-2 bg-bg-0 px-3 py-2.5 font-mono text-[0.9375rem] uppercase tracking-[0.2em] text-steel-100 placeholder:tracking-normal placeholder:text-steel-700"
                placeholder={ARM_CONFIRMATION_WORD}
              />
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-line-1 px-6 py-4">
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!matches}
              onClick={acknowledge}
              className="disabled:opacity-60"
            >
              Arm {EMIL_SHORT}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-line-2 pt-3">
      <dt className="text-eyebrow uppercase text-steel-500">{label}</dt>
      <dd className="leading-relaxed text-steel-300">{children}</dd>
    </div>
  )
}
