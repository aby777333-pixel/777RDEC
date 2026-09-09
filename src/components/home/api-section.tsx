'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { CodeBlock } from '@/components/ui/code-block'
import { Section, SectionHeader } from '@/components/ui/section'
import { ButtonLink } from '@/components/ui/button'
import { API_EXAMPLES } from '@/lib/copy/api-examples'
import { cn } from '@/lib/utils'

export function ApiSection() {
  const first = API_EXAMPLES[0]
  if (!first) return null

  return (
    <Section className="border-b border-line-1">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <SectionHeader
            eyebrow="API Hub"
            title="Connect everything."
            lead="If the platform can do it, the API can do it. Raptor exposes the same primitives its own surfaces are built on, across four transports, under one permission model."
          />
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/developers/sandbox" variant="primary">
              Request sandbox keys
            </ButtonLink>
            <ButtonLink href="/developers/api" variant="ghost">
              API reference
            </ButtonLink>
          </div>
        </div>

        <Tabs.Root defaultValue={first.id}>
          <Tabs.List
            aria-label="API transport"
            className="mb-3 flex gap-1 rounded-ui border border-line-2 bg-bg-1 p-1"
          >
            {API_EXAMPLES.map((example) => (
              <Tabs.Trigger
                key={example.id}
                value={example.id}
                className={cn(
                  'flex-1 rounded-[4px] px-3 py-1.5 text-[0.8125rem] transition-colors duration-200',
                  'text-steel-500 hover:text-steel-300',
                  'data-[state=active]:bg-bg-3 data-[state=active]:text-steel-100',
                )}
              >
                {example.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {API_EXAMPLES.map((example) => (
            <Tabs.Content key={example.id} value={example.id} className="focus-visible:outline-none">
              <CodeBlock code={example.code} label={`${example.label} example`} />
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>

      <p className="mt-6 text-[0.8125rem] text-steel-500">
        Hostnames, keys and identifiers in these examples are illustrative.
      </p>
    </Section>
  )
}
