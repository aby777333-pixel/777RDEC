/**
 * The hero's music, synthesised rather than played back.
 *
 * There is no audio file behind this and nothing sampled: every sound is built
 * from oscillators and noise in the Web Audio graph when you press play. That
 * is a deliberate choice about licensing as much as about weight. "Royalty
 * free" in the wild almost always still means credit the artist, don't
 * redistribute, and read the terms — none of which is a thing to inherit
 * quietly on a regulated firm's website. Nothing here is anybody's work but
 * this file's, so there is no licence to honour and no attribution to carry,
 * and the page ships no megabytes to get it.
 *
 * If a licensed track is bought later, this module is the only thing that has
 * to change: <MusicToggle> asks it to start and stop and to say whether it is
 * playing, and an <audio> element behind the same three calls would be a
 * smaller file than this one.
 *
 * What it plays is four-to-the-floor techno at 124bpm in A minor: kick on
 * every beat, open hats off the beat, a clap on two and four, a sub bass
 * answering the kick, and a sixteenth-note arpeggio through a filter that
 * opens and closes across a four-bar loop, with a dotted delay behind it.
 *
 * The state lives in this module rather than in a component on purpose. Next
 * navigates between pages without reloading, so a player owned by a hero would
 * stop at the first click of the nav; owned here, the music carries across the
 * site and whichever hero is on screen shows the right button.
 *
 * ## On by default, and what a browser will actually allow
 *
 * It is meant to be playing when the page opens. No browser will agree to
 * that on trust: audio is refused until the visitor has interacted with the
 * page, and there is no flag or trick that changes it — the context simply
 * stays suspended and nothing is heard. Chrome relaxes this for sites a
 * particular visitor uses often, so the same code does start on load for some
 * people and not for others.
 *
 * So `initMusic` tries immediately, checks whether the context really reached
 * `running`, and if it did not, waits for the first press or keystroke
 * anywhere on the page and starts then. In practice that is a fraction of a
 * second into the visit rather than on paint.
 *
 * ## And off means off
 *
 * Because it starts itself, turning it off has to be remembered, or every
 * link followed would start it again. The choice is kept in `localStorage`
 * under `raptor-sound`; absent means on, which is the default asked for.
 */

const BPM = 124
const STEPS_PER_BEAT = 4
const SECONDS_PER_STEP = 60 / BPM / STEPS_PER_BEAT
/** Steps in the loop: four bars of sixteenths. */
const LOOP_STEPS = 64
/** How far ahead of the clock notes are scheduled, and how often to top it up. */
const LOOKAHEAD_SECONDS = 0.12
const TICK_MS = 25

/** Modest: this is a backdrop, not a stage. */
const VOLUME = 0.3
const FADE_IN = 0.9
const FADE_OUT = 0.45

/** A minor, in hertz. */
const A2 = 110
const C3 = 130.81
const E3 = 164.81
const G3 = 196
const A3 = 220
const C4 = 261.63
const E4 = 329.63

/** One bar of sixteenths; `null` is a rest. The loop plays this four times. */
const ARP: readonly (number | null)[] = [
  A3, null, E3, G3,
  A3, null, C4, null,
  E4, null, C4, A3,
  G3, null, E3, null,
]

/** The bass answers the kick rather than fighting it: offbeat sixteenths. */
const BASS: readonly (number | null)[] = [
  null, null, null, A2,
  null, null, null, A2,
  null, null, null, G3 / 2,
  null, null, null, C3 / 2,
]

/** Where the visitor's answer is kept. Absent means on. */
const SOUND_KEY = 'raptor-sound'

/**
 * Events that count as a user activation. Scrolling is not one of them, as
 * far as the autoplay policy is concerned, so there is no point listening for
 * it: it would fail the same way loading does.
 */
const GESTURES = ['pointerdown', 'keydown', 'touchstart'] as const

type Listener = (playing: boolean) => void

let ctx: AudioContext | null = null
let master: GainNode | null = null
let arpBus: BiquadFilterNode | null = null
let delaySend: GainNode | null = null
let noise: AudioBuffer | null = null

let timer: number | null = null
let nextStepTime = 0
let step = 0
let playing = false
/** Set while waiting for the first gesture, so it is only ever armed once. */
let disarm: (() => void) | null = null
let started = false

