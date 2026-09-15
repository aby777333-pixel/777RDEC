import type {
  DashboardData,
  MarketTick,
  Strategy,
  Position,
  ResearchPaper,
  AuditEvent,
  EquityPoint,
  Trade,
  Regime,
} from '../types';
import { ENGINES, backtest, createSpec, type EmilStrategySpec, type EngineId, type Timeframe } from '../kit';

export const SYMBOL_GROUPS: Record<string, string[]> = {
  Forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'NZDUSD', 'EURGBP'],
  Stocks: ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META'],
  Crypto: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'],
  Indian: ['NIFTY50', 'SENSEX', 'BANKNIFTY', 'FINNIFTY', 'NIFTYIT', 'RELIANCE', 'TCS', 'INFY', 'HDFC'],
  'India MCX': ['GOLDMCX', 'SILVERMCX', 'CRUDEMCX', 'NATGASMCX'],
  Metals: ['GOLD', 'SILVER', 'PLATINUM'],
  Energies: ['CRUDEOIL', 'NATURALGAS'],
  Indices: ['SPX500', 'DJI30', 'NASDAQ', 'FTSE100', 'DAX40', 'NIKKEI225'],
  CFDs: ['UK100', 'GER40', 'FRA40'],
};

const BASE_PRICE: Record<string, number> = {
  EURUSD: 1.085, GBPUSD: 1.27, USDJPY: 149.5, AUDUSD: 0.66, USDCAD: 1.36, NZDUSD: 0.61, EURGBP: 0.854,
  AAPL: 192, MSFT: 415, GOOGL: 168, TSLA: 245, AMZN: 178, NVDA: 880, META: 495,
  BTCUSDT: 67000, ETHUSDT: 3500, BNBUSDT: 590, SOLUSDT: 165, XRPUSDT: 0.52,
  NIFTY50: 22400, SENSEX: 73800, BANKNIFTY: 48200, FINNIFTY: 21050, NIFTYIT: 34200, RELIANCE: 2950, TCS: 3880, INFY: 1470, HDFC: 1680,
  GOLDMCX: 71800, SILVERMCX: 84500, CRUDEMCX: 6850, NATGASMCX: 195,
  GOLD: 2350, SILVER: 28.5, PLATINUM: 975, CRUDEOIL: 82.5, NATURALGAS: 2.35,
  SPX500: 5250, DJI30: 39800, NASDAQ: 18400, FTSE100: 8180, DAX40: 18100, NIKKEI225: 39500,
  UK100: 8180, GER40: 18100, FRA40: 8050,
};

export function groupFor(symbol: string): string {
  for (const [g, syms] of Object.entries(SYMBOL_GROUPS)) {
    if (syms.includes(symbol)) return g;
  }
  return 'Other';
}

export function mockTicks(): MarketTick[] {
  return Object.entries(BASE_PRICE).map(([symbol, base]) => {
    const change = (Math.random() - 0.5) * 4;
    const price = base * (1 + change / 100);
    const digits = base < 5 ? 4 : 2;
    return {
      symbol,
      price: Number(price.toFixed(digits)),
      prev_close: Number(base.toFixed(digits)),
      change_pct: Number(change.toFixed(2)),
      group: groupFor(symbol),
      time: new Date().toISOString(),
    };
  });
}

export function mockCandles(symbol: string, bars = 200) {
  const base = BASE_PRICE[symbol] ?? 100;
  const digits = base < 5 ? 4 : 2;
  const vol = base * 0.01;
  let price = base;
  const out = [];
  const now = Date.now();
  for (let i = bars; i > 0; i--) {
    const open = price;
    const move = (Math.random() - 0.5) * vol * 2;
    const close = Math.max(open + move, 0.0001);
    const high = Math.max(open, close) + Math.random() * vol;
    const low = Math.min(open, close) - Math.random() * vol;
    price = close;
    out.push({
      time: new Date(now - i * 3600_000).toISOString(),
      open: Number(open.toFixed(digits)),
      high: Number(high.toFixed(digits)),
      low: Number(low.toFixed(digits)),
      close: Number(close.toFixed(digits)),
      volume: Number((Math.random() * 10000).toFixed(2)),
    });
  }
  return out;
}

export function mockEquityCurve(seed = 10000): EquityPoint[] {
  const out: EquityPoint[] = [];
  let eq = seed;
  let bench = seed;
  let peak = seed;
  const now = Date.now();
  for (let i = 0; i < 180; i++) {
    eq *= 1 + (Math.random() - 0.45) * 0.02;
    bench *= 1 + (Math.random() - 0.48) * 0.012;
    peak = Math.max(peak, eq);
    out.push({
      time: new Date(now - (180 - i) * 86400_000).toISOString(),
      equity: Number(eq.toFixed(2)),
      benchmark: Number(bench.toFixed(2)),
      drawdown: Number((((eq - peak) / peak) * 100).toFixed(2)),
    });
  }
  return out;
}

