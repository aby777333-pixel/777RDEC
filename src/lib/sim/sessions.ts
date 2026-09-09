import type { SessionName } from './instruments'

export type SessionWindow = { name: SessionName; label: string; startUtc: number; endUtc: number }

/** Trading sessions in UTC hours. Used to modulate simulated activity. */
export const SESSIONS: readonly SessionWindow[] = [
  { name: 'Asia', label: 'Asia', startUtc: 0, endUtc: 9 },
  { name: 'London', label: 'London', startUtc: 7, endUtc: 16 },
  { name: 'NewYork', label: 'New York', startUtc: 12, endUtc: 21 },
]

export function openSessions(date: Date = new Date()): readonly SessionName[] {
  const hour = date.getUTCHours()
  return SESSIONS.filter((s) => hour >= s.startUtc && hour < s.endUtc).map((s) => s.name)
}

/**
 * Activity multiplier for an instrument at a given time: quieter when none of
 * its sessions are open, louder at the London and New York opens.
 */
export function activityMultiplier(
  instrumentSessions: readonly SessionName[],
  date: Date = new Date(),
): number {
  const open = openSessions(date)
  const overlap = instrumentSessions.filter((s) => open.includes(s)).length
  if (overlap === 0) return 0.35

  const hour = date.getUTCHours()
  const minute = date.getUTCMinutes()
  // First hour of the London and New York sessions carries the most activity.
  const atOpen = (hour === 7 || hour === 12) && minute < 60
  const base = overlap >= 2 ? 1.45 : 1
  return atOpen ? base * 1.4 : base
}
