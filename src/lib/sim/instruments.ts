export type AssetClass = 'FX' | 'Indices' | 'Metals' | 'Energy' | 'Equities' | 'Crypto'

export type Instrument = {
  symbol: string
  name: string
  assetClass: AssetClass
  /** Starting mid price for the simulation. */
  base: number
  /** Annualised volatility used by the price engine. */
  vol: number
  /** Decimal places for display. */
  digits: number
  /** Typical spread in price units. */
  spread: number
  /** Sessions in which this instrument is most active. */
  activeSessions: readonly SessionName[]
}

export type SessionName = 'Asia' | 'London' | 'NewYork'

const fx = (
  symbol: string,
  name: string,
  base: number,
  vol: number,
  digits: number,
  spread: number,
  activeSessions: readonly SessionName[],
): Instrument => ({ symbol, name, assetClass: 'FX', base, vol, digits, spread, activeSessions })

/**
 * ~40 instruments across six asset classes. Prices are plausible starting
 * points for a simulation, not quotes: the sandbox is explicitly simulated.
 */
export const INSTRUMENTS: readonly Instrument[] = [
  // FX majors
  fx('EURUSD', 'Euro / US Dollar', 1.0865, 0.07, 5, 0.00008, ['London', 'NewYork']),
  fx('GBPUSD', 'British Pound / US Dollar', 1.2712, 0.08, 5, 0.00011, ['London', 'NewYork']),
  fx('USDJPY', 'US Dollar / Japanese Yen', 151.42, 0.09, 3, 0.012, ['Asia', 'NewYork']),
  fx('AUDUSD', 'Australian Dollar / US Dollar', 0.6584, 0.09, 5, 0.00012, ['Asia', 'London']),
  fx('USDCHF', 'US Dollar / Swiss Franc', 0.8842, 0.07, 5, 0.00013, ['London']),
  fx('USDCAD', 'US Dollar / Canadian Dollar', 1.3608, 0.07, 5, 0.00014, ['NewYork']),
  fx('NZDUSD', 'New Zealand Dollar / US Dollar', 0.6042, 0.1, 5, 0.00016, ['Asia']),
  fx('EURGBP', 'Euro / British Pound', 0.8547, 0.06, 5, 0.00013, ['London']),
  fx('EURJPY', 'Euro / Japanese Yen', 164.52, 0.1, 3, 0.018, ['London', 'Asia']),
  fx('GBPJPY', 'British Pound / Japanese Yen', 192.48, 0.12, 3, 0.028, ['London', 'Asia']),
  fx('AUDJPY', 'Australian Dollar / Japanese Yen', 99.68, 0.12, 3, 0.024, ['Asia']),
  fx('EURCHF', 'Euro / Swiss Franc', 0.9604, 0.05, 5, 0.00015, ['London']),
  fx('USDSEK', 'US Dollar / Swedish Krona', 10.482, 0.1, 4, 0.0025, ['London']),
  fx('USDMXN', 'US Dollar / Mexican Peso', 16.742, 0.14, 4, 0.0042, ['NewYork']),

  // Indices
  { symbol: 'NAS100', name: 'US Tech 100', assetClass: 'Indices', base: 17752.7, vol: 0.19, digits: 1, spread: 1.4, activeSessions: ['NewYork'] },
  { symbol: 'US30', name: 'US Wall Street 30', assetClass: 'Indices', base: 39719.5, vol: 0.15, digits: 1, spread: 2.6, activeSessions: ['NewYork'] },
  { symbol: 'SPX500', name: 'US 500', assetClass: 'Indices', base: 5204.3, vol: 0.16, digits: 1, spread: 0.5, activeSessions: ['NewYork'] },
  { symbol: 'GER40', name: 'Germany 40', assetClass: 'Indices', base: 18204.6, vol: 0.17, digits: 1, spread: 1.2, activeSessions: ['London'] },
  { symbol: 'UK100', name: 'UK 100', assetClass: 'Indices', base: 7942.1, vol: 0.14, digits: 1, spread: 1.1, activeSessions: ['London'] },
  { symbol: 'JP225', name: 'Japan 225', assetClass: 'Indices', base: 39824.0, vol: 0.2, digits: 1, spread: 8, activeSessions: ['Asia'] },
  { symbol: 'HK50', name: 'Hong Kong 50', assetClass: 'Indices', base: 16748.0, vol: 0.22, digits: 1, spread: 6, activeSessions: ['Asia'] },
  { symbol: 'AUS200', name: 'Australia 200', assetClass: 'Indices', base: 7784.2, vol: 0.15, digits: 1, spread: 1.8, activeSessions: ['Asia'] },

  // Metals
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', assetClass: 'Metals', base: 4419.44, vol: 0.14, digits: 2, spread: 0.22, activeSessions: ['London', 'NewYork'] },
  { symbol: 'XAGUSD', name: 'Silver / US Dollar', assetClass: 'Metals', base: 52.18, vol: 0.26, digits: 3, spread: 0.018, activeSessions: ['London', 'NewYork'] },
  { symbol: 'XPTUSD', name: 'Platinum / US Dollar', assetClass: 'Metals', base: 1012.4, vol: 0.22, digits: 2, spread: 1.6, activeSessions: ['London'] },
  { symbol: 'XPDUSD', name: 'Palladium / US Dollar', assetClass: 'Metals', base: 1024.8, vol: 0.3, digits: 2, spread: 2.4, activeSessions: ['London'] },
  { symbol: 'COPPER', name: 'Copper', assetClass: 'Metals', base: 4.284, vol: 0.21, digits: 4, spread: 0.0018, activeSessions: ['London', 'NewYork'] },

  // Energy
  { symbol: 'WTIUSD', name: 'US Crude Oil', assetClass: 'Energy', base: 78.42, vol: 0.3, digits: 2, spread: 0.03, activeSessions: ['NewYork'] },
  { symbol: 'BRENTUSD', name: 'Brent Crude Oil', assetClass: 'Energy', base: 82.64, vol: 0.28, digits: 2, spread: 0.03, activeSessions: ['London', 'NewYork'] },
  { symbol: 'NATGAS', name: 'Natural Gas', assetClass: 'Energy', base: 2.184, vol: 0.52, digits: 3, spread: 0.004, activeSessions: ['NewYork'] },

  // Equities
  { symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equities', base: 229.16, vol: 0.24, digits: 2, spread: 0.02, activeSessions: ['NewYork'] },
  { symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'Equities', base: 421.84, vol: 0.23, digits: 2, spread: 0.03, activeSessions: ['NewYork'] },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', assetClass: 'Equities', base: 124.73, vol: 0.42, digits: 2, spread: 0.02, activeSessions: ['NewYork'] },
  { symbol: 'TSLA', name: 'Tesla Inc.', assetClass: 'Equities', base: 332.66, vol: 0.45, digits: 2, spread: 0.04, activeSessions: ['NewYork'] },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', assetClass: 'Equities', base: 186.42, vol: 0.28, digits: 2, spread: 0.02, activeSessions: ['NewYork'] },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', assetClass: 'Equities', base: 168.24, vol: 0.26, digits: 2, spread: 0.02, activeSessions: ['NewYork'] },

  // Crypto
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', assetClass: 'Crypto', base: 79649.7, vol: 0.48, digits: 1, spread: 6, activeSessions: ['Asia', 'London', 'NewYork'] },
  { symbol: 'ETHUSD', name: 'Ethereum / US Dollar', assetClass: 'Crypto', base: 3182.4, vol: 0.56, digits: 2, spread: 0.9, activeSessions: ['Asia', 'London', 'NewYork'] },
  { symbol: 'SOLUSD', name: 'Solana / US Dollar', assetClass: 'Crypto', base: 184.62, vol: 0.72, digits: 2, spread: 0.08, activeSessions: ['Asia', 'London', 'NewYork'] },
  { symbol: 'XRPUSD', name: 'XRP / US Dollar', assetClass: 'Crypto', base: 2.4128, vol: 0.68, digits: 4, spread: 0.0012, activeSessions: ['Asia', 'London', 'NewYork'] },
]

export const INSTRUMENT_MAP: ReadonlyMap<string, Instrument> = new Map(
  INSTRUMENTS.map((i) => [i.symbol, i]),
)

export const ASSET_CLASSES: readonly AssetClass[] = [
  'FX',
  'Indices',
  'Metals',
  'Energy',
  'Equities',
  'Crypto',
]

export function formatPrice(value: number, digits: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}