export function mockTrades(n = 40): Trade[] {
  const out: Trade[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const pnl = Number(((Math.random() - 0.42) * 400).toFixed(2));
    out.push({
      entry_time: new Date(now - (n - i) * 86400_000).toISOString(),
      exit_time: new Date(now - (n - i) * 86400_000 + 3600_000 * 6).toISOString(),
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      entry: Number((100 + Math.random() * 20).toFixed(2)),
      exit: Number((100 + Math.random() * 20).toFixed(2)),
      pnl,
      return_pct: Number((pnl / 100).toFixed(2)),
    });
  }
  return out;
}

const AGENT_NAMES = [
  'MarketDataAgent', 'ResearchAgent', 'SentimentAgent', 'RegimeDetectionAgent',
  'TechnicalIndicatorAgent', 'StrategyGenerationAgent', 'BacktestingAgent',
  'RiskCheckAgent', 'RankingAgent', 'VotingAgent',
];

// Demo strategies, each on one of EMIL Trade's engines, so "Details", the EA
// code, "Open in Builder" and "Attach to EMIL Trade" all act on a real,
// runnable definition. Their numbers are real backtests of that definition —
// on simulated candles, and labelled as such.
const STRAT_TEMPLATES: {
  id: string;
  name: string;
  engine: EngineId;
  params?: Record<string, number>;
  symbols: string[];
  timeframe: Timeframe;
  risk_level: string;
  best_regime: string;
  worst_regime: string;
}[] = [
  { id: 'demo-ema-trend-regime', name: 'Trend Rider EMA 20/50', engine: 'trend_reversal', symbols: ['EURUSD', 'BTCUSDT'], timeframe: '1H', risk_level: 'Medium', best_regime: 'Trending', worst_regime: 'Ranging' },
  { id: 'demo-bollinger-macd', name: 'Band Fade with MACD Turn', engine: 'boll_macd', symbols: ['EURUSD', 'GBPUSD'], timeframe: '1H', risk_level: 'Low', best_regime: 'Ranging', worst_regime: 'Trending' },
  { id: 'demo-rsi-macd', name: 'RSI + MACD Momentum', engine: 'rsi_macd', symbols: ['NVDA', 'ETHUSDT'], timeframe: '4H', risk_level: 'High', best_regime: 'Volatile', worst_regime: 'Quiet' },
  { id: 'demo-ssl-breakout', name: 'SSL Channel Breakout', engine: 'ssl', symbols: ['GOLD', 'CRUDEOIL'], timeframe: '1H', risk_level: 'Medium', best_regime: 'Breakout', worst_regime: 'Choppy' },
  { id: 'demo-ichimoku-cloud', name: 'Ichimoku Cloud Trend', engine: 'ichimoku', symbols: ['SPX500', 'NASDAQ'], timeframe: '4H', risk_level: 'Medium', best_regime: 'Trending', worst_regime: 'Ranging' },
  { id: 'demo-ema-pullback', name: 'EMA 9/21 Pullback', engine: 'ema_pullback', symbols: ['MSFT', 'GOOGL'], timeframe: '1H', risk_level: 'Low', best_regime: 'Trending', worst_regime: 'Choppy' },
];

const STATUSES = ['PENDING', 'PAPER', 'APPROVED', 'REJECTED', 'PENDING', 'PAPER'];

/** Deterministic simulated candles, so a demo strategy's numbers do not change on every refresh. */
function seededCandles(symbol: string, bars: number, seed: number) {
  let s = seed >>> 0;
  const rand = () => {
    s = (Math.imul(s ^ (s >>> 15), 2246822507) + 0x9e3779b9) >>> 0;
    return ((s ^ (s >>> 13)) >>> 0) / 4294967296;
  };
  const base = BASE_PRICE[symbol] ?? 100;
  const vol = 0.006;
  let price = base;
  let drift = 0;
  const start = Date.UTC(2026, 0, 1) / 1000;
  const out: { time: number; open: number; high: number; low: number; close: number }[] = [];
  for (let i = 0; i < bars; i++) {
    if (i % 70 === 0) drift = (rand() - 0.5) * vol * 0.5;
    const open = price;
    const close = Math.max(open * (1 + drift + (rand() - 0.5) * vol), 0.0001);
    out.push({ time: start + i * 3600, open, high: Math.max(open, close) * (1 + rand() * vol * 0.5), low: Math.min(open, close) * (1 - rand() * vol * 0.5), close });
    price = close;
  }
  return out;
}

