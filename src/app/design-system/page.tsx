import type { Metadata } from 'next'
import { Button, ButtonLink } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { ChromeText } from '@/components/ui/chrome-text'
import { CodeBlock } from '@/components/ui/code-block'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Panel } from '@/components/ui/panel'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { WingMark } from '@/components/ui/wing-mark'
import { Gauge } from '@/components/charts/gauge'
import { CorrelationHeatmap } from '@/components/charts/correlation-heatmap'
import { ExposureTreemap } from '@/components/charts/exposure-treemap'
import { EcosystemDiagram } from '@/components/diagrams/ecosystem-diagram'
import { EmilStatusCard } from '@/components/emil/emil-status-card'
import { RiskLine } from '@/components/layout/risk-line'
import { PortalFrame } from '@/components/frames/portal-frame'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Design system',
  description: 'Internal QA surface: every token, component and state in both themes.',
  path: '/design-system',
  noindex: true,
})

const BG_TOKENS = ['--bg-0', '--bg-1', '--bg-2', '--bg-3'] as const
const TEXT_TOKENS = ['--steel-100', '--steel-300', '--steel-500', '--steel-700'] as const
const SEMANTIC_TOKENS = ['--signal', '--up', '--down', '--armed', '--warn'] as const

export default function DesignSystemPage() {
  return (
    <div className="min-h-dvh bg-bg-0 pb-32">
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-line-1 bg-bg-1 px-6 py-4">
        <div className="flex items-center gap-4">
          <RaptorLogo size="sm" />
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-steel-500">
            Design system · noindex
          </span>
        </div>
        <ThemeToggle />
      </header>

      <div className="container-raptor flex flex-col gap-20 pt-14">
        <Block title="Colour tokens" note="Toggle the theme above. Every swatch is a CSS variable.">
          <div className="flex flex-col gap-6">
            <Swatches label="Surfaces" tokens={BG_TOKENS} />
            <Swatches label="Text" tokens={TEXT_TOKENS} />
            <Swatches label="Semantic" tokens={SEMANTIC_TOKENS} />
            <div>
              <Eyebrow>Chrome gradient</Eyebrow>
              <div className="mt-2 h-16 rounded-card bg-chrome" />
            </div>
          </div>
        </Block>

        <Block title="Type scale">
          <div className="flex flex-col gap-6">
            <ChromeText as="h1" className="text-h1 uppercase">
              H1 chrome 128px
            </ChromeText>
            <h2 className="text-h2 uppercase text-steel-100">H2 uppercase 72px</h2>
            <h3 className="font-display text-[1.75rem] uppercase tracking-tight text-steel-100">
              H3 display 28px
            </h3>
            <Eyebrow>Eyebrow 11px · tracking 0.18em</Eyebrow>
            <p className="max-w-2xl text-body text-steel-300">
              Body 17px at 1.6 line height. The quick brown fox jumps over the lazy dog while the
              market opens in London and the spread on gold widens by two ticks.
            </p>
            <p className="font-mono text-data text-steel-300" data-numeric>
              Data 13px mono tabular · 1.08654 · 4419.44 · 79,649.7 · −0.38%
            </p>
          </div>
        </Block>

        <Block title="Buttons">
          <div className="flex flex-col gap-4">
            {(['lg', 'md', 'sm'] as const).map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size={size}>Primary</Button>
                <Button variant="ghost" size={size}>Ghost</Button>
                <Button variant="quiet" size={size}>Quiet</Button>
                <Button variant="danger" size={size}>Danger</Button>
                <Button variant="primary" size={size} disabled>Disabled</Button>
              </div>
            ))}
            <ButtonLink href="/design-system" variant="ghost">Button as link</ButtonLink>
          </div>
        </Block>

        <Block title="Chips">
          <div className="flex flex-wrap gap-3">
            <Chip>Steel</Chip>
            <Chip tone="signal" dot>Signal</Chip>
            <Chip tone="up" dot>Up</Chip>
            <Chip tone="down" dot>Down</Chip>
            <Chip tone="armed" dot>Armed</Chip>
            <Chip tone="warn" dot>Warn</Chip>
          </div>
        </Block>

        <Block title="Surfaces" note="Radius: 6px UI, 12px card, 20px panel.">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel className="p-6">
              <Eyebrow>Panel · card</Eyebrow>
              <p className="mt-2 text-[0.9375rem] text-steel-300">bg-1, hairline border.</p>
            </Panel>
            <Panel tone="raised" className="p-6">
              <Eyebrow>Panel · raised</Eyebrow>
              <p className="mt-2 text-[0.9375rem] text-steel-300">bg-2, elevated surface.</p>
            </Panel>
            <Panel tone="glass" size="panel" className="p-6">
              <Eyebrow>Panel · glass</Eyebrow>
              <p className="mt-2 text-[0.9375rem] text-steel-300">Backdrop blur, 20px radius.</p>
            </Panel>
          </div>
        </Block>

        <Block title="Form controls">
          <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <Eyebrow>Text input</Eyebrow>
              <input
                className="rounded-ui border border-line-2 bg-bg-0 px-3 py-2.5 text-[0.9375rem] text-steel-100"
                placeholder="Placeholder"
              />
            </label>
            <label className="flex flex-col gap-2">
              <Eyebrow>Select</Eyebrow>
              <select className="rounded-ui border border-line-2 bg-bg-0 px-3 py-2.5 text-[0.9375rem] text-steel-100">
                <option>Option one</option>
                <option>Option two</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <Eyebrow>Error state</Eyebrow>
              <input
                className="rounded-ui border border-down/60 bg-bg-0 px-3 py-2.5 text-[0.9375rem] text-steel-100"
                defaultValue="not-an-email"
              />
              <span className="text-[0.8125rem] text-down">Please enter a valid email address.</span>
            </label>
            <label className="flex flex-col gap-2">
              <Eyebrow>Range</Eyebrow>
              <input
                type="range"
                defaultValue={40}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-bg-3 accent-[var(--signal)]"
              />
            </label>
          </div>
        </Block>

        <Block title="Motifs">
          <div className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end gap-10">
              <RaptorLogo size="sm" />
              <RaptorLogo size="md" />
              <RaptorLogo size="lg" showTagline />
            </div>
            <div className="h-24 text-steel-700">
              <WingMark className="h-full w-full max-w-lg" />
            </div>
            <div className="grid-field h-28 rounded-card border border-line-2" />
          </div>
        </Block>

        <Block title="Charts">
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel className="p-6">
              <Eyebrow>Correlation heatmap</Eyebrow>
              <div className="mt-4">
                <CorrelationHeatmap />
              </div>
            </Panel>
            <div className="flex flex-col gap-6">
              <Panel className="p-6">
                <Eyebrow>Exposure treemap</Eyebrow>
                <div className="mt-4">
                  <ExposureTreemap />
                </div>
              </Panel>
              <Panel className="grid grid-cols-3 gap-4 p-6">
                <Gauge value={31} label="Signal" />
                <Gauge value={68} label="Warn" tone="warn" />
                <Gauge value={92} label="Down" tone="down" />
              </Panel>
            </div>
          </div>
        </Block>

        <Block title="Diagrams">
          <EcosystemDiagram />
        </Block>

        <Block title="EMIL surfaces">
          <div className="max-w-md">
            <EmilStatusCard awake />
          </div>
        </Block>

        <Block title="Frames">
          <div className="max-w-xl">
            <PortalFrame brand={{ name: 'Your Brand', accent: '#0EA5E9', logoDataUrl: null }} />
          </div>
        </Block>

        <Block title="Code">
          <CodeBlock
            label="REST"
            code={'curl -X POST https://api.777raptor.example/v1/orders \\\n  -H "Authorization: Bearer rk_live_EXAMPLE_KEY"'}
          />
        </Block>

        <Block title="Compliance surfaces">
          <RiskLine />
        </Block>
      </div>
    </div>
  )
}

function Block({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 border-b border-line-2 pb-3">
        <h2 className="font-display text-[1.375rem] uppercase tracking-tight text-steel-100">
          {title}
        </h2>
        {note ? <p className="text-[0.875rem] text-steel-500">{note}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Swatches({ label, tokens }: { label: string; tokens: readonly string[] }) {
  return (
    <div>
      <Eyebrow>{label}</Eyebrow>
      <div className="mt-2 flex flex-wrap gap-3">
        {tokens.map((token) => (
          <div key={token} className="flex w-28 flex-col gap-1.5">
            <div
              className="h-16 rounded-card border border-line-2"
              style={{ background: `var(${token})` }}
            />
            <span className="font-mono text-[0.625rem] text-steel-500">{token}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
