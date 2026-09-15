/**
 * EMIL Strategy Kit self-test. Run: npx tsx packages/emil-strategy-kit/scripts/selftest.ts
 *
 * Checks what can be checked without MetaEditor or TradingView: specs round
 * trip through links and validation, bad specs are refused, every engine
 * generates MQL5 and Pine whose structure is sound (balanced brackets, every
 * input it reads is declared, every helper it calls is emitted), and the
 * backtest runs. Signal parity with EMIL Trade's engine is verified
 * separately against that codebase (see README.md).
 */
import {
  ENGINE_IDS,
  ENGINES,
  backtest,
  createSpec,
  decodeSpec,
  emilTradeImportUrl,
  encodeSpec,
  generateMql5,
  generatePine,
  specChecksum,
  specFromHash,
  toBlueprintFields,
  toPseudocode,
  validateSpec,
  type Bar,
} from '../src'

let failures = 0
const check = (ok: boolean, label: string) => {
  if (!ok) {
    failures++
    console.error(`  FAIL  ${label}`)
  }
}

function balanced(source: string): boolean {
  const stripped = source
    .replace(/\/\/[^\n]*/g, '')
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' }
  const stack: string[] = []
  for (const ch of stripped) {
    if (ch === '(' || ch === '[' || ch === '{') stack.push(ch)
    else if (ch in pairs && stack.pop() !== pairs[ch]) return false
  }
  return stack.length === 0
}

function bars(n: number): Bar[] {
  const out: Bar[] = []
  let price = 100
  for (let i = 0; i < n; i++) {
    const open = price
    const close = open * (1 + Math.sin(i / 9) * 0.004 + Math.cos(i / 3.7) * 0.003)
    out.push({ time: i * 3600, open, high: Math.max(open, close) * 1.002, low: Math.min(open, close) * 0.998, close })
    price = close
  }
  return out
}

const now = new Date('2026-09-15T10:00:00Z')

for (const engine of ENGINE_IDS) {
  const spec = createSpec({ id: `selftest-${engine.replace(/_/g, '-')}`, engine, name: `Self test ${ENGINES[engine].label}`, app: 'selftest', symbols: ['EURUSD', 'XAUUSD'], now })

  const valid = validateSpec(spec)
  check(valid.ok, `${engine}: default spec validates`)

  const decoded = decodeSpec(encodeSpec(spec))
  check(decoded.ok && specChecksum(decoded.spec) === specChecksum(spec), `${engine}: encode/decode round trip`)

  const url = emilTradeImportUrl('https://emil-trade.example', spec)
  const fromHash = specFromHash(new URL(url).hash)
  check(!!fromHash && fromHash.ok && fromHash.spec.id === spec.id, `${engine}: import URL fragment parses`)

  const mql5 = generateMql5(spec)
  const pine = generatePine(spec)
  check(balanced(mql5), `${engine}: MQL5 brackets balance`)
  check(balanced(pine), `${engine}: Pine brackets balance`)
  for (const input of ENGINES[engine].inputs) {
    check(new RegExp(`input ${input.type} ${input.name} = `).test(mql5), `${engine}: MQL5 declares ${input.name}`)
    check(new RegExp(`^${input.name} = input\\.(int|float)\\(`, 'm').test(pine), `${engine}: Pine declares ${input.name}`)
  }
  for (const helper of Array.from(new Set(mql5.match(/\bEmil[A-Z][A-Za-z]+(?=\()/g) ?? []))) {
    check(new RegExp(`(void|int|ulong|double) ${helper}\\(`).test(mql5), `${engine}: MQL5 defines ${helper}`)
  }
  for (const fn of Array.from(new Set(pine.match(/\bemil[A-Z][A-Za-z]+(?=\()/g) ?? []))) {
    check(new RegExp(`^${fn}\\(`, 'm').test(pine), `${engine}: Pine defines ${fn}`)
  }
  check(/^\/\/@version=5$/m.test(pine.split('\n')[0]), `${engine}: Pine starts with //@version=5`)
  check(!/[^\x00-\x7F]/.test(mql5), `${engine}: MQL5 is ASCII`)

  const fields = toBlueprintFields(spec)
  check(fields.market === 'multi' && fields.entryLong.length > 20 && fields.checksum === specChecksum(spec), `${engine}: blueprint fields`)
  check(toPseudocode(spec).includes(ENGINES[engine].label), `${engine}: pseudocode`)

  const result = backtest(spec, bars(400))
  check(result.barsTested === 400 && result.equity.length === result.trades.length + 1, `${engine}: backtest runs`)
}

// Refusals.
const base = createSpec({ id: 'selftest-refusals', engine: 'trend_reversal', name: 'Refusals', app: 'selftest', now })
const refuse = (mutate: (s: Record<string, unknown>) => void, label: string) => {
  const copy = JSON.parse(JSON.stringify(base)) as Record<string, unknown>
  mutate(copy)
  check(!validateSpec(copy).ok, `refuses ${label}`)
}
refuse((s) => { s.engine = 'martingale' }, 'an unknown engine')
refuse((s) => { (s.params as Record<string, number>).FastEMA = 80 }, 'FastEMA above SlowEMA')
refuse((s) => { (s.params as Record<string, number>).FastEMA = 2.5 }, 'a fractional period')
refuse((s) => { (s.params as Record<string, number>).Martingale = 2 }, 'an input the engine does not have')
refuse((s) => { s.name = 'Evil"); DeleteAll(); //' }, 'a name that could break out of generated code')
refuse((s) => { s.symbols = [] }, 'no symbols')
refuse((s) => { s.timeframe = '2H' }, 'an unsupported timeframe')
refuse((s) => { (s.risk as Record<string, number>).lot = 1000 }, 'an oversized lot')
refuse((s) => { s.specVersion = 2 }, 'a future spec version')
check(!decodeSpec('%%%').ok && !decodeSpec('A'.repeat(9000)).ok, 'refuses malformed and oversized links')

// Same logic, different name → same checksum; different logic → different.
const renamed = { ...base, name: 'Renamed', version: 2 }
const retuned = { ...base, params: { ...base.params, FastEMA: 21 } }
check(specChecksum(renamed) === specChecksum(base), 'checksum ignores name and version')
check(specChecksum(retuned) !== specChecksum(base), 'checksum changes with parameters')

if (failures > 0) {
  console.error(`\n  strategy kit selftest FAILED — ${failures} check(s).\n`)
  process.exit(1)
}
console.log(`  strategy kit selftest passed — ${ENGINE_IDS.length} engines, specs, links, MQL5, Pine, blueprints, backtests.`)
