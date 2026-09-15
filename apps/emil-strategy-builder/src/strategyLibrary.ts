import { useEffect, useState } from 'react';
import { validateSpec, specChecksum, type EmilStrategySpec } from './kit';
import { BRAND } from './brand';

/**
 * The user's own strategies, kept in this browser, and the hand-off to EMIL.
 *
 * Saving, downloading and attaching all go through `commitStrategy`, so every
 * strategy someone works with is also sent to EMIL for review — once per
 * distinct version, never duplicated.
 */

const LIBRARY_KEY = 'emil_sb_strategies_v1';
const TAUGHT_KEY = 'emil_sb_taught_v1';
const CHANGED_EVENT = 'emil-sb-library-changed';
const MAX_STRATEGIES = 50;

export type TeachResult =
  | { status: 'sent'; message: string; code?: string }
  | { status: 'already-sent'; message: string; code?: string }
  | { status: 'unavailable'; message: string }
  | { status: 'failed'; message: string };

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked — the strategy still works for this session */
  }
}

/** Saved strategies, newest first. Anything that no longer validates is dropped. */
export function loadLibrary(): EmilStrategySpec[] {
  const raw = readJson<unknown[]>(LIBRARY_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => validateSpec(item))
    .flatMap((result) => (result.ok ? [result.spec] : []))
    .sort((a, b) => b.source.updatedAt.localeCompare(a.source.updatedAt));
}

function notify(): void {
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/**
 * Saves the spec. If a strategy with the same id exists and its logic, name or
 * description changed, the saved copy becomes the next version.
 */
export function saveToLibrary(spec: EmilStrategySpec): EmilStrategySpec {
  const library = loadLibrary();
  const existing = library.find((s) => s.id === spec.id);
  let saved = spec;
  if (existing) {
    const changed =
      specChecksum(existing) !== specChecksum(spec) || existing.name !== spec.name || existing.description !== spec.description;
    saved = changed
      ? { ...spec, version: Math.max(existing.version, spec.version) + 1, source: { ...spec.source, createdAt: existing.source.createdAt, updatedAt: new Date().toISOString() } }
      : existing;
  }
  const rest = library.filter((s) => s.id !== spec.id);
  writeJson(LIBRARY_KEY, [saved, ...rest].slice(0, MAX_STRATEGIES));
  notify();
  return saved;
}

export function removeFromLibrary(id: string): void {
  writeJson(LIBRARY_KEY, loadLibrary().filter((s) => s.id !== id));
  notify();
}

export function useLibrary(): EmilStrategySpec[] {
  const [library, setLibrary] = useState<EmilStrategySpec[]>(() => loadLibrary());
  useEffect(() => {
    const sync = () => setLibrary(loadLibrary());
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return library;
}

const teachKey = (spec: EmilStrategySpec) => `${spec.id}:${specChecksum(spec)}:${spec.name}`;

/** Sends the spec to EMIL through the host's server route. */
export async function teachEmil(spec: EmilStrategySpec): Promise<TeachResult> {
  const taught = readJson<Record<string, string>>(TAUGHT_KEY, {});
  if (taught[teachKey(spec)]) {
    return { status: 'already-sent', message: 'EMIL already has this version for review.', code: taught[teachKey(spec)] };
  }
  let response: Response;
  try {
    response = await fetch(BRAND.teachApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ spec }),
    });
  } catch {
    return { status: 'failed', message: 'Could not reach EMIL. The strategy is saved here; it will be sent next time you save it.' };
  }
  const body = (await response.json().catch(() => null)) as { code?: string; duplicate?: boolean; error?: string } | null;
  if (response.ok) {
    const code = body?.code;
    writeJson(TAUGHT_KEY, { ...taught, [teachKey(spec)]: code || 'sent' });
    return body?.duplicate
      ? { status: 'already-sent', message: 'EMIL already has this version for review.', code }
      : { status: 'sent', message: `Sent to EMIL for review${code ? ` as ${code}` : ''}. It is research until the Lab validates it.`, code };
  }
  if (response.status === 401) return { status: 'unavailable', message: 'Sign in to send strategies to EMIL.' };
  if (response.status === 404 || response.status === 503) {
    return { status: 'unavailable', message: body?.error || 'Sending to EMIL is not switched on for this site yet. The strategy is saved here.' };
  }
  if (response.status === 429) return { status: 'failed', message: 'Too many strategies sent just now. Try again in a few minutes.' };
  return { status: 'failed', message: body?.error ? `EMIL did not accept it: ${body.error}` : 'EMIL did not accept the strategy.' };
}

/** Save, then send to EMIL. The save never waits on the network. */
export function commitStrategy(spec: EmilStrategySpec): { saved: EmilStrategySpec; teach: Promise<TeachResult> } {
  const saved = saveToLibrary(spec);
  return { saved, teach: teachEmil(saved) };
}
