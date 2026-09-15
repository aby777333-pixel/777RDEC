import { useState } from 'react';
import { Save, Download, ExternalLink, Loader2, Brain } from 'lucide-react';
import {
  emilTradeImportUrl,
  fileBaseName,
  generateMql5,
  generatePine,
  validateSpec,
  type EmilStrategySpec,
} from '../kit';
import { APP_TITLE, EMIL_TRADE_BASE } from '../brand';
import { commitStrategy, type TeachResult } from '../strategyLibrary';
import { useStore } from '../store';

function downloadText(filename: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The four things a finished strategy can do, in one place: save it (which
 * also sends it to EMIL for review), download it as an MQL5 EA or a Pine
 * strategy, and attach it to EMIL Trade. Every action saves and teaches first.
 */
export function StrategyActions({
  spec,
  onSaved,
  compact = false,
}: {
  spec: EmilStrategySpec;
  onSaved?: (saved: EmilStrategySpec) => void;
  compact?: boolean;
}) {
  const pushToast = useStore((s) => s.pushToast);
  const [teach, setTeach] = useState<TeachResult | null>(null);
  const [sending, setSending] = useState(false);
  const validation = validateSpec(spec);
  const disabled = !validation.ok;

  const commit = (): EmilStrategySpec | null => {
    const checked = validateSpec(spec);
    if (!checked.ok) {
      pushToast({ type: 'error', message: checked.errors[0] ?? 'The strategy is not complete.' });
      return null;
    }
    const { saved, teach: pending } = commitStrategy(checked.spec);
    onSaved?.(saved);
    setSending(true);
    pending
      .then((result) => {
        setTeach(result);
        if (result.status === 'sent') pushToast({ type: 'success', message: result.message });
      })
      .finally(() => setSending(false));
    return saved;
  };

  const save = () => {
    const saved = commit();
    if (saved) pushToast({ type: 'info', message: `Saved "${saved.name}" (v${saved.version}).` });
  };

  const download = (kind: 'mq5' | 'pine') => {
    const saved = commit();
    if (!saved) return;
    const code = kind === 'mq5' ? generateMql5(saved, APP_TITLE) : generatePine(saved, APP_TITLE);
    downloadText(`${fileBaseName(saved)}.${kind}`, code);
  };

  const attach = () => {
    const saved = commit();
    if (!saved) return;
    const url = emilTradeImportUrl(EMIL_TRADE_BASE, saved);
    if (EMIL_TRADE_BASE === '') {
      window.location.assign(url);
    } else {
      window.open(url, '_blank', 'noopener');
      pushToast({ type: 'info', message: 'Opened EMIL Trade — confirm the import there, then attach it to a chart.' });
    }
  };

  const size = compact ? '!py-1.5 text-xs' : '';
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button className={`btn-primary ${size}`} onClick={save} disabled={disabled} title="Save in this browser and send to EMIL for review">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save &amp; teach EMIL
        </button>
        <button className={`btn-ghost ${size}`} onClick={() => download('mq5')} disabled={disabled} title="MetaTrader 5 Expert Advisor">
          <Download size={14} /> MQL5 EA
        </button>
        <button className={`btn-ghost ${size}`} onClick={() => download('pine')} disabled={disabled} title="TradingView Pine Script v5 strategy">
          <Download size={14} /> Pine Script
        </button>
        <button className={`btn-success ${size}`} onClick={attach} disabled={disabled} title="Add to your EMIL Trade EA library">
          <ExternalLink size={14} /> Attach to EMIL Trade
        </button>
      </div>
      {!validation.ok && (
        <p className="text-[11px] text-warning">{validation.errors[0]}</p>
      )}
      {teach && (
        <p
          className={`text-[11px] flex items-center gap-1.5 ${
            teach.status === 'sent' || teach.status === 'already-sent' ? 'text-success' : teach.status === 'unavailable' ? 'text-subtext' : 'text-warning'
          }`}
        >
          <Brain size={12} className="shrink-0" /> {teach.message}
        </p>
      )}
    </div>
  );
}
