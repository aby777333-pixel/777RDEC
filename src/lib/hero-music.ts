/**
 * The hero's music, synthesised rather than played back.
 *
 * There is no audio file behind this and nothing sampled: every sound is built
 * from oscillators and noise in the Web Audio graph. That is a choice about
 * licensing as much as about weight — "royalty free" in the wild almost always
 * still means credit the artist, don't redistribute, and read the terms, none
 * of which is a thing to inherit quietly on a regulated firm's website.
 * Nothing here is anybody's work but this file's, so there is no licence to
 * honour and no attribution to carry.
 *
 * If a licensed track is bought later, this module is the only thing that has
 * to change: <MusicToggle> asks it to start and stop and to say whether it is
 * playing, and an <audio> element behind those three calls would be a much
 * smaller file than this one.
 *
 * ## What it plays
 *
 * Robot electro at 116bpm in A minor — slower and more syncopated than
 * four-to-the-floor, which is what makes it move rather than march:
 *
 * - An electro kick that skips the third beat, with the snare answering on the
 *   backbeat, hats on eighths and one open hat at the end of the bar.
 * - A staccato sixteenth bass that jumps the octave — the figure the whole
 *   thing walks on.
 * - Ring-modulated bleeps: a square carrier multiplied by a sine at two and a
 *   half times its pitch, which is where the metal in a robot voice comes from.
 * - A pad chopped into eighths and pushed through three formant filters, so it
 *   speaks a vowel instead of holding a chord. The vowel changes each bar.
 *
 * Four bars, then it turns over, with a filter opening across the loop.
 *
 * ## On by default, and what a browser will actually allow
 *
 * No browser will start audio on trust: it is refused until the visitor has
 * interacted with the page, and no flag changes that — the context stays
 * suspended and nothing is heard. So `initMusic` tries immediately, checks
 * whether the context really reached `running`, and if it did not, waits for
 * the first press or keystroke and starts then.
 *
 * Because it starts itself, turning it off is remembered under `raptor-sound`
 * in `localStorage`, or every link followed would start it again. Absent means
 * on, which is the default asked for.
 *
 * ## It belongs to the page it is playing on
 *
 * The music is the hero's, not the site's: leaving the page stops it, and the
 * next page starts its own. That is why the hero that mounts `acquires` the
 * music and releases it on the way out.
 *
 * The state still lives in this module rather than in component state, because
 * a Web Audio graph is not something to rebuild on every render — but the
 * module is a device the page borrows, not a player that outlives it.
 *
 * The acquire carries a token, and a release only stops the music if that
 * token is still the owner. Next normally unmounts the old page before
 * mounting the new one, which gives the intended stop-and-restart; if it ever
 * overlaps them the other way round, the token means the new page's music is
 * not torn down by the old page's cleanup. Continuing seamlessly is a far
 * better failure than silence.
 */

const BPM = 116
const STEPS_PER_BEAT = 4
const SECONDS_PER_STEP = 60 / BPM / STEPS_PER_BEAT
/** Four bars of sixteenths. */
const LOOP_STEPS = 64
const LOOKAHEAD_SECONDS = 0.12
const TICK_MS = 25

/** Modest: this plays under a headline, not at a party. */
const VOLUME = 0.28
const FADE_IN = 0.8
/** Short, so pressing stop reads as stopping rather than as fading. */
const FADE_OUT = 0.18

/** Where the visitor's answer is kept. Absent means on. */
const SOUND_KEY = 'raptor-sound'

/**
 * Events that count as a user activation. Scrolling is not one of them as far
 * as the autoplay policy is concerned, so listening for it would fail the same
 * way loading does.
 */
const GESTURES = ['pointerdown', 'keydown', 'touchstart'] as const

/** A minor. Bass an octave and two below the bleeps. */
const A1 = 55
const C2 = 65.41
const E2 = 82.41
const G1 = 49
const G2 = 98
const A2 = 110
const G3 = 196
const A3 = 220
const C4 = 261.63
const E4 = 329.63
const G4 = 392
const A4 = 440
const C5 = 523.25
const D5 = 587.33
const E5 = 659.25

