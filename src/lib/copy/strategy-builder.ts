import { EMIL_SHORT, EMIL_STRATEGY_BUILDER, EMIL_TRADE } from '../brand'
import type { PageCopy } from './types'

export const strategyBuilder: PageCopy = {
  title: EMIL_STRATEGY_BUILDER,
  description: `Build a strategy on ${EMIL_TRADE}'s own engines, backtest it on live market data, download it as an MQL5 Expert Advisor or a Pine Script strategy, attach it to ${EMIL_TRADE}, and send it to ${EMIL_SHORT} for review.`,
  eyebrow: `Platform · ${EMIL_SHORT} · Strategy Builder`,
  heading: 'One strategy. Every surface.',
  lead: `The ${EMIL_STRATEGY_BUILDER} defines a strategy once, on the same engines ${EMIL_TRADE} runs. The rule you backtest here is the rule in the MQL5 and Pine Script files you download, the EA you attach in ${EMIL_TRADE}, and the blueprint ${EMIL_SHORT} studies. The demo below runs on simulated accounts with live market quotes — no orders are placed.`,
  answers: {
    what: `A strategy workspace built around ${EMIL_TRADE}'s eleven EA engines — EMA pullback, RSI and MACD momentum, Parabolic SAR, Bollinger reversion, Ichimoku, SSL channel, engulfing patterns and more — with every input editable, every rule written out in plain language, and a multi-agent research pipeline around it.`,
    who: 'Traders who want the strategy they design to be the strategy that runs, on every platform they use, and desks that want each strategy to reach research review before anyone trades it.',
    why: 'A strategy rewritten for each platform drifts: the backtest, the EA and the chart indicator end up disagreeing. Here one definition produces all of them, and the generated code uses the same indicator formulas as the engine that runs it.',
    connects: `Attach sends the strategy to ${EMIL_TRADE}'s EA library with its inputs and stop and target already set. Downloads produce an MQL5 Expert Advisor for MetaTrader 5 and a Pine Script v5 strategy for TradingView. Saving sends it to ${EMIL_SHORT}'s Strategy Lab as research, where it is validated and approved by a person before it can go further.`,
    next: `Open the builder, pick an engine, run a backtest on live candles, and attach the result to ${EMIL_TRADE}. Then bring your own instruments and risk limits to a demo.`,
  },
  modules: [
    { title: `${EMIL_TRADE}'s engines`, body: `Eleven engines, each with the same inputs and defaults as in ${EMIL_TRADE}. What you configure is exactly what the ${EMIL_TRADE} runtime evaluates.` },
    { title: 'Rules in plain language', body: 'Every engine states its long and short conditions with your inputs filled in, alongside readable pseudocode of how it trades.' },
    { title: 'Backtest on live candles', body: `Replays the strategy the way ${EMIL_TRADE} trades it — one decision per closed bar, ATR stop and target. Costs and slippage are not modelled, and simulated data is labelled when live data is unavailable.` },
    { title: 'MQL5 and Pine Script', body: 'Download a MetaTrader 5 Expert Advisor or a TradingView strategy generated from the same definition, with the same inputs and indicator formulas.' },
    { title: `Attach to ${EMIL_TRADE}`, body: `One click opens ${EMIL_TRADE}, which checks the strategy, asks you to confirm, and adds it to your EA library. Attaching it to a chart still goes through ${EMIL_TRADE}'s risk disclaimer.` },
    { title: `Sent to ${EMIL_SHORT} for review`, body: `Every saved strategy reaches ${EMIL_SHORT}'s Strategy Lab as research. It moves forward only through validation and a human approval, and never trades by itself.` },
    { title: 'Multi-agent pipeline', body: 'Market data, scanning, research, regime detection, generation, backtesting, risk, ranking and voting agents, shown step by step in the demo.' },
    { title: 'Risk and the kill switch', body: 'Direction, lot, ATR stop and target on every strategy, with an emergency stop that is visible on every screen.' },
    { title: 'Audit trail', body: 'Agent actions, approvals, deployments and risk events — timestamped, attributed and exportable to CSV.' },
  ],
  ctaHeading: 'Run it against your own limits',
  ctaBody: `The demo shows the method. A working session configures the ${EMIL_STRATEGY_BUILDER} against your instruments, your costs and the risk limits you actually enforce.`,
  ctaActions: [
    { label: 'Request a demo', href: '/request-demo', variant: 'primary' },
    { label: `How ${EMIL_SHORT} works`, href: '/platform/emil', variant: 'ghost' },
  ],
  showRiskLine: true,
}
