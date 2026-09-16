import { ButtonLink } from '@/components/ui/button'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { SwingBackdrop } from '@/components/backdrops/swing-backdrop'
import { PuppetBackdrop } from '@/components/backdrops/puppet-backdrop'
import { BloomBackdrop } from '@/components/backdrops/bloom-backdrop'
import { SwarmBackdrop } from '@/components/backdrops/swarm-backdrop'
import { CityBackdrop } from '@/components/backdrops/city-backdrop'
import { KnotBackdrop } from '@/components/backdrops/knot-backdrop'
import { DriftBackdrop } from '@/components/backdrops/drift-backdrop'
import { LazyMorph } from '@/components/backdrops/lazy-morph'
import { LazySingularity } from '@/components/backdrops/lazy-singularity'
import { GravityBackdrop } from '@/components/backdrops/gravity-backdrop'
import { ExploderBackdrop } from '@/components/backdrops/exploder-backdrop'
import { BurstsBackdrop } from '@/components/backdrops/bursts-backdrop'
import { LightburstBackdrop } from '@/components/backdrops/lightburst-backdrop'
import { DancersBackdrop } from '@/components/backdrops/dancers-backdrop'
import { LazyPyramids } from '@/components/backdrops/lazy-pyramids'
import { TunnelBackdrop } from '@/components/backdrops/tunnel-backdrop'
import { RiverBackdrop } from '@/components/backdrops/river-backdrop'
import { RegionsBackdrop } from '@/components/backdrops/regions-backdrop'
import { CipherBackdrop } from '@/components/backdrops/cipher-backdrop'
import { HandshakeBackdrop } from '@/components/backdrops/handshake-backdrop'
import { AttentionBackdrop } from '@/components/backdrops/attention-backdrop'
import { ConstellationBackdrop } from '@/components/backdrops/constellation-backdrop'
import { BlackholeBackdrop } from '@/components/backdrops/blackhole-backdrop'
import { SwitchboardBackdrop } from '@/components/backdrops/switchboard-backdrop'
import { SandboxBackdrop } from '@/components/backdrops/sandbox-backdrop'
import { LazyTube } from '@/components/backdrops/lazy-tube'
import { LazyAnomaly } from '@/components/backdrops/lazy-anomaly'
import { OrbBackdrop } from '@/components/backdrops/orb-backdrop'
import { LazyAura } from '@/components/backdrops/lazy-aura'
import { TidesBackdrop } from '@/components/backdrops/tides-backdrop'
import { LazyReactor } from '@/components/backdrops/lazy-reactor'
import { AttractionBackdrop } from '@/components/backdrops/attraction-backdrop'
import { LazyExplosion } from '@/components/backdrops/lazy-explosion'
import { TwinkleBackdrop } from '@/components/backdrops/twinkle-backdrop'
import { DiamondBackdrop } from '@/components/backdrops/diamond-backdrop'
import { ColorburstBackdrop } from '@/components/backdrops/colorburst-backdrop'
import { ParticulesBackdrop } from '@/components/backdrops/particules-backdrop'
import { LazyBoxtunnel } from '@/components/backdrops/lazy-boxtunnel'
import { SquaresBackdrop } from '@/components/backdrops/squares-backdrop'
import { LazyLion } from '@/components/backdrops/lazy-lion'
import { SillystringBackdrop } from '@/components/backdrops/sillystring-backdrop'
import { IntercosmicBackdrop } from '@/components/backdrops/intercosmic-backdrop'
import { NoisycirclesBackdrop } from '@/components/backdrops/noisycircles-backdrop'
import { LazyRacinglines } from '@/components/backdrops/lazy-racinglines'
import { LazyZeropoint } from '@/components/backdrops/lazy-zeropoint'
import { WarpBackdrop } from '@/components/backdrops/warp-backdrop'
import { CosmicBackdrop } from '@/components/backdrops/cosmic-backdrop'
import { LazyVelocity } from '@/components/backdrops/lazy-velocity'
import { LazyBreach } from '@/components/backdrops/lazy-breach'
import { ExecutionBackdrop } from '@/components/backdrops/execution-backdrop'
import { HeroImage } from './hero-image'
import { RiskLine } from './risk-line'
import type { FiveAnswers, Module, NextStep, PageCopy } from '@/lib/copy/types'
import { cn } from '@/lib/utils'

/**
 * Every hero backdrop the site has. `image` is the themed wash; the rest are a
 * scene per page.
 *
 * The broker and platform bands are ported CodePen scenes, each credited in
 * its own file. From `tunnel` onward they are written for this site: the
 * technology family draws that page's own subject — the routing, the stack,
 * the round trip, the regions, the ciphertext, the handshake — which is what
 * makes them worth having rather than decoration. The developer and company
 * bands from `blackhole` on are ports again, credited in their files like the
 * rest.
 *
 * `singularity` is the one that appears twice: it closes the home page, and
 * the white-label hero asks for the same scene. It is the same component in
 * both places, mounted once per page.
 */
