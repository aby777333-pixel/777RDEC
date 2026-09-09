/**
 * Indicators computed client-side so redraws never wait on a round trip.
 * Every function returns an array aligned to the input, with `null` where
 * there is not yet enough history.
 */

export function sma(values: readonly number[], period: number): (number | null)[] {
  const out: (number | null)[] = []
  let sum = 0
  for (let i = 0; i < values.length; i += 1) {
    sum += values[i] as number
    if (i >= period) sum -= values[i - period] as number
    out.push(i >= period - 1 ? sum / period : null)
  }
  return out
}

export function ema(values: readonly number[], period: number): (number | null)[] {
  const k = 2 / (period + 1)
  const out: (number | null)[] = []
  let previous: number | null = null
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i] as number
    if (i < period - 1) {
      out.push(null)
      continue
    }
    if (previous === null) {
      const seed = values.slice(0, period).reduce((a, b) => a + b, 0) / period
      previous = seed
    } else {
      previous = value * k + previous * (1 - k)
    }
    out.push(previous)
  }
  return out
}

export type BollingerBands = { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] }

export function bollinger(values: readonly number[], period = 20, deviations = 2): BollingerBands {
  const middle = sma(values, period)
  const upper: (number | null)[] = []
  const lower: (number | null)[] = []

  for (let i = 0; i < values.length; i += 1) {
    const mean = middle[i]
    if (mean === null || mean === undefined) {
      upper.push(null)
      lower.push(null)
      continue
    }
    const window = values.slice(i - period + 1, i + 1)
    const variance = window.reduce((acc, v) => acc + (v - mean) ** 2, 0) / period
    const sd = Math.sqrt(variance)
    upper.push(mean + sd * deviations)
    lower.push(mean - sd * deviations)
  }

  return { upper, middle, lower }
}

export function rsi(values: readonly number[], period = 14): (number | null)[] {
  const out: (number | null)[] = [null]
  let avgGain = 0
  let avgLoss = 0

  for (let i = 1; i < values.length; i += 1) {
    const change = (values[i] as number) - (values[i - 1] as number)
    const gain = Math.max(change, 0)
    const loss = Math.max(-change, 0)

    if (i <= period) {
      avgGain += gain / period
      avgLoss += loss / period
      out.push(i === period ? toRsi(avgGain, avgLoss) : null)
      continue
    }

    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    out.push(toRsi(avgGain, avgLoss))
  }

  return out
}

function toRsi(avgGain: number, avgLoss: number): number {
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

export type Macd = { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] }

export function macd(values: readonly number[], fast = 12, slow = 26, signalPeriod = 9): Macd {
  const fastLine = ema(values, fast)
  const slowLine = ema(values, slow)
  const macdLine = values.map((_, i) => {
    const f = fastLine[i]
    const s = slowLine[i]
    return f === null || s === null || f === undefined || s === undefined ? null : f - s
  })

  const defined = macdLine.filter((v): v is number => v !== null)
  const signalDefined = ema(defined, signalPeriod)
  const offset = macdLine.length - defined.length

  const signal = macdLine.map((_, i) => (i < offset ? null : (signalDefined[i - offset] ?? null)))
  const histogram = macdLine.map((v, i) => {
    const s = signal[i]
    return v === null || s === null || s === undefined ? null : v - s
  })

  return { macd: macdLine, signal, histogram }
}

/** Session VWAP. `reset` marks the first index of each new session. */
export function vwap(
  candles: readonly { high: number; low: number; close: number }[],
  volumes: readonly number[],
  reset: (index: number) => boolean = () => false,
): (number | null)[] {
  let cumulativePv = 0
  let cumulativeVolume = 0

  return candles.map((candle, i) => {
    if (reset(i)) {
      cumulativePv = 0
      cumulativeVolume = 0
    }
    const typical = (candle.high + candle.low + candle.close) / 3
    const volume = volumes[i] ?? 1
    cumulativePv += typical * volume
    cumulativeVolume += volume
    return cumulativeVolume === 0 ? null : cumulativePv / cumulativeVolume
  })
}