/** The electro kick: on the one, the back of two, and the front of three. */
const KICK_STEPS = [0, 6, 10] as const
/** Snare on the backbeat. */
const SNARE_STEPS = [4, 12] as const

/** Sixteenths, `null` a rest. The octave jumps are the point. */
const BASS: readonly (number | null)[] = [
  A1, null, A1, A2,
  null, A1, null, A1,
  G1, null, G2, null,
  C2, null, E2, A2,
]

/** Bleeps, one row per bar of the loop, so the four bars are not identical. */
const BLEEPS: readonly (readonly (number | null)[])[] = [
  [null, null, null, null, null, null, null, A4, null, null, null, null, null, null, null, C5],
  [null, null, null, E5, null, null, null, A4, null, null, null, G4, null, null, null, E4],
  [null, null, null, null, null, C5, null, D5, null, null, null, null, null, A4, null, null],
  [null, E5, null, null, null, C5, null, null, null, A4, null, null, null, G4, null, null],
]

/** The chopped pad's root, one per bar. */
const PAD_ROOTS = [A3, A3, G3, C4] as const

/**
 * Three formants make a vowel. Alternating them bar to bar is what stops the
 * pad sounding like a held chord and starts it sounding like a word.
 */
const VOWELS: readonly (readonly [number, number, number])[] = [
  [720, 1240, 2540],
  [400, 1700, 2380],
]

type Listener = (playing: boolean) => void

let ctx: AudioContext | null = null
let master: GainNode | null = null
let bleepBus: BiquadFilterNode | null = null
let delaySend: GainNode | null = null
let noise: AudioBuffer | null = null

let timer: number | null = null
let nextStepTime = 0
let step = 0
let playing = false
/** Set while waiting for the first gesture, so it is only ever armed once. */
let disarm: (() => void) | null = null
let started = false
/**
 * True while a start is in flight. `startMusic` awaits the context resuming,
 * and two overlapping calls would both sail past the `playing` check and leave
 * two schedulers running against one timer handle — one of them orphaned. That
 * happens for real: where autoplay was refused, the first press is both the
 * gesture that releases audio and the click on this very button.
 */
let starting = false
/** The hero currently holding the music. See the note about tokens above. */
let owner: symbol | null = null

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

/** Two seconds of white noise, reused by the hats and the snare. */
function noiseBuffer(audio: AudioContext) {
  const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function build() {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return false
  const audio = new Ctor()

  const out = audio.createGain()
  out.gain.value = 0

  // A soft curve on the way out, so a busy bar rounds over rather than clips.
  const limiter = audio.createWaveShaper()
  const curve = new Float32Array(1024)
  for (let i = 0; i < curve.length; i++) {
    const x = (i / (curve.length - 1)) * 2 - 1
    curve[i] = Math.tanh(x * 1.5) / Math.tanh(1.5)
  }
  limiter.curve = curve
  out.connect(limiter)
  limiter.connect(audio.destination)

  // The bleeps' own filter, swept across the loop. Gentle Q: resonance here is
  // what makes a synth line shrill, and this one plays under text.
  const filter = audio.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 1400
  filter.Q.value = 3.5
  filter.connect(out)

  // A dotted-eighth delay, which is the echo electro is built on.
  const delay = audio.createDelay(1)
  delay.delayTime.value = SECONDS_PER_STEP * 3
  const feedback = audio.createGain()
  feedback.gain.value = 0.3
  const damp = audio.createBiquadFilter()
  damp.type = 'lowpass'
  damp.frequency.value = 2600
  const send = audio.createGain()
  send.gain.value = 0.3
  send.connect(delay)
  delay.connect(damp)
  damp.connect(feedback)
  feedback.connect(delay)
  damp.connect(out)

  ctx = audio
  master = out
  bleepBus = filter
  delaySend = send
  noise = noiseBuffer(audio)
  return true
}

function kick(audio: AudioContext, at: number, to: GainNode) {
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(96, at)
  osc.frequency.exponentialRampToValueAtTime(42, at + 0.11)
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.9, at + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.42)
  osc.connect(gain)
  gain.connect(to)
  osc.start(at)
  osc.stop(at + 0.45)
}