function demoSpec(t: (typeof STRAT_TEMPLATES)[number]): EmilStrategySpec {
  const spec = createSpec({ id: t.id, engine: t.engine, name: t.name, app: 'EMIL Strategy Builder demo', symbols: t.symbols, timeframe: t.timeframe, now: new Date('2026-09-01T00:00:00Z') });
  return t.params ? { ...spec, params: { ...spec.params, ...t.params } } : spec;
}

function demoBacktest(spec: EmilStrategySpec, seed: number) {
  const r = backtest(spec, seededCandles(spec.symbols[0], 700, seed));
  const iso = (t: number) => new Date(t * 1000).toISOString();
  let peak = r.equity[0] ?? 10000;
  const equity_curve: EquityPoint[] = r.equity.map((equity, i) => {
    peak = Math.max(peak, equity);
    return {
      time: iso(i === 0 ? (r.trades[0]?.entryTime ?? 0) : r.trades[i - 1].exitTime),
      equity: Number(equity.toFixed(2)),
      drawdown: Number((((equity - peak) / peak) * 100).toFixed(2)),
    };
  });
  const trades: Trade[] = r.trades.map((t) => ({
    entry_time: iso(t.entryTime),
    exit_time: iso(t.exitTime),
    side: t.direction === 'BUY' ? 'buy' : 'sell',
    entry: t.entry,
    exit: t.exit,
    pnl: Number(t.pnl.toFixed(2)),
    return_pct: Number(t.retPct.toFixed(2)),
  }));
  const metrics = {
    total_return_pct: Number(((r.netProfit / 10000) * 100).toFixed(2)),
    max_drawdown_pct: r.maxDrawdownPct,
    sharpe: r.sharpe,
    win_rate_pct: r.winRate,
    profit_factor: r.profitFactor,
    avg_trade: r.numTrades ? Number((r.netProfit / r.numTrades).toFixed(2)) : 0,
    num_trades: r.numTrades,
    final_equity: Number((r.equity[r.equity.length - 1] ?? 10000).toFixed(2)),
    initial_capital: 10000,
  };
  return { metrics, equity_curve, trades };
}

function votesFor(): Strategy['votes'] {
  return AGENT_NAMES.slice(0, 9).map((agent) => {
    const r = Math.random();
    const vote = r > 0.55 ? 'yes' : r > 0.25 ? 'abstain' : 'no';
    return {
      agent,
      vote,
      confidence: Number((0.4 + Math.random() * 0.6).toFixed(2)),
      reasoning: `${agent} evaluated the signal quality and risk-adjusted return profile.`,
    };
  });
}

let demoStrategies: Strategy[] | null = null;

export function mockStrategies(): Strategy[] {
  if (demoStrategies) return demoStrategies;
  demoStrategies = STRAT_TEMPLATES.map((t, i) => {
    const spec = demoSpec(t);
    const engine = ENGINES[t.engine];
    const rules = engine.rules(spec.params);
    return {
      id: i + 1,
      name: t.name,
      description: engine.summary,
      status: STATUSES[i % STATUSES.length],
      mode: 'demo',
      spec,
      config: {
        markets: t.symbols,
        symbol: t.symbols[0],
        timeframe: t.timeframe,
        sl_atr: spec.risk.slAtrMult,
        tp_atr: spec.risk.tpAtrMult,
        entry_logic: rules.long,
        exit_logic: rules.short,
        risk_level: t.risk_level,
        best_regime: t.best_regime,
        worst_regime: t.worst_regime,
        explanation: `Long when ${rules.long.charAt(0).toLowerCase()}${rules.long.slice(1)} Short when ${rules.short.charAt(0).toLowerCase()}${rules.short.slice(1)} Best suited to ${t.best_regime.toLowerCase()} markets. Backtest shown is on simulated candles.`,
      },
      created_at: new Date(Date.now() - i * 3600_000).toISOString(),
      approved_at: null,
      approved_by: null,
      backtest: demoBacktest(spec, 17 + i * 31),
      votes: votesFor(),
    };
  });
  return demoStrategies;
}

export function mockPositions(): Position[] {
  const syms = ['EURUSD', 'BTCUSDT', 'AAPL', 'GOLD', 'NIFTY50'];
  return syms.map((symbol, i) => {
    const base = BASE_PRICE[symbol] ?? 100;
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const entry = base * (1 + (Math.random() - 0.5) * 0.01);
    const current = base * (1 + (Math.random() - 0.5) * 0.02);
    const dir = side === 'buy' ? 1 : -1;
    const qty = Number((Math.random() * 5 + 0.5).toFixed(2));
    return {
      id: i + 1,
      strategy_id: (i % 4) + 1,
      symbol,
      side,
      qty,
      entry_price: Number(entry.toFixed(4)),
      current_price: Number(current.toFixed(4)),
      pnl: Number(((current - entry) * dir * qty * 100).toFixed(2)),
      status: 'open',
      opened_at: new Date(Date.now() - i * 5400_000).toISOString(),
    };
  });
}




