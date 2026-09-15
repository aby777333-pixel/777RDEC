import { useEffect, useMemo, useState } from 'react';
import { Blocks, MessageSquare, FileCode2, Code2, LineChart, Plus, Wand2, Trash2, FolderOpen, Loader2, Play } from 'lucide-react';
import { Card, SectionTitle, Badge, fmtMoney } from '../components/ui';
import { EaViewer } from '../components/EaViewer';
import { StrategyActions } from '../components/StrategyActions';
import { EquityCurveChart } from '../components/BacktestCharts';
import { useStore } from '../store';
import { api } from '../api/client';
import { APP_TITLE } from '../brand';
import { removeFromLibrary, useLibrary } from '../strategyLibrary';
import {
  ENGINES,
  ENGINE_IDS,
  DIRECTIONS,
  LIMITS,
  TIMEFRAMES,
  backtest,
  createSpec,
  defaultParams,
  toPseudocode,
  validateSpec,
  type BacktestResult,
  type EmilStrategySpec,
  type EngineId,
  type Timeframe,
} from '../kit';

type View = 'setup' | 'describe' | 'pseudo' | 'code' | 'backtest';

const DRAFT_KEY = 'emil_sb_draft_v1';

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `sb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function freshSpec(engine: EngineId = 'trend_reversal', symbols = ['EURUSD']): EmilStrategySpec {
  return createSpec({ id: newId(), engine, name: `${ENGINES[engine].label} strategy`, app: APP_TITLE, symbols });
}

function loadDraft(): EmilStrategySpec | null {
  try {
    const result = validateSpec(JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'));
    return result.ok ? result.spec : null;
  } catch {
    return null;
  }
}

/** Picks the engine whose rule a plain-language idea describes. Suggestion only. */
function suggestFromText(text: string): { engine: EngineId; timeframe?: Timeframe; symbols: string[] } {
  const t = text.toLowerCase();
  const has = (...words: string[]) => words.some((w) => t.includes(w));
  let engine: EngineId = 'trend_reversal';
  if (has('engulf', 'candlestick pattern', 'candle pattern')) engine = 'pattern';
  else if (has('ichimoku', 'cloud', 'tenkan', 'kijun')) engine = 'ichimoku';
  else if (has('parabolic', ' sar')) engine = 'sar_flip';
  else if (has('bollinger', 'band', 'mean reversion', 'mean-reversion', 'fade')) engine = 'boll_macd';
  else if (has('pullback', 'pull back', 'retrace')) engine = 'ema_pullback';
  else if (has('macd') && has('rsi')) engine = 'rsi_macd';
  else if (has('rsi')) engine = 'rsi_adaptive';
  else if (has('ssl', 'channel', 'breakout', 'break out')) engine = 'ssl';
  else if (has('kalman', 'smoothing')) engine = 'kalman';
  else if (has('slope', 'linear regression', 'linreg')) engine = 'linreg';
  const tfMatch = t.match(/\b(1m|5m|15m|30m|1h|4h|1d)\b/) || (has('daily') ? ['', '1d'] : has('hourly') ? ['', '1h'] : null);
  const timeframe = tfMatch ? (TIMEFRAMES.find((tf) => tf.toLowerCase() === tfMatch[1]) as Timeframe | undefined) : undefined;
  const aliases: Record<string, string> = { gold: 'XAUUSD', silver: 'XAGUSD', bitcoin: 'BTCUSDT', ethereum: 'ETHUSDT', 'nifty 50': 'NIFTY50', nifty: 'NIFTY50', 'eur/usd': 'EURUSD', 'gbp/usd': 'GBPUSD' };
  const symbols = new Set<string>();
  for (const [alias, symbol] of Object.entries(aliases)) if (t.includes(alias)) symbols.add(symbol);
  for (const token of text.match(/\b[A-Z]{3,10}(?:USDT|USD)?\b/g) ?? []) if (/^[A-Z]{6,10}$/.test(token)) symbols.add(token);
  return { engine, timeframe, symbols: Array.from(symbols).slice(0, LIMITS.symbolsMax) };
}

export default function Builder() {
  const seed = useStore((s) => s.builderSeed);
  const setSeed = useStore((s) => s.setBuilderSeed);
  const pushToast = useStore((s) => s.pushToast);
  const library = useLibrary();

  const [spec, setSpec] = useState<EmilStrategySpec>(() => loadDraft() ?? freshSpec());
  const [symbolsText, setSymbolsText] = useState(() => spec.symbols.join(', '));
  const [view, setView] = useState<View>('setup');
  const [idea, setIdea] = useState('Trend-following on EURUSD and gold, 1H. Stay with the trend while the fast EMA is above the slow EMA, with ATR stops.');

  // Open whatever another screen handed over (a strategy, or just a symbol).
  useEffect(() => {
    if (!seed) return;
    const next = seed.spec ?? freshSpec('trend_reversal', seed.symbol ? [seed.symbol] : ['EURUSD']);
    setSpec(next);
    setSymbolsText(next.symbols.join(', '));
    setView('setup');
    setSeed(null);
  }, [seed, setSeed]);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(spec));
    } catch {
      /* ignore */
    }
  }, [spec]);

  const validation = useMemo(() => validateSpec(spec), [spec]);
  const engine = ENGINES[spec.engine];
  const update = (patch: Partial<EmilStrategySpec>) =>
    setSpec((s) => ({ ...s, ...patch, source: { ...s.source, updatedAt: new Date().toISOString() } }));

  const defaultName = (id: EngineId) => `${ENGINES[id].label} strategy`;
  // Switching engine renames the strategy only while it still carries the
  // automatic name; a name the user typed is kept.
  const chooseEngine = (id: EngineId) =>
    update({
      engine: id,
      params: defaultParams(id),
      description: ENGINES[id].summary,
      ...(spec.name === defaultName(spec.engine) ? { name: defaultName(id) } : {}),
    });

  const openSaved = (saved: EmilStrategySpec) => {
    setSpec(saved);
    setSymbolsText(saved.symbols.join(', '));
    setView('setup');
  };

  const startNew = () => {
    const next = freshSpec();
    setSpec(next);
    setSymbolsText(next.symbols.join(', '));
    setView('setup');
  };

  const views: { key: View; label: string; icon: React.ReactNode }[] = [
    { key: 'setup', label: 'Engine & inputs', icon: <Blocks size={13} /> },
    { key: 'describe', label: 'Describe an idea', icon: <MessageSquare size={13} /> },
    { key: 'pseudo', label: 'Pseudocode', icon: <FileCode2 size={13} /> },
    { key: 'code', label: 'MQL5 & Pine', icon: <Code2 size={13} /> },
    { key: 'backtest', label: 'Backtest', icon: <LineChart size={13} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold">Strategy Builder</h2>
          <p className="text-sm text-subtext max-w-2xl">
            Build on EMIL Trade&apos;s own engines, so what you backtest, download and attach is the same strategy EMIL Trade
            runs. Every saved strategy is also sent to EMIL for review.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="input !w-64"
            value={spec.name}
            maxLength={LIMITS.nameMax}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="Strategy name"
            aria-label="Strategy name"
          />
          <button className="btn-ghost shrink-0" onClick={startNew} title="Start a new strategy">
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2 text-xs text-subtext">
            <Badge status={validation.ok ? 'complete' : 'PENDING'}>{validation.ok ? 'Ready' : 'Needs attention'}</Badge>
            <span>
              {engine.label} · {spec.timeframe} · {spec.symbols.join(', ') || 'no symbols'} · v{spec.version}
            </span>
          </div>
        </div>
        <StrategyActions spec={spec} onSaved={(saved) => setSpec(saved)} />
      </Card>

      <div className="flex gap-1 flex-wrap">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              view === v.key ? 'bg-primary/15 text-primary border border-primary/40' : 'text-subtext border border-border hover:text-text'
            }`}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {view === 'setup' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Card className="xl:col-span-2">
            <SectionTitle right={<span className="text-[10px] text-subtext">{ENGINE_IDS.length} engines</span>}>Engine</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ENGINE_IDS.map((id) => (
                <button
                  key={id}
                  onClick={() => chooseEngine(id)}
                  className={`text-left glass !rounded-lg p-2.5 border transition-colors ${
                    spec.engine === id ? 'border-primary/60 bg-primary/5' : 'border-border hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold">{ENGINES[id].label}</span>
                    <span className="text-[9px] uppercase text-subtext">{ENGINES[id].family}</span>
                  </div>
                  <p className="text-[11px] text-subtext mt-1 leading-snug">{ENGINES[id].summary}</p>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {engine.inputs.map((input) => {
                const value = spec.params[input.name];
                return (
                  <label key={input.name} className="text-xs">
                    <span className="text-subtext block mb-1">
                      {input.label} <span className="font-mono text-[10px]">({input.name})</span>
                    </span>
                    <input
                      className="input"
                      type="number"
                      min={input.min}
                      max={input.max}
                      step={input.step}
                      value={Number.isFinite(value) ? value : ''}
                      onChange={(e) => update({ params: { ...spec.params, [input.name]: e.target.valueAsNumber } })}
                    />
                  </label>
                );
              })}
            </div>
            <div className="mt-3 glass !rounded-lg p-3 border-l-2 border-primary/50 text-[11px] text-subtext leading-relaxed">
              <div>
                <span className="text-success font-semibold">Long:</span> {engine.rules(spec.params).long}
              </div>
              <div className="mt-1">
                <span className="text-danger font-semibold">Short:</span> {engine.rules(spec.params).short}
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <SectionTitle>Market &amp; risk</SectionTitle>
              <div className="flex flex-col gap-3 text-xs">
                <label>
                  <span className="text-subtext block mb-1">Symbols (comma separated)</span>
                  <input
                    className="input font-mono"
                    value={symbolsText}
                    onChange={(e) => {
                      setSymbolsText(e.target.value);
                      update({ symbols: e.target.value.split(/[,\s]+/).map((s) => s.trim().toUpperCase()).filter(Boolean) });
                    }}
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label>
                    <span className="text-subtext block mb-1">Timeframe</span>
                    <select className="input" value={spec.timeframe} onChange={(e) => update({ timeframe: e.target.value as Timeframe })}>
                      {TIMEFRAMES.map((tf) => (
                        <option key={tf} value={tf}>{tf}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="text-subtext block mb-1">Direction</span>
                    <select
                      className="input"
                      value={spec.risk.direction}
                      onChange={(e) => update({ risk: { ...spec.risk, direction: e.target.value as (typeof DIRECTIONS)[number] } })}
                    >
                      <option value="both">Long &amp; short</option>
                      <option value="long">Long only</option>
                      <option value="short">Short only</option>
                    </select>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ['lot', 'Lot', LIMITS.lot, 0.01],
                      ['slAtrMult', 'Stop × ATR', LIMITS.slAtrMult, 0.1],
                      ['tpAtrMult', 'Target × ATR', LIMITS.tpAtrMult, 0.1],
                    ] as const
                  ).map(([key, label, range, step]) => (
                    <label key={key}>
                      <span className="text-subtext block mb-1">{label}</span>
                      <input
                        className="input"
                        type="number"
                        min={range.min}
                        max={range.max}
                        step={step}
                        value={Number.isFinite(spec.risk[key]) ? spec.risk[key] : ''}
                        onChange={(e) => update({ risk: { ...spec.risk, [key]: e.target.valueAsNumber } })}
                      />
                    </label>
                  ))}
                </div>
                <label>
                  <span className="text-subtext block mb-1">Description</span>
                  <textarea
                    className="input !h-20 resize-none"
                    maxLength={LIMITS.descriptionMax}
                    value={spec.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </label>
                {!validation.ok && (
                  <ul className="text-[11px] text-warning list-disc pl-4 space-y-0.5">
                    {validation.errors.slice(0, 5).map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>

            <Card>
              <SectionTitle right={<span className="text-[10px] text-subtext">{library.length} saved</span>}>My strategies</SectionTitle>
              {library.length === 0 ? (
                <p className="text-xs text-subtext">Nothing saved yet. Saving keeps a strategy in this browser and sends it to EMIL.</p>
              ) : (
                <div className="flex flex-col gap-1 max-h-64 overflow-auto">
                  {library.map((saved) => (
                    <div key={saved.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-border/40 last:border-0">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{saved.name}</div>
                        <div className="text-[10px] text-subtext truncate">
                          {ENGINES[saved.engine].label} · {saved.timeframe} · v{saved.version}
                        </div>
                      </div>
                      <button className="text-subtext hover:text-primary p-1" title="Open" onClick={() => openSaved(saved)}>
                        <FolderOpen size={14} />
                      </button>
                      <button
                        className="text-subtext hover:text-danger p-1"
                        title="Remove from this browser"
                        onClick={() => {
                          removeFromLibrary(saved.id);
                          pushToast({ type: 'warning', message: `Removed "${saved.name}" from this browser.` });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {view === 'describe' && (
        <Card>
          <SectionTitle right={<Wand2 size={14} className="text-primary" />}>Describe an idea</SectionTitle>
          <textarea className="input !h-32 text-xs leading-relaxed resize-none" value={idea} onChange={(e) => setIdea(e.target.value)} />
          <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
            <p className="text-[11px] text-subtext max-w-xl">
              Picks the engine whose rule matches your description, and any timeframe and symbols you name. It is a starting
              point: check the inputs and the long and short rules before you save.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                const s = suggestFromText(idea);
                const symbols = s.symbols.length ? s.symbols : spec.symbols;
                update({
                  engine: s.engine,
                  params: defaultParams(s.engine),
                  description: ENGINES[s.engine].summary,
                  timeframe: s.timeframe ?? spec.timeframe,
                  symbols,
                  ...(spec.name === defaultName(spec.engine) ? { name: defaultName(s.engine) } : {}),
                });
                setSymbolsText(symbols.join(', '));
                setView('setup');
                pushToast({ type: 'info', message: `Suggested the ${ENGINES[s.engine].label} engine — review the inputs.` });
              }}
            >
              <Wand2 size={14} /> Suggest a setup
            </button>
          </div>
        </Card>
      )}

      {view === 'pseudo' && (
        <Card>
          <SectionTitle>Pseudocode</SectionTitle>
          <pre className="rounded-lg border border-border bg-bg p-3 text-xs font-mono whitespace-pre-wrap leading-relaxed">{toPseudocode(spec)}</pre>
        </Card>
      )}

      {view === 'code' && (
        <Card>
          {validation.ok ? <EaViewer spec={validation.spec} /> : <p className="text-sm text-warning">{validation.errors[0]}</p>}
        </Card>
      )}

      {view === 'backtest' && <BacktestPanel spec={spec} valid={validation.ok} />}
    </div>
  );
}

function BacktestPanel({ spec, valid }: { spec: EmilStrategySpec; valid: boolean }) {
  const [symbol, setSymbol] = useState(spec.symbols[0] ?? 'EURUSD');
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<{ result: BacktestResult; live: boolean; bars: number; symbol: string } | null>(null);

  useEffect(() => {
    if (!spec.symbols.includes(symbol) && spec.symbols[0]) setSymbol(spec.symbols[0]);
  }, [spec.symbols, symbol]);

  const run = async () => {
    setRunning(true);
    try {
      const { candles, live } = await api.marketCandles(symbol, spec.timeframe, 500);
      const bars = candles.map((c) => ({ time: Date.parse(c.time) / 1000, open: c.open, high: c.high, low: c.low, close: c.close }));
      setOutcome({ result: backtest(spec, bars), live, bars: bars.length, symbol });
    } finally {
      setRunning(false);
    }
  };

  const equity = (outcome?.result.equity ?? []).map((value, i) => ({ time: String(i), equity: Number(value.toFixed(2)) }));
  return (
    <Card>
      <SectionTitle
        right={
          <div className="flex items-center gap-2">
            <select className="input !w-36 !py-1" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {spec.symbols.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button className="btn-primary !py-1" onClick={run} disabled={!valid || running}>
              {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />} Run
            </button>
          </div>
        }
      >
        Backtest
      </SectionTitle>
      <p className="text-[11px] text-subtext mb-3">
        Replays the strategy the way EMIL Trade trades it: one decision per closed {spec.timeframe} bar, a position only when
        the regime changes, ATR stop and target, fixed notional per trade. No costs or slippage are modelled.
      </p>
      {!outcome ? (
        <p className="text-xs text-subtext">Choose a symbol and run.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <div className={`text-[11px] font-semibold ${outcome.live ? 'text-success' : 'text-warning'}`}>
            {outcome.live
              ? `Live ${outcome.symbol} ${spec.timeframe} candles from the market API · ${outcome.bars} bars`
              : `Market data unavailable for ${outcome.symbol} ${spec.timeframe} — simulated bars shown, not market results`}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <Stat label="Net P&L" value={fmtMoney(outcome.result.netProfit)} />
            <Stat label="Trades" value={String(outcome.result.numTrades)} />
            <Stat label="Win rate" value={`${outcome.result.winRate}%`} />
            <Stat label="Profit factor" value={String(outcome.result.profitFactor)} />
            <Stat label="Max drawdown" value={`${outcome.result.maxDrawdownPct}%`} />
            <Stat label="Avg trade" value={`${outcome.result.avgTradePct}%`} />
          </div>
          {equity.length > 1 && <EquityCurveChart data={equity} />}
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass !rounded-lg p-2 border border-border">
      <div className="text-[10px] text-subtext uppercase">{label}</div>
      <div className="text-sm font-bold font-mono">{value}</div>
    </div>
  );
}
