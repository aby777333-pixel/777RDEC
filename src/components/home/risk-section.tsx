'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import { OctagonX } from 'lucide-react'
import { ExposureTreemap } from '@/components/charts/exposure-treemap'
import { Gauge } from '@/components/charts/gauge'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { ButtonLink } from '@/components/ui/button'

export function RiskSection() {
  return (
    <Section className="border-b border-line-1">
      <SectionHeader
        eyebrow="Risk"
        title="Before you chase return, know your exposure."
        lead="Most damaging positions were not obviously large. They were correlated, concentrated, or held into a session that behaves differently. Raptor makes that shape visible, and puts the controls in the order path rather than in a policy document."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Panel className="p-6">
          <p className="mb-5 text-eyebrow uppercase text-steel-500">Exposure by asset class</p>
          <ExposureTreemap />
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel className="flex flex-col items-center gap-2 p-6">
            <Gauge
              value={31}
              label="Margin utilisation"
              caption="Simulated. 31% used, 69% headroom."
            />
          </Panel>

          <Panel className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1">
              <span className="text-eyebrow uppercase text-steel-500">Operator controls</span>
              <span className="text-[0.8125rem] leading-relaxed text-steel-500">
                A kill switch belongs where a human can reach it under pressure.
              </span>
            </div>

            <Tooltip.Provider delayDuration={120}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  {/* Disabled on the marketing site: this is a real control in the product. */}
                  <span className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-ui border border-down/40 px-4 py-2.5 text-[0.9375rem] text-down opacity-60">
                    <OctagonX size={15} strokeWidth={1.5} aria-hidden />
                    Close all positions
                  </span>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    sideOffset={8}
                    className="z-50 max-w-[16rem] rounded-ui border border-line-2 bg-bg-2 px-3 py-2 text-[0.8125rem] text-steel-300 shadow-panel"
                  >
                    Available in Raptor Risk Engine. Disabled on this page.
                    <Tooltip.Arrow className="fill-[var(--bg-2)]" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>

            <ButtonLink href="/platform/risk" variant="ghost" size="sm">
              Risk engine
            </ButtonLink>
          </Panel>
        </div>
      </div>
    </Section>
  )
}