const listeners = new Set<Listener>()

function wantsSound() {
  try {
    return window.localStorage.getItem(SOUND_KEY) !== 'off'
  } catch {
    // A browser with storage blocked still gets the default.
    return true
  }
}

function remember(on: boolean) {
  try {
    window.localStorage.setItem(SOUND_KEY, on ? 'on' : 'off')
  } catch {
    /* nothing to do: the choice lasts as long as the page instead */
  }
}

function announce() {
  for (const listener of listeners) listener(playing)
}

/** Two seconds of white noise, reused by the hats and the clap. */
function noiseBuffer(audio: AudioContext) {
  const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function build() {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return false
  const audio = new Ctor()

  const out = audio.createGain()
  out.gain.value = 0
  // A gentle curve on the way out, so a busy bar cannot clip the mix.
  const limiter = audio.createWaveShaper()
  const curve = new Float32Array(1024)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = Math.tanh(x * 1.6) / Math.tanh(1.6)
  }
  limiter.curve = curve
  out.connect(limiter)
  limiter.connect(audio.destination)

  // The arpeggio's own filter, swept across the loop, and a dotted delay.
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  filter.Q.value = 7
  filter.connect(out)

  const delay = audio.createDelay(1)
  delay.delayTime.value = SECONDS_PER_STEP * 3
  const feedback = audio.createGain()
  feedback.gain.value = 0.32
  const send = audio.createGain()
  send.gain.value = 0.35
  send.connect(delay)
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(out)

  ctx = audio
  master = out
  arpBus = filter
  delaySend = send
  noise = noiseBuffer(audio)
  return true
}

function kick(audio: AudioContext, at: number, to: GainNode) {
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(132, at)
  osc.frequency.exponentialRampToValueAtTime(44, at + 0.085)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.95, at + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.3)
  osc.connect(gain)
  gain.connect(to)
  osc.start(at)
  osc.stop(at + 0.34)
}

function hat(audio: AudioContext, at: number, to: GainNode, open: boolean) {
  if (!noise) return
  const source = audio.createBufferSource()
  source.buffer = noise
  source.playbackRate.value = 1.4
  const high = audio.createBiquadFilter()
  high.type = 'highpass'
  high.frequency.value = 8200
  const gain = audio.createGain()
  const decay = open ? 0.19 : 0.035
  gain.gain.setValueAtTime(open ? 0.075 : 0.055, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay)
  source.connect(high)
  high.connect(gain)
  gain.connect(to)
  source.start(at, Math.random())
  source.stop(at + decay + 0.02)
}

function clap(audio: AudioContext, at: number, to: GainNode) {
  if (!noise) return
  // Three quick bursts, which is what makes a clap rather than a snare.
  for (let i = 0; i < 3; i++) {
    const offset = at + i * 0.011
    const source = audio.createBufferSource()
    source.buffer = noise
    const band = audio.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 1650
    band.Q.value = 1.2
    const gain = audio.createGain()
    gain.gain.setValueAtTime(i === 2 ? 0.16 : 0.08, offset)
    gain.gain.exponentialRampToValueAtTime(0.0001, offset + (i === 2 ? 0.14 : 0.03))
    source.connect(band)
    band.connect(gain)
    gain.connect(to)
    source.start(offset, Math.random())
    source.stop(offset + 0.18)
  }
}

function bass(audio: AudioContext, at: number, to: GainNode, freq: number) {
  const osc = audio.createOscillator()
  const sub = audio.createOscillator()
  const low = audio.createBiquadFilter()
  const gain = audio.createGain()
  osc.type = 'sawtooth'
  osc.frequency.value = freq
  sub.type = 'sine'
  sub.frequency.value = freq / 2
  low.type = 'lowpass'
  low.frequency.value = 420
  low.Q.value = 2
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.22, at + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.2)
  osc.connect(low)
  sub.connect(low)
  low.connect(gain)
  gain.connect(to)
  osc.start(at)
  sub.start(at)
  osc.stop(at + 0.22)
  sub.stop(at + 0.22)
}