export type PenBackdrop =
  | 'image'
  | 'swing'
  | 'puppet'
  | 'bloom'
  | 'swarm'
  | 'city'
  | 'knot'
  | 'drift'
  | 'morph'
  | 'singularity'
  | 'gravity'
  | 'exploder'
  | 'bursts'
  | 'lightburst'
  | 'dancers'
  | 'pyramids'
  | 'tunnel'
  | 'river'
  | 'regions'
  | 'cipher'
  | 'handshake'
  | 'attention'
  | 'constellation'
  | 'blackhole'
  | 'switchboard'
  | 'sandbox'
  | 'tube'
  | 'anomaly'
  | 'orb'
  | 'aura'
  | 'tides'
  | 'reactor'
  | 'attraction'
  | 'explosion'
  | 'twinkle'
  | 'diamond'
  | 'colorburst'
  | 'particules'
  | 'boxtunnel'
  | 'squares'
  | 'lion'
  | 'sillystring'
  | 'intercosmic'
  | 'noisycircles'
  | 'racinglines'
  | 'zeropoint'
  | 'warp'
  | 'cosmic'
  | 'velocity'
  | 'breach'
  | 'execution'

/** Shared hue cycle for grids that are not <Panel>-based. */
const TINT_CYCLE = ['tint-1', 'tint-2', 'tint-3', 'tint-4', 'tint-5', 'tint-6'] as const