export function mockResearch(): ResearchPaper[] {
  const papers = [
    { title: 'Time-Series Momentum Across Asset Classes', authors: 'Moskowitz, Ooi, Pedersen', abstract: 'Documents significant time-series momentum in equity index, currency, commodity, and bond futures, persistent for 1-12 months.', insights: ['12-month lookback captures persistent trends', 'Works across all liquid asset classes', 'Low correlation to traditional factors'], relevance: 0.94 },
    { title: 'Mean Reversion in Short-Horizon Equity Returns', authors: 'Lehmann', abstract: 'Short-term reversal effect where past losers outperform winners over weekly horizons.', insights: ['Weekly reversals exploit overreaction', 'Strongest in high-volatility names', 'Requires tight risk control'], relevance: 0.81 },
    { title: 'Volatility Regime Switching for Strategy Allocation', authors: 'Ang, Bekaert', abstract: 'Regime-switching models improve risk-adjusted returns by adapting exposure to detected volatility states.', insights: ['Detect high/low vol regimes', 'Scale exposure inversely to volatility', 'Improves Calmar ratio materially'], relevance: 0.88 },
    { title: 'Trend Following with Managed Futures', authors: 'Hurst, Ooi, Pedersen', abstract: 'A century of evidence that simple trend-following delivers positive returns across market crises.', insights: ['Crisis alpha in tail events', 'Diversify across timeframes', 'Robust to parameter choice'], relevance: 0.9 },
    { title: 'The Profitability of Technical Trading Rules', authors: 'Brock, Lakonishok, LeBaron', abstract: 'Moving-average and range breakout rules show predictive power inconsistent with random-walk pricing.', insights: ['MA rules add value net of costs', 'Breakouts precede volatility', 'Combine filters to reduce whipsaws'], relevance: 0.76 },
  ];
  return papers.map((p, i) => ({
    id: i + 1,
    title: p.title,
    authors: p.authors,
    abstract: p.abstract,
    insights: p.insights,
    relevance_score: p.relevance,
    created_at: new Date(Date.now() - i * 86400_000).toISOString(),
  }));
}

export function mockEvents(): AuditEvent[] {
  const events = [
    { event_type: 'pipeline_started', message: 'AI agent pipeline started — 15 agents engaged.' },
    { event_type: 'agent_complete', message: 'MarketDataAgent fetched OHLCV across global venues.' },
    { event_type: 'strategy_generated', message: 'StrategyGenerationAgent produced 6 candidate strategies.' },
    { event_type: 'backtest_complete', message: 'BacktestingAgent completed 6 backtests.' },
    { event_type: 'risk_check', message: 'RiskCheckAgent validated 4/6 strategies against risk limits.' },
    { event_type: 'strategy_approved', message: "Strategy 'Trend Rider EMA 20/50' approved; moved to PAPER trading." },
    { event_type: 'position_opened', message: 'Opened BUY 1.2 BTCUSDT @ 67,120.' },
    { event_type: 'market_tick', message: 'EURUSD ticked +0.12%.' },
  ];
  return events.map((e, i) => ({
    id: i + 1,
    event_type: e.event_type,
    message: e.message,
    created_at: new Date(Date.now() - i * 300_000).toISOString(),
  }));
}

export const mockRegime: Regime = {
  regime: 'Trending',
  confidence: 0.72,
  description: 'Markets are exhibiting sustained directional momentum with above-average volatility. Trend-following strategies are favored; mean-reversion setups carry elevated risk.',
};

export function mockDashboard(): DashboardData {
  const strategies = mockStrategies();
  const positions = mockPositions();
  return {
    summary: {
      total_strategies: strategies.length,
      pending_approval: strategies.filter((s) => s.status === 'PENDING').length,
      paper_trading: strategies.filter((s) => s.status === 'PAPER').length,
      open_positions: positions.length,
      total_pnl: Number(positions.reduce((a, p) => a + p.pnl, 0).toFixed(2)),
    },
    regime: mockRegime,
    recent_strategies: strategies,
    open_positions: positions,
    market_ticks: mockTicks().slice(0, 12),
    recent_events: mockEvents(),
    agents: AGENT_NAMES.map((name) => ({ name, status: 'idle' })),
  };
}
