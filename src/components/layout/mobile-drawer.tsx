'use client'

import { useState } from 'react'
import Link from 'next/link'
import * as Dialog from '@radix-ui/react-dialog'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { NAV_GROUPS } from '@/lib/navigation'
import { ButtonLink } from '@/components/ui/button'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function MobileDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="inline-flex h-10 w-10 items-center justify-center rounded-ui border border-line-2 text-steel-300 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} strokeWidth={1.5} aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg-0/80 backdrop-blur-sm lg:hidden" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col bg-bg-0 lg:hidden">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <div className="flex items-center justify-between border-b border-line-1 px-5 py-4">
            <RaptorLogo size="sm" />
            <Dialog.Close
              className="inline-flex h-10 w-10 items-center justify-center rounded-ui border border-line-2 text-steel-300"
              aria-label="Close navigation"
            >
              <X size={18} strokeWidth={1.5} aria-hidden />
            </Dialog.Close>
          </div>

          <div className="scroll-steel flex-1 overflow-y-auto px-5 py-4">
            <Accordion.Root type="multiple" className="flex flex-col">
              {NAV_GROUPS.map((group) => (
                <Accordion.Item key={group.label} value={group.label} className="border-b border-line-1">
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                      <span className="font-display text-[1.125rem] uppercase tracking-tight text-steel-100">
                        {group.label}
                      </span>
                      <ChevronDown
                        size={16}
                        strokeWidth={1.5}
                        aria-hidden
                        className="text-steel-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden pb-3">
                    <ul className="flex flex-col gap-0.5">
                      <li>
                        <Link
                          href={group.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-ui px-3 py-2.5 text-[0.9375rem] text-signal"
                        >
                          {group.label} overview
                        </Link>
                      </li>
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="block rounded-ui px-3 py-2.5 text-[0.9375rem] text-steel-300"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>

          <div className="flex flex-col gap-3 border-t border-line-1 px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow uppercase text-steel-500">Theme</span>
              <ThemeToggle />
            </div>
            <ButtonLink href="/request-demo" variant="ghost" size="lg" onClick={() => setOpen(false)}>
              Request Demo
            </ButtonLink>
            <ButtonLink href="/experience" variant="primary" size="lg" onClick={() => setOpen(false)}>
              Experience Raptor
            </ButtonLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
