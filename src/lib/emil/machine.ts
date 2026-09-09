/**
 * EMIL state machine, written as an explicit discriminated union.
 *
 *   DISARMED → (configure) → CONFIGURED → (requestArm) → CONFIRMING
 *                                 ↑                          │
 *                                 └────── (cancel) ──────────┘
 *                                                            │
 *                                                    (acknowledge)
 *                                                            ↓
 *                                                          ARMED
 *                                                            │
 *                                                        (disarm)
 *                                                            ↓
 *                                                        DISARMED
 *
 * `disarm` is accepted from every state and never requires confirmation.
 */

export type AutomationLevel = 'analyse' | 'suggest' | 'execute'
export type TradingPermission = 'open' | 'close' | 'modify' | 'hedge'
export type AnalysisPermission = 'price' | 'volatility' | 'correlation' | 'exposure' | 'session'

export type Mandate = {
  analysis: readonly AnalysisPermission[]
  markets: readonly string[]
  maxDrawdownPct: number
  maxDailyLossPct: number
  maxExposureLots: number
  automation: AutomationLevel
  trading: readonly TradingPermission[]
}

export const DEFAULT_MANDATE: Mandate = {
  analysis: ['price', 'volatility', 'exposure'],
  markets: ['EURUSD', 'XAUUSD'],
  maxDrawdownPct: 8,
  maxDailyLossPct: 2,
  maxExposureLots: 0.1,
  automation: 'suggest',
  trading: ['close'],
}

export type EmilState =
  | { status: 'DISARMED' }
  | { status: 'CONFIGURED'; mandate: Mandate }
  | { status: 'CONFIRMING'; mandate: Mandate }
  | { status: 'ARMED'; mandate: Mandate; armedAt: number }

export type EmilEvent =
  | { type: 'configure'; mandate: Mandate }
  | { type: 'requestArm' }
  | { type: 'acknowledge'; at: number }
  | { type: 'cancel' }
  | { type: 'disarm' }

export const INITIAL_STATE: EmilState = { status: 'DISARMED' }

export function reduce(state: EmilState, event: EmilEvent): EmilState {
  // Disarming is always available and always immediate.
  if (event.type === 'disarm') return { status: 'DISARMED' }

  switch (state.status) {
    case 'DISARMED':
      return event.type === 'configure' ? { status: 'CONFIGURED', mandate: event.mandate } : state

    case 'CONFIGURED':
      if (event.type === 'configure') return { status: 'CONFIGURED', mandate: event.mandate }
      if (event.type === 'requestArm') return { status: 'CONFIRMING', mandate: state.mandate }
      return state

    case 'CONFIRMING':
      if (event.type === 'cancel') return { status: 'CONFIGURED', mandate: state.mandate }
      if (event.type === 'acknowledge')
        return { status: 'ARMED', mandate: state.mandate, armedAt: event.at }
      return state

    case 'ARMED':
      return state
  }
}

/** The word a user must type to arm. Deliberately not a click-through. */
export const ARM_CONFIRMATION_WORD = 'ARM'

export const AUTOMATION_LABELS: Record<AutomationLevel, { label: string; detail: string }> = {
  analyse: {
    label: 'Analyse only',
    detail: 'EMIL observes and reports. It proposes nothing and sends nothing.',
  },
  suggest: {
    label: 'Suggest',
    detail: 'EMIL proposes actions for you to accept or reject. Nothing reaches the market on its own.',
  },
  execute: {
    label: 'Execute within mandate',
    detail:
      'EMIL may act, strictly inside the limits below, and only with the trading permissions you grant.',
  },
}

export const ANALYSIS_LABELS: Record<AnalysisPermission, string> = {
  price: 'Price and spread',
  volatility: 'Volatility and range',
  correlation: 'Cross-asset correlation',
  exposure: 'Account exposure',
  session: 'Session behaviour',
}

export const TRADING_LABELS: Record<TradingPermission, string> = {
  open: 'Open positions',
  close: 'Close positions',
  modify: 'Modify orders',
  hedge: 'Hedge existing exposure',
}
