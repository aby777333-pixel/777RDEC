import { createRng } from '@/lib/utils'
import { INSTRUMENTS, type Instrument } from './instruments'
import { activityMultiplier } from './sessions'

export type Tick = {
  symbol: string
  bid: number
  ask: number
  mid: number
  /** Change since the previous tick, in price units. */
  delta: number
  time: number
}

export type Candle = { time: number; open: number; high: number; low: number; close: number }

const TICK_MS = 250
/** Seconds of simulated time per tick — one minute of chart per 4 ticks. */
const SECONDS_PER_TICK = 15

type State = { mid: number; drift: number }

/**
 * Geometric Brownian motion per instrument, modulated by session activity.
 * Deterministic for a given seed so `?seed=` reproduces a demo exactly.
 */
export class PriceEngine {
  private readonly rng: () => number
  private readonly state = new Map<string, State>()
  private readonly instruments: readonly Instrument[]
  private clock: number

  constructor(seed: number, instruments: readonly Instrument[] = INSTRUMENTS, startTime?: number) {
    this.rng = createRng(seed)
    this.instruments = instruments
    // Align to the tick grid so candles bucket cleanly.
    const now = startTime ?? Date.now()
    this.clock = Math.floor(now / 1000 / 60) * 60
    for (const instrument of instruments) {
      this.state.set(instrument.symbol, { mid: instrument.base, drift: 0 })
    }
  }

  /** Box–Muller transform over the seeded uniform stream. */
  private gaussian(): number {
    const u = Math.max(this.rng(), Number.EPSILON)
    const v = this.rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }

  step(): Tick[] {
    this.clock += SECONDS_PER_TICK
    const at = new Date(this.clock * 1000)
    const ticks: Tick[] = []

    for (const instrument of this.instruments) {
      const state = this.state.get(instrument.symbol)
      if (!state) continue

      const activity = activityMultiplier(instrument.activeSessions, at)
      // Annualised vol → per-tick sigma. ~2.1M ticks of 15s in a trading year.
      const sigma = (instrument.vol / Math.sqrt(2_100_000)) * activity

      // A slowly decaying drift term gives runs and reversals rather than noise.
      state.drift = state.drift * 0.985 + this.gaussian() * sigma * 0.35
      const shock = this.gaussian() * sigma
      const previous = state.mid
      const next = previous * Math.exp(state.drift + shock)

      // Keep the walk from wandering unrecognisably far from its anchor.
      const anchorPull = (instrument.base - next) * 0.0004
      state.mid = next + anchorPull

      const halfSpread = instrument.spread / 2
      ticks.push({
        symbol: instrument.symbol,
        mid: state.mid,
        bid: state.mid - halfSpread,
        ask: state.mid + halfSpread,
        delta: state.mid - previous,
        time: this.clock,
      })
    }

    return ticks
  }

  /** Warm-up history so a chart opens with context rather than a single point. */
  seedHistory(symbol: string, candles: number, secondsPerCandle = 60): Candle[] {
    const instrument = this.instruments.find((i) => i.symbol === symbol)
    if (!instrument) return []

    const ticksPerCandle = Math.max(1, Math.round(secondsPerCandle / SECONDS_PER_TICK))
    const out: Candle[] = []
    let bucket: number[] = []
    let bucketTime = this.clock

    for (let i = 0; i < candles * ticksPerCandle; i += 1) {
      const ticks = this.step()
      const tick = ticks.find((t) => t.symbol === symbol)
      if (!tick) continue
      if (bucket.length === 0) bucketTime = Math.floor(tick.time / secondsPerCandle) * secondsPerCandle
      bucket.push(tick.mid)

      if (bucket.length >= ticksPerCandle) {
        out.push(toCandle(bucketTime, bucket))
        bucket = []
      }
    }
    if (bucket.length > 0) out.push(toCandle(bucketTime, bucket))
    return out
  }

  get time(): number {
    return this.clock
  }

  static get tickMs(): number {
    return TICK_MS
  }

  static get secondsPerTick(): number {
    return SECONDS_PER_TICK
  }
}

function toCandle(time: number, values: number[]): Candle {
  const open = values[0] ?? 0
  const close = values[values.length - 1] ?? open
  return {
    time,
    open,
    close,
    high: Math.max(...values),
    low: Math.min(...values),
  }
}
