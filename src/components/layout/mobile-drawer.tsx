'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import * as Accordion from '@radix-ui/react-accordion'
import { ChevronDown, Menu, X } from 'lucide-react'
import { NAV_GROUPS, NAV_MENUS, isCurrentPage, isWithinSection } from '@/lib/navigation'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/ui/button'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function MobileDrawer() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  /** Sections holding the page being viewed: marked, and opened when the drawer opens. */
  const activeSections = [
    ...NAV_GROUPS.filter(
      (group) =>
        isWithinSection(pathname, group.href) ||
        group.links.some((link) => isWithinSection(pathname, link.href)),
    ).map((group) => group.label),
    ...NAV_MENUS.filter((menu) => menu.links.some((link) => isCurrentPage(pathname, link.href))).map(
      (menu) => menu.label,
    ),
  ]
  const sectionLabel = (label: string) =>
    cn(
      'flex items-center gap-2.5 font-display text-[1.125rem] uppercase tracking-tight',
      activeSections.includes(label) ? 'text-signal' : 'text-steel-100',
    )
  const sectionMarker = (label: string) =>
    activeSections.includes(label) ? (
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden />
    ) : null
  /** A drawer entry, in signal on a raised row when it is the page being viewed. */
  const drawerLink = (href: string) =>
    cn(
      'block rounded-ui border-l-2 px-3 py-2.5 text-[0.9375rem]',
      isCurrentPage(pathname, href) ? 'border-signal bg-bg-2 text-signal' : 'border-transparent text-steel-300',
    )

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className="inline-flex h-10 w-10 items-center justify-center rounded-ui border border-line-2 text-steel-300 xl:hidden"
        aria-label="Open navigation"
      >
        <Menu size={18} strokeWidth={1.5} aria-hidden />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg-0/80 backdrop-blur-sm xl:hidden" />
        {/* h-dvh, not inset-0: on phones the browser's own toolbar covers the
            bottom of a full-height layout viewport, which cut off the last
            items. The dynamic viewport is the part actually on screen. */}
        <Dialog.Content className="fixed inset-x-0 top-0 z-50 flex h-dvh flex-col bg-bg-0 xl:hidden">
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

          <div className="scroll-steel min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
            <Accordion.Root type="multiple" defaultValue={activeSections} className="flex flex-col">
              {NAV_GROUPS.map((group) => (
                <Accordion.Item key={group.label} value={group.label} className="border-b border-line-1">
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                      <span className={sectionLabel(group.label)}>
                        {sectionMarker(group.label)}
                        {group.label}
                        {activeSections.includes(group.label) ? (
                          <span className="sr-only">(current section)</span>
                        ) : null}
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
                            aria-current={isCurrentPage(pathname, link.href) ? 'page' : undefined}
                            className={drawerLink(link.href)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
              {NAV_MENUS.map((menu) => (
                <Accordion.Item key={menu.label} value={menu.label} className="border-b border-line-1">
                  <Accordion.Header>
                    <Accordion.Trigger className="group flex w-full items-center justify-between py-4 text-left">
                      <span className={sectionLabel(menu.label)}>
                        {sectionMarker(menu.label)}
                        {menu.label}
                        {activeSections.includes(menu.label) ? (
                          <span className="sr-only">(current section)</span>
                        ) : null}
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
                      {menu.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            onClick={() => setOpen(false)}
                            aria-current={isCurrentPage(pathname, link.href) ? 'page' : undefined}
                            className={drawerLink(link.href)}
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

          <div className="flex flex-col gap-3 border-t border-line-1 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow uppercase text-steel-500">Theme</span>
              <ThemeToggle />
            </div>
            <ButtonLink href="/search" variant="ghost" size="lg" onClick={() => setOpen(false)}>
              Search
            </ButtonLink>
            <ButtonLink href="/platform" variant="ghost" size="lg" onClick={() => setOpen(false)}>
              Platform
            </ButtonLink>
            <ButtonLink href="/request-demo" variant="primary" size="lg" onClick={() => setOpen(false)}>
              Request Demo
            </ButtonLink>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