function snare(audio: AudioContext, at: number, to: GainNode) {
  if (!noise) return
  const source = audio.createBufferSource()
  source.buffer = noise
  const band = audio.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.value = 1900
  band.Q.value = 0.9
  const gain = audio.createGain()
  gain.gain.setValueAtTime(0.13, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)
  source.connect(band)
  band.connect(gain)
  gain.connect(to)
  source.start(at, Math.random())
  source.stop(at + 0.2)

  // A tuned body under the noise, which is what separates a snare from a hiss.
  const body = audio.createOscillator()
  const bodyGain = audio.createGain()
  body.type = 'triangle'
  body.frequency.setValueAtTime(320, at)
  body.frequency.exponentialRampToValueAtTime(180, at + 0.09)
  bodyGain.gain.setValueAtTime(0.09, at)
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, at + 0.1)
  body.connect(bodyGain)
  bodyGain.connect(to)
  body.start(at)
  body.stop(at + 0.12)
}

function hat(audio: AudioContext, at: number, to: GainNode, open: boolean) {
  if (!noise) return
  const source = audio.createBufferSource()
  source.buffer = noise
  source.playbackRate.value = 1.5
  const high = audio.createBiquadFilter()
  high.type = 'highpass'
  high.frequency.value = 8600
  const gain = audio.createGain()
  const decay = open ? 0.16 : 0.03
  gain.gain.setValueAtTime(open ? 0.05 : 0.032, at)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay)
  source.connect(high)
  high.connect(gain)
  gain.connect(to)
  source.start(at, Math.random())
  source.stop(at + decay + 0.02)
}

/** Staccato square with a sub under it: the figure the track walks on. */
function bass(audio: AudioContext, at: number, to: GainNode, freq: number) {
  const osc = audio.createOscillator()
  const sub = audio.createOscillator()
  const low = audio.createBiquadFilter()
  const gain = audio.createGain()
  osc.type = 'square'
  osc.frequency.value = freq
  sub.type = 'sine'
  sub.frequency.value = freq / 2
  low.type = 'lowpass'
  // A little envelope on the filter is what gives each note its click.
  low.frequency.setValueAtTime(1500, at)
  low.frequency.exponentialRampToValueAtTime(380, at + 0.07)
  low.Q.value = 3
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(0.2, at + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.13)
  osc.connect(low)
  sub.connect(low)
  low.connect(gain)
  gain.connect(to)
  osc.start(at)
  sub.start(at)
  osc.stop(at + 0.15)
  sub.stop(at + 0.15)
}

/**
 * A ring-modulated bleep: the carrier's amplitude is driven by another
 * oscillator at an unrelated pitch, which is the sound of a robot rather than
 * of a synth. The gain node's own value is the dry part left in the mix.
 */
function bleep(
  audio: AudioContext,
  at: number,
  to: BiquadFilterNode,
  send: GainNode,
  freq: number,
) {
  const carrier = audio.createOscillator()
  const modulator = audio.createOscillator()
  const ring = audio.createGain()
  const env = audio.createGain()

  carrier.type = 'square'
  carrier.frequency.value = freq
  modulator.type = 'sine'
  modulator.frequency.value = freq * 2.5
  // 0.45 dry, the rest multiplied by the modulator.
  ring.gain.value = 0.45
  modulator.connect(ring.gain)

  env.gain.setValueAtTime(0.0001, at)
  env.gain.exponentialRampToValueAtTime(0.075, at + 0.005)
  env.gain.exponentialRampToValueAtTime(0.0001, at + 0.19)

  carrier.connect(ring)
  ring.connect(env)
  env.connect(to)
  env.connect(send)

  carrier.start(at)
  modulator.start(at)
  carrier.stop(at + 0.21)
  modulator.stop(at + 0.21)
}

/**
 * One chop of the pad. A sawtooth through three parallel bandpass filters is
 * the cheap way to a vowel, and chopping it in eighths is what makes the pad
 * speak rather than hold.
 */
