'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { PortalFrame, type BrandConfig } from '@/components/frames/portal-frame'
import { Panel } from '@/components/ui/panel'
import { Section, SectionHeader } from '@/components/ui/section'
import { Button, ButtonLink } from '@/components/ui/button'

const SWATCHES = ['#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#0C0E12'] as const

/**
 * White-label demonstration. Colour and logo are applied in the browser only —
 * the file never leaves the page and nothing is uploaded anywhere.
 */
export function BrokersSection() {
  const [brand, setBrand] = useState<BrandConfig>({
    name: 'Your Brand',
    accent: SWATCHES[0],
    logoDataUrl: null,
  })
  const fileRef = useRef<HTMLInputElement>(null)

  function onLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBrand((previous) => ({ ...previous, logoDataUrl: reader.result as string }))
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <Section grid className="border-b border-line-1">
      <SectionHeader
        eyebrow="Broker solutions"
        title="Your brand. Your clients. Raptor underneath."
        lead="Your clients should see you. Change the colour and drop in a logo — the portal below re-skins as you type. Nothing is uploaded; it happens entirely in your browser."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-start">
        <Panel className="flex flex-col gap-6 p-6">
          <label className="flex flex-col gap-2">
            <span className="text-eyebrow uppercase text-steel-500">Brand name</span>
            <input
              value={brand.name}
              onChange={(event) => setBrand({ ...brand, name: event.target.value.slice(0, 24) })}
              className="rounded-ui border border-line-2 bg-bg-0 px-3 py-2 text-[0.9375rem] text-steel-100"
              aria-label="Brand name"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-eyebrow uppercase text-steel-500">Accent colour</span>
            <div className="flex flex-wrap items-center gap-2">
              {SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setBrand({ ...brand, accent: swatch })}
                  aria-label={`Use accent ${swatch}`}
                  aria-pressed={brand.accent === swatch}
                  className="h-7 w-7 rounded-full border-2 transition-transform duration-200 hover:scale-110"
                  style={{
                    backgroundColor: swatch,
                    borderColor: brand.accent === swatch ? 'var(--steel-100)' : 'transparent',
                  }}
                />
              ))}
              <label className="ml-1 inline-flex cursor-pointer items-center gap-2 text-[0.8125rem] text-steel-500 hover:text-steel-300">
                <input
                  type="color"
                  value={brand.accent}
                  onChange={(event) => setBrand({ ...brand, accent: event.target.value })}
                  className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                  aria-label="Custom accent colour"
                />
                Custom
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-eyebrow uppercase text-steel-500">Logo</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={onLogo}
              className="sr-only"
              aria-label="Upload a logo"
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
                <Upload size={14} strokeWidth={1.5} aria-hidden />
                Choose file
              </Button>
              {brand.logoDataUrl ? (
                <Button
                  variant="quiet"
                  size="sm"
                  onClick={() => setBrand({ ...brand, logoDataUrl: null })}
                >
                  <X size={14} strokeWidth={1.5} aria-hidden />
                  Remove
                </Button>
              ) : null}
            </div>
            <p className="text-[0.75rem] leading-relaxed text-steel-500">
              Read in the browser with FileReader. The file is never sent to a server.
            </p>
          </div>

          <ButtonLink href="/brokers/white-label" variant="ghost" size="sm">
            White label
          </ButtonLink>
        </Panel>

        <div className="lg:pl-4">
          <PortalFrame brand={brand} />
          <p className="mt-4 text-[0.8125rem] leading-relaxed text-steel-500">
            A simulated client portal, rendered as live components. In a real deployment this carries
            your domain, your transactional emails and your statement templates too.
          </p>
        </div>
      </div>
    </Section>
  )
}
