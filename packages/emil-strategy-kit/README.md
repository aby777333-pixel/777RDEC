# EMIL Strategy Kit

The one definition of a trading strategy in the EMIL universe. A strategy is an
**EMIL Strategy Spec**: an EMIL Trade engine, its inputs, a timeframe, symbols
and risk (fixed lot, ATR stop and target, direction).

| Who | Uses the kit to |
| --- | --- |
| EMIL Strategy Builder (`apps/emil-strategy-builder`) | create and edit specs, backtest them, generate MQL5 and Pine Script, attach to EMIL Trade, send to EMIL |
| 777 Raptor site (`src/app/api/emil/teach`) | validate a spec before forwarding it to the Cockpit |
| EMIL Trade (`emil-trade/src/lib/emil-strategy-kit` in the EMIL repo) | validate an imported spec and turn it into a custom EA |
| EMIL Cockpit (`lib/emil-strategy-kit` in the EMIL repo) | validate a spec and store it as a StrategyBlueprint |

## Source of truth and copies

**This folder is the source.** The EMIL repo carries byte-identical copies at the
two paths above, because the repos share no package registry. When the kit
changes: bump `KIT_VERSION` in `src/index.ts`, copy `src/` over both copies, and
build both EMIL apps. A copy that drifts is a bug.

## What holds, and how it is checked

- **Engines match EMIL Trade.** `engines.ts` mirrors EMIL Trade's
  `STRATEGY_INPUT_DECLS` (names, defaults, groups). `indicators.ts` and
  `strategies.ts` are line-for-line ports of EMIL Trade's `indicators.ts` and
  `ea-engine.ts`. Verified by a parity run that bundles EMIL Trade's real engine
  and compares every regime decision bar by bar, across all engines, default and
  random inputs, and data built to trigger every branch (226,710 comparisons,
  zero differences, 2026-09-15). Re-run it whenever either side changes.
- **Backtests trade like EMIL Trade's live runtime**: one decision per closed
  bar after 60 bars, a new position only when the regime changes, ATR(14) stop
  and target, and no re-entry after a stop until the regime changes. EMIL Trade's
  own Strategy Tester differs on that last point (it re-enters on the next bar).
- **Generated MQL5 and Pine** implement the same rule with the same formulas
  (SMA-seeded EMA, Wilder RSI and ATR, EMIL Trade's SAR), not the platforms'
  built-ins. They are checked structurally by the self-test; compile them in
  MetaEditor and TradingView before relying on them.
- **Specs are untrusted until validated.** `validateSpec` bounds every input,
  refuses unknown engines and fields, and restricts names to characters that
  cannot break out of generated code.

```bash
npx tsx packages/emil-strategy-kit/scripts/selftest.ts
```