function stab(audio: AudioContext, at: number, to: BiquadFilterNode, send: GainNode, freq: number) {
  const osc = audio.createOscillator()
  const detuned = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'square'
  osc.frequency.value = freq
  detuned.type = 'sawtooth'
  detuned.frequency.value = freq * 1.005
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.085, at + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)
  osc.connect(gain)
  detuned.connect(gain)
  gain.connect(to)
  gain.connect(send)
  osc.start(at)
  detuned.start(at)
  osc.stop(at + 0.18)
  detuned.stop(at + 0.18)
}

function scheduleStep(index: number, at: number) {
  if (!ctx || !master || !arpBus || !delaySend) return
  const inBar = index % 16
  const bar = Math.floor(index / 16)

  if (inBar % 4 === 0) kick(ctx, at, master)
  if (inBar % 2 === 0) hat(ctx, at, master, false)
  // The open hat off the beat is the sound that says techno.
  if (inBar % 4 === 2) hat(ctx, at, master, true)
  if (inBar === 4 || inBar === 12) clap(ctx, at, master)

  const bassNote = BASS[inBar]
  if (bassNote) bass(ctx, at, master, bassNote)

  // The arpeggio sits out the first bar of the loop, so the loop breathes.
  const arpNote = ARP[inBar]
  if (arpNote && bar > 0) stab(ctx, at, arpBus, delaySend, arpNote)

  // One filter sweep across the whole four bars.
  const through = index / LOOP_STEPS
  const cutoff = 700 + 2300 * (0.5 - 0.5 * Math.cos(through * Math.PI * 2))
  arpBus.frequency.setTargetAtTime(cutoff, at, 0.12)
}

function scheduler() {
  if (!ctx) return
  while (nextStepTime < ctx.currentTime + LOOKAHEAD_SECONDS) {
    scheduleStep(step, nextStepTime)
    nextStepTime += SECONDS_PER_STEP
    step = (step + 1) % LOOP_STEPS
  }
}

/**
 * Starts the loop. Must be called from a user gesture: browsers will not let
 * an audio context run otherwise, which is a rule worth having.
 */
export async function startMusic(): Promise<boolean> {
  if (playing) return true
  if (!ctx && !build()) return false
  if (!ctx || !master) return false

  await ctx.resume().catch(() => undefined)
  // The honest test. Without an activation the context stays suspended, and
  // scheduling into it would leave the button claiming to play silence.
  if (ctx.state !== 'running') return false

  step = 0
  nextStepTime = ctx.currentTime + 0.08
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
  master.gain.linearRampToValueAtTime(VOLUME, ctx.currentTime + FADE_IN)

  scheduler()
  timer = window.setInterval(scheduler, TICK_MS)
  playing = true
  announce()
  return true
}

/**
 * Starts it if the visitor has not said otherwise — now if the browser allows
 * it, at their first press or keystroke if not. Safe to call from every hero
 * that mounts; only the first call does anything.
 */
export function initMusic() {
  if (started) return
  started = true
  if (!wantsSound()) return

  void startMusic().then((ok) => {
    if (ok || disarm) return
    const go = () => {
      disarm?.()
      // Still only if they have not turned it off in the meantime.
      if (wantsSound()) void startMusic()
    }
    disarm = () => {
      disarm = null
      for (const event of GESTURES) window.removeEventListener(event, go)
    }
    for (const event of GESTURES) window.addEventListener(event, go, { passive: true })
  })
}

/** Fades out, stops scheduling, and lets the context idle. */
export function stopMusic() {
  if (!playing || !ctx || !master) return
  const now = ctx.currentTime
  master.gain.cancelScheduledValues(now)
  master.gain.setValueAtTime(master.gain.value, now)
  master.gain.linearRampToValueAtTime(0, now + FADE_OUT)

  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
  playing = false
  announce()

  const audio = ctx
  // Suspending is what actually gives the CPU back; wait for the fade first.
  window.setTimeout(() => {
    if (!playing) audio.suspend().catch(() => undefined)
  }, FADE_OUT * 1000 + 120)
}

export function toggleMusic() {
  if (playing) {
    remember(false)
    // Stop waiting for a gesture too, or it would start again on the next one.
    disarm?.()
    stopMusic()
    return
  }
  remember(true)
  void startMusic()
}

export function isMusicPlaying() {
  return playing
}

/** Subscribes to play/stop. Returns the unsubscribe. */
export function onMusicChange(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
