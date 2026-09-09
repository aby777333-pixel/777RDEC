/**
 * The three primary FX/index trading sessions.
 *
 * Plain data plus two pure functions over a clock, so this is safe in a client
 * component and needs no simulation core behind it. Hours are UTC and describe
 * the liquid core of each session rather than exchange opening bells — that is
 * what matters for the point the globe is making, and it is what a desk means
 * when it says "the London session".
 *
 * These are approximations of market convention, not exchange calendars: they
 * do not model holidays, half-days, or the DST drift in the London and New
 * York cash opens. The globe presents them as sessions, never as a schedule to
 * trade from.
 */

export type SessionName = 'Asia' | 'London' | 'NewYork'

export type Session = {
  name: SessionName
  label: string
  /** Inclusive start hour, UTC. */
  startUtc: number
  /** Exclusive end hour, UTC. A value past 24 wraps through midnight. */
  endUtc: number
  /** What the session is generally known for. Editorial, not advice. */
  character: string
}

export const SESSIONS: readonly Session[] = [
  {
    name: 'Asia',
    label: 'Asia',
    startUtc: 0,
    endUtc: 8,
    character:
      'Tokyo, Singapore and Sydney. Thinner books and tighter ranges than the later sessions, which makes levels set here worth carrying forward into the European open.',
  },
  {
    name: 'London',
    label: 'London',
    startUtc: 7,
    endUtc: 16,
    character:
      'The deepest FX session. The overlap with New York carries the bulk of the day’s volume, and most of the day’s range is typically set inside this window.',
  },
  {
    name: 'NewYork',
    label: 'New York',
    startUtc: 12,
    endUtc: 21,
    character:
      'US data and the cash equity open land here. Liquidity is high through the London overlap and thins noticeably after the European close.',
  },
]

export function sessionByName(name: SessionName): Session {
  const found = SESSIONS.find((session) => session.name === name)
  if (!found) throw new Error(`Unknown session: ${name}`)
  return found
}

/** Hours since the session opened, wrapping through midnight. 0 → 24. */
function hoursInto(session: Session, date: Date): number {
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60
  const offset = hour - session.startUtc
  return offset < 0 ? offset + 24 : offset
}

function durationOf(session: Session): number {
  const span = session.endUtc - session.startUtc
  return span <= 0 ? span + 24 : span
}

/** Whether a session is open at the given instant. */
export function isOpenAt(session: Session, date: Date): boolean {
  return hoursInto(session, date) < durationOf(session)
}

/**
 * Which sessions are open, in the order they opened. The last entry is the
 * most recently opened session, which the globe treats as the primary one.
 */
export function openSessionsAt(date: Date): readonly SessionName[] {
  return SESSIONS.filter((session) => isOpenAt(session, date))
    .sort((a, b) => hoursInto(b, date) - hoursInto(a, date))
    .map((session) => session.name)
}

/**
 * A 0–1 activity weight for a session at a given instant.
 *
 * A closed session reads low but not zero, since books never fully empty. An
 * open session rises off the open, peaks near its middle and eases toward the
 * close — a smooth half-sine, which is the shape of a session's volume profile
 * without pretending to be measured data.
 */
export function activityFor(name: SessionName, date: Date): number {
  const session = sessionByName(name)
  if (!isOpenAt(session, date)) return 0.12
  const progress = hoursInto(session, date) / durationOf(session)
  return 0.28 + 0.72 * Math.sin(progress * Math.PI)
}