export function PageHero({
  eyebrow,
  heading,
  lead,
  actions,
  imageVariant,
  backdrop = 'image',
  children,
}: {
  eyebrow: string
  heading: string
  lead: string
  /** Buttons under the lead. See `heroActions` in the copy types. */
  actions?: readonly NextStep[]
  /** `emil` prefers the cockpit render. Only read by the `image` backdrop. */
  imageVariant?: 'default' | 'emil'
  /** Each pen backs exactly one page; every other hero keeps the themed wash.
   *  Adding one is a new value here, a component, and one opt-in on the page —
   *  nothing else in the site changes. */
  backdrop?: PenBackdrop
  children?: React.ReactNode
}) {
  const pen = backdrop !== 'image'
  return (
    <section
      className={cn(
        'hero-band relative isolate overflow-hidden border-b border-line-1 pb-12 pt-14 md:pb-16 md:pt-20',
        // Every scene band is the same size, and centres its copy on that
        // height — the platform hero's proportions, so moving between pages
        // does not change the shape of the first screen. The scenes are drawn
        // to the band, so each one scales into it. The image hero keeps its
        // own, copy-sized height.
        pen && 'flex min-h-[38rem] flex-col justify-center md:min-h-[48rem]',
        // The Cosmic Anomaly's target nav sits at the foot of the band — under
        // the copy on a narrow one, which is padded to hold it.
        backdrop === 'anomaly' && 'pb-32 md:pb-32 lg:pb-16',
        // The orb's preset row sits under the copy.
        backdrop === 'orb' && 'pb-44 md:pb-44 lg:pb-36',
        // These keep a control or a hint along the foot of the band, clear of
        // the copy.
        backdrop === 'tides' && 'pb-28 md:pb-28 lg:pb-28',
        backdrop === 'reactor' && 'pb-24 md:pb-24 lg:pb-24',
        // The lion's one-line hint sits under the copy on a narrow band.
        backdrop === 'lion' && 'pb-28 md:pb-28 lg:pb-16',
        // Racing Lines is a view down two floors of lanes. Extra top padding,
        // because the EMIL Trade hero's own content outgrows the band.
        backdrop === 'racinglines' && 'md:pt-28 lg:pt-32',
        // Both pens assume a black ground, so the band they back stops
        // following the theme. Only that band — the image hero themes as it
        // always did.
        pen && 'force-dark bg-bg-0',
      )}
    >
      {backdrop === 'swing' ? <SwingBackdrop className="-z-10" /> : null}
      {/* No `-z-10` on this one: a negative z-index would make it a stacking
          context and trap its control panel behind the copy. It paints behind
          on DOM order instead. */}
      {backdrop === 'puppet' ? <PuppetBackdrop /> : null}
      {backdrop === 'bloom' ? <BloomBackdrop className="-z-10" /> : null}
      {backdrop === 'swarm' ? <SwarmBackdrop className="-z-10" /> : null}
      {backdrop === 'city' ? <CityBackdrop className="-z-10" /> : null}
      {backdrop === 'knot' ? <KnotBackdrop className="-z-10" /> : null}
      {backdrop === 'drift' ? <DriftBackdrop className="-z-10" /> : null}
      {backdrop === 'morph' ? <LazyMorph className="-z-10" /> : null}
      {backdrop === 'singularity' ? <LazySingularity className="-z-10" /> : null}
      {backdrop === 'gravity' ? <GravityBackdrop className="-z-10" /> : null}
      {backdrop === 'exploder' ? <ExploderBackdrop className="-z-10" /> : null}
      {backdrop === 'bursts' ? <BurstsBackdrop className="-z-10" /> : null}
      {backdrop === 'lightburst' ? <LightburstBackdrop className="-z-10" /> : null}
      {backdrop === 'dancers' ? <DancersBackdrop className="-z-10" /> : null}
      {backdrop === 'pyramids' ? <LazyPyramids className="-z-10" /> : null}
      {backdrop === 'tunnel' ? <TunnelBackdrop className="-z-10" /> : null}
      {backdrop === 'river' ? <RiverBackdrop className="-z-10" /> : null}
      {backdrop === 'regions' ? <RegionsBackdrop className="-z-10" /> : null}
      {backdrop === 'cipher' ? <CipherBackdrop className="-z-10" /> : null}
      {backdrop === 'handshake' ? <HandshakeBackdrop className="-z-10" /> : null}
      {backdrop === 'attention' ? <AttentionBackdrop className="-z-10" /> : null}
      {backdrop === 'constellation' ? <ConstellationBackdrop className="-z-10" /> : null}
      {backdrop === 'blackhole' ? <BlackholeBackdrop className="-z-10" /> : null}
      {backdrop === 'switchboard' ? <SwitchboardBackdrop className="-z-10" /> : null}
      {backdrop === 'sandbox' ? <SandboxBackdrop className="-z-10" /> : null}
      {backdrop === 'tube' ? <LazyTube className="-z-10" /> : null}
      {backdrop === 'anomaly' ? <LazyAnomaly className="-z-10" /> : null}
      {backdrop === 'orb' ? <OrbBackdrop className="-z-10" /> : null}
      {backdrop === 'aura' ? <LazyAura className="-z-10" /> : null}
      {backdrop === 'tides' ? <TidesBackdrop className="-z-10" /> : null}
      {backdrop === 'reactor' ? <LazyReactor className="-z-10" /> : null}
      {backdrop === 'attraction' ? <AttractionBackdrop className="-z-10" /> : null}
      {backdrop === 'explosion' ? <LazyExplosion className="-z-10" /> : null}
      {backdrop === 'twinkle' ? <TwinkleBackdrop className="-z-10" /> : null}
      {backdrop === 'diamond' ? <DiamondBackdrop className="-z-10" /> : null}
      {backdrop === 'colorburst' ? <ColorburstBackdrop className="-z-10" /> : null}
      {backdrop === 'particules' ? <ParticulesBackdrop className="-z-10" /> : null}
      {backdrop === 'boxtunnel' ? <LazyBoxtunnel className="-z-10" /> : null}
      {backdrop === 'squares' ? <SquaresBackdrop className="-z-10" /> : null}
      {backdrop === 'lion' ? <LazyLion className="-z-10" /> : null}
      {backdrop === 'sillystring' ? <SillystringBackdrop className="-z-10" /> : null}
      {backdrop === 'intercosmic' ? <IntercosmicBackdrop className="-z-10" /> : null}
      {backdrop === 'noisycircles' ? <NoisycirclesBackdrop className="-z-10" /> : null}
      {backdrop === 'racinglines' ? <LazyRacinglines className="-z-10" /> : null}
      {backdrop === 'zeropoint' ? <LazyZeropoint className="-z-10" /> : null}
      {backdrop === 'warp' ? <WarpBackdrop className="-z-10" /> : null}
      {backdrop === 'cosmic' ? <CosmicBackdrop className="-z-10" /> : null}
      {backdrop === 'velocity' ? <LazyVelocity className="-z-10" /> : null}
      {backdrop === 'breach' ? <LazyBreach className="-z-10" /> : null}
      {backdrop === 'execution' ? <ExecutionBackdrop className="-z-10" /> : null}
      {pen ? null : <HeroImage variant={imageVariant ?? 'default'} />}
      {/* A scrim over the copy side of a pen band. It has to come after the
          backdrops to paint on top of them, since both sit at -z-10 and DOM
          order is what separates them there. The reason it exists is the
          buttons: a headline can hold its own against a busy scene because it
          is huge and bright, and a ghost-variant button — a thin border and a
          transparent middle — cannot. Two stops rather than a mid-point with
          an alpha, because these colours are CSS variables without an
          <alpha-value> and the opacity modifier does not reach them. */}
      {pen ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-full max-w-[52rem] bg-gradient-to-r from-bg-0 to-transparent"
        />
      ) : null}
      <div className="container-raptor relative">
        <div
          className={cn(
            'flex max-w-5xl flex-col gap-6',
            // The marionette is a figure with a control panel and has to be
            // cleared properly: a share of the column rather than a fixed cap,
            // because its column is a share too, so the gap holds at every
            // width instead of closing up at the bottom of the range. The
            // bloom needs no such berth — it is soft-edged, and overrunning
            // its bounds is the whole of what it does under the pointer.
            backdrop === 'puppet' && 'lg:max-w-[54%]',
            // The breach's orb and logo are centred at 72% across a wide band.
            backdrop === 'breach' && 'lg:max-w-[52%]',
            // The execution terminal is centred at 74% across a wide band.
            backdrop === 'execution' && 'lg:max-w-[46%]',
          )}
        >
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="text-hero uppercase text-chrome">{heading}</h1>
          <p className="max-w-2xl text-body text-steel-300">{lead}</p>
          {actions && actions.length > 0 ? (
            // Stacked and full width on a phone, a row from sm up.
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {actions.map((action) => (
                <ButtonLink
                  key={action.href}
                  href={action.href}
                  variant={action.variant ?? 'ghost'}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {action.label}
                </ButtonLink>
              ))}
            </div>
          ) : null}
        </div>
        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  )
}

