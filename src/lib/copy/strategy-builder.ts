import { EMIL_SHORT, EMIL_STRATEGY_BUILDER } from '../brand'
import type { PageCopy } from './types'

export const strategyBuilder: PageCopy = {
  title: EMIL_STRATEGY_BUILDER,
  description: `Fifteen specialised agents take a strategy from market data to a ranked, backtested, risk-checked candidate — and nothing is deployed until a person approves it. Try the ${EMIL_STRATEGY_BUILDER} in a simulated demo.`,
  eyebrow: `Platform · ${EMIL_SHORT} · Strategy Builder`,
  heading: 'From an idea to an audited strategy.',
  lead: `The ${EMIL_STRATEGY_BUILDER} is a multi-agent strategy lab. Fifteen agents research, generate, backtest, stress and rank candidate strategies; a human approves what moves to paper trading; every step lands in a tamper-evident audit trail. The demo below runs on simulated accounts with live market quotes — no orders are placed.`,
  answers: {
    what: `A workspace of sixteen screens — dashboard, explore, pipeline, builder, strategies, portfolio, analytics, research, positions, markets, connections, risk, alerts, roles, audit and settings — around one fifteen-agent pipeline that turns market data into ranked strategy candidates.`,
    who: 'Quant and discretionary desks that want to see how a candidate strategy was produced before trusting it, and brokers who want to offer strategy research to clients without handing over an unreviewed bot.',
    why: 'Most strategy tools hide the path from data to signal. Here each agent reports what it did, the backtests carry costs and slippage, walk-forward and Monte Carlo checks filter what survives, and approval is a separate, recorded act.',
    connects: `Strategies are read out as MQL5, Pine Script, Python or cTrader code, and deploy to demo, paper or approved accounts on the Raptor stack — behind the same risk limits and kill switch as the rest of ${EMIL_SHORT}.`,
    next: 'Open the builder, run the agent pipeline, and read the audit trail it leaves behind. Then bring your own universe and risk limits to a demo.',
  },
  modules: [
    { title: 'Explore', body: 'Search stocks, currency pairs, indices and crypto worldwide, with a live quote and chart, then send an instrument to the agents or the builder.' },
    { title: 'Fifteen-agent pipeline', body: 'Market data, scanning, research, sentiment, fundamentals, regime detection, indicators, generation, backtesting, robustness, risk, ranking, voting, execution and monitoring — each lit up as it runs.' },
    { title: 'Builder', body: 'One strategy, four views: describe it in words, wire entry, exit, filter and sizing blocks visually, read the pseudocode, or export platform code.' },
    { title: 'Backtests and robustness', body: 'Equity curves, drawdown and trade statistics with cost and slippage modelled, plus walk-forward and Monte Carlo checks on every candidate.' },
    { title: 'Approval before deployment', body: 'Candidates wait for a person. Approve to paper trading, or reject with a reason — both are recorded.' },
    { title: 'Code export', body: 'Read a strategy as MQL5 for MetaTrader 5, Pine Script, Python or cTrader code, and review it before it goes anywhere.' },
    { title: 'Risk and the kill switch', body: 'Drawdown, exposure and position-size limits, with an emergency stop that is visible on every screen.' },
    { title: 'Roles and permissions', body: 'Thirteen roles, from administrator and risk manager to compliance officer and read-only auditor, against one permission matrix.' },
    { title: 'Audit trail', body: 'Every agent action, approval, deployment and risk event — timestamped, attributed, tamper-evident and exportable to CSV.' },
  ],
  ctaHeading: 'Run it against your own limits',
  ctaBody: `The demo shows the method. A working session configures the ${EMIL_STRATEGY_BUILDER} against your instruments, your costs and the risk limits you actually enforce.`,
  ctaActions: [
    { label: 'Request a demo', href: '/request-demo', variant: 'primary' },
    { label: `How ${EMIL_SHORT} works`, href: '/platform/emil', variant: 'ghost' },
  ],
  showRiskLine: true,
}