function vox(
  audio: AudioContext,
  at: number,
  to: GainNode,
  freq: number,
  formants: readonly [number, number, number],
) {
  const osc = audio.createOscillator()
  const env = audio.createGain()
  osc.type = 'sawtooth'
  osc.frequency.value = freq
  // A touch of drift, so it is not a dead tone.
  osc.detune.setValueAtTime(-6, at)
  osc.detune.linearRampToValueAtTime(6, at + 0.2)

  env.gain.setValueAtTime(0.0001, at)
  env.gain.linearRampToValueAtTime(0.055, at + 0.02)
  env.gain.exponentialRampToValueAtTime(0.0001, at + 0.17)

  formants.forEach((frequency, index) => {
    const band = audio.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = frequency
    band.Q.value = 9
    const level = audio.createGain()
    level.gain.value = index === 0 ? 1 : index === 1 ? 0.6 : 0.32
    osc.connect(band)
    band.connect(level)
    level.connect(env)
  })

  env.connect(to)
  osc.start(at)
  osc.stop(at + 0.2)
}

function scheduleStep(index: number, at: number) {
  if (!ctx || !master || !bleepBus || !delaySend) return
  const inBar = index % 16
  const bar = Math.floor(index / 16)

  if (KICK_STEPS.includes(inBar as (typeof KICK_STEPS)[number])) kick(ctx, at, master)
  // The last bar pushes an extra kick, which is what makes the loop turn over.
  if (bar === 3 && inBar === 14) kick(ctx, at, master)
  if (SNARE_STEPS.includes(inBar as (typeof SNARE_STEPS)[number])) snare(ctx, at, master)
  if (inBar % 2 === 0) hat(ctx, at, master, false)
  if (inBar === 14) hat(ctx, at, master, true)

  const bassNote = BASS[inBar]
  if (bassNote) bass(ctx, at, master, bassNote)

  const bleepNote = BLEEPS[bar][inBar]
  if (bleepNote) bleep(ctx, at, bleepBus, delaySend, bleepNote)

  // The pad speaks on eighths, and sits out the first bar so the loop opens
  // on the beat alone.
  if (bar > 0 && inBar % 2 === 0) {
    vox(ctx, at, master, PAD_ROOTS[bar], VOWELS[bar % VOWELS.length])
  }

  // One filter sweep across the whole four bars.
  const through = index / LOOP_STEPS
  const cutoff = 1100 + 2200 * (0.5 - 0.5 * Math.cos(through * Math.PI * 2))
  bleepBus.frequency.setTargetAtTime(cutoff, at, 0.1)
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
 * Starts the loop, and says whether it actually started. Browsers refuse audio
 * outside a user gesture, and refuse it quietly: the context simply stays
 * suspended, so this checks rather than assumes.
 */
export async function startMusic(): Promise<boolean> {
  if (playing) return true
  if (starting) return false
  starting = true
  try {
    return await begin()
  } finally {
    starting = false
  }
}

async function begin(): Promise<boolean> {
  if (!ctx && !build()) return false
  if (!ctx || !master) return false

  await ctx.resume().catch(() => undefined)
  if (ctx.state !== 'running') return false

  // Belt and braces: never leave a scheduler behind.
  if (timer !== null) window.clearInterval(timer)

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
 * Takes the music for a hero and starts it, unless the visitor has said
 * otherwise — now if the browser allows it, at their first press or keystroke
 * if not. Pass the same token to `releaseMusic` when the hero goes away.
 */
export function acquireMusic(token: symbol) {
  owner = token
  started = false
  initMusic()
}

/**
 * Gives the music back when the hero unmounts, which is what stops it on the
 * way to another page. A release from a hero that no longer owns the music
 * does nothing.
 */
export function releaseMusic(token: symbol) {
  if (owner !== token) return
  owner = null
  disarm?.()
  stopMusic()
  started = false
}

function initMusic() {
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

/** Fades out fast, stops scheduling, and lets the context idle. */
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
  window.setTimeout(
    () => {
      if (!playing) audio.suspend().catch(() => undefined)
    },
    FADE_OUT * 1000 + 100,
  )
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