const ANSWER_ROWS: readonly { key: keyof FiveAnswers; label: string }[] = [
  { key: 'what', label: 'What it is' },
  { key: 'who', label: 'Who it is for' },
  { key: 'why', label: 'Why it matters' },
  { key: 'connects', label: 'How it connects' },
  { key: 'next', label: 'What happens next' },
]

export function AnswerGrid({ answers }: { answers: FiveAnswers }) {
  return (
    <Section className="border-b border-line-1">
      <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {ANSWER_ROWS.map(({ key, label }, index) => (
          <div
            key={key}
            className={cn(
              'tint-rule flex flex-col gap-2.5 border-t-2 pt-5',
              TINT_CYCLE[index % TINT_CYCLE.length],
            )}
          >
            <dt className="tint-ink text-eyebrow uppercase">{label}</dt>
            <dd className="text-[1rem] leading-relaxed text-steel-300">{answers[key]}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

export function ModuleGrid({
  modules,
  eyebrow,
  heading,
  lead,
}: {
  modules: readonly Module[]
  eyebrow?: string
  heading: React.ReactNode
  lead?: string
}) {
  return (
    <Section className="border-b border-line-1">
      <SectionHeader eyebrow={eyebrow} title={heading} lead={lead} />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <Panel key={module.title} interactive tintIndex={index} className="flex flex-col gap-3 p-6">
            <span className="tint-ink font-mono text-[0.75rem] font-medium" data-numeric>
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-[1.1875rem] leading-snug text-steel-100">
              {module.title}
            </h3>
            <p className="text-[0.9375rem] leading-relaxed text-steel-300">{module.body}</p>
          </Panel>
        ))}
      </div>
    </Section>
  )
}

export function CtaBand({
  heading,
  body,
  actions,
}: {
  heading: string
  body: string
  actions: readonly NextStep[]
}) {
  return (
    <Section grid className="wash">
      <Panel
        tone="raised"
        size="panel"
        className="flex flex-col items-center gap-6 p-8 text-center md:p-12"
      >
        <h2 className="mx-auto max-w-5xl text-h2 uppercase text-steel-100">{heading}</h2>
        <p className="mx-auto max-w-4xl text-body text-steel-300">{body}</p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center">
          {actions.map((action) => (
            <ButtonLink
              key={action.href}
              href={action.href}
              variant={action.variant ?? 'ghost'}
              size="lg"
              className="w-full sm:w-auto"
            >
              {action.label}
            </ButtonLink>
          ))}
        </div>
      </Panel>
    </Section>
  )
}

/**
 * Standard product/company page. Bespoke sections are passed in as `children`
 * and render between the answer grid and the module grid, so every page can
 * carry at least one live component without duplicating the shell.
 */
export function StandardPage({
  copy,
  modulesHeading,
  heroBackdrop,
  children,
  className,
}: {
  copy: PageCopy
  modulesHeading?: React.ReactNode
  /** Passed through to <PageHero>; only the pages that carry a pen pass it. */
  heroBackdrop?: PenBackdrop
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <PageHero
        eyebrow={copy.eyebrow}
        heading={copy.heading}
        lead={copy.lead}
        actions={copy.heroActions}
        backdrop={heroBackdrop}
      />
      <AnswerGrid answers={copy.answers} />
      {children}
      {copy.modules.length > 0 ? (
        <ModuleGrid modules={copy.modules} heading={modulesHeading ?? 'What is inside'} />
      ) : null}
      {copy.showRiskLine ? (
        <div className="container-raptor pt-4">
          <RiskLine />
        </div>
      ) : null}
      <CtaBand heading={copy.ctaHeading} body={copy.ctaBody} actions={copy.ctaActions} />
    </div>
  )
}
