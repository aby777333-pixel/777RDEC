import { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, ListTree } from 'lucide-react';
import { generateMql5, generatePine, toPseudocode, type EmilStrategySpec } from '../kit';
import { APP_TITLE } from '../brand';
import { SectionTitle } from './ui';

const PLATFORMS = [
  { key: 'mq5', label: 'MetaTrader 5 (MQL5)', lang: 'cpp' },
  { key: 'pine', label: 'TradingView (Pine Script v5)', lang: 'javascript' },
] as const;

type PlatformKey = (typeof PLATFORMS)[number]['key'];

/**
 * The strategy's generated code. It is produced from the spec itself — the
 * same engine, inputs, timeframe and risk EMIL Trade runs — so what is shown
 * here is exactly what the download contains.
 */
export function EaViewer({ spec }: { spec: EmilStrategySpec }) {
  const [platform, setPlatform] = useState<PlatformKey>('mq5');
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const meta = PLATFORMS.find((p) => p.key === platform) ?? PLATFORMS[0];

  const code = useMemo(
    () => (platform === 'mq5' ? generateMql5(spec, APP_TITLE) : generatePine(spec, APP_TITLE)),
    [platform, spec],
  );

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <SectionTitle
        right={
          <div className="flex gap-2">
            <button className="btn-ghost !py-1 !px-2" onClick={() => setShowRules((v) => !v)}>
              <ListTree size={13} /> {showRules ? 'Hide rules' : 'How it trades'}
            </button>
            <button className="btn-ghost !py-1 !px-2" onClick={copy}>
              {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />} Copy
            </button>
          </div>
        }
      >
        Platform code
      </SectionTitle>

      <div className="flex gap-1 mb-2 flex-wrap">
        {PLATFORMS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPlatform(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              platform === p.key ? 'bg-primary/15 text-primary border border-primary/40' : 'text-subtext border border-border hover:text-text'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {showRules && (
        <pre className="glass !rounded-lg p-3 mb-2 border-l-2 border-primary/60 text-[11px] text-subtext leading-relaxed whitespace-pre-wrap font-mono">
          {toPseudocode(spec)}
        </pre>
      )}

      <div className="rounded-lg overflow-hidden border border-border max-h-[420px] overflow-y-auto text-xs">
        <SyntaxHighlighter language={meta.lang} style={vscDarkPlus} customStyle={{ margin: 0, background: '#050505', fontSize: 12 }} wrapLongLines>
          {code}
        </SyntaxHighlighter>
      </div>
      <p className="text-[11px] text-subtext mt-2">
        Same rule and indicator formulas as EMIL Trade&apos;s EA engine. Compile and test on a demo account before any live
        use. Backtested behaviour is not indicative of future results.
      </p>
    </div>
  );
}
