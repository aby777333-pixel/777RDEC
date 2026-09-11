'use client'

import Link from 'next/link'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronDown } from 'lucide-react'
import { NAV_GROUPS } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function MegaMenu() {
  return (
    <NavigationMenu.Root className="relative hidden xl:flex" delayDuration={80}>
      <NavigationMenu.List className="flex items-center gap-0.5">
        {NAV_GROUPS.map((group) => (
          <NavigationMenu.Item key={group.label}>
            <NavigationMenu.Trigger
              className={cn(
                // px-2 rather than px-2.5: the 64px logo spends ~36px more of
                // the menu bar's horizontal budget than the 48px one did, and
                // at 1280 that budget was already down to single digits. Four
                // pixels back across seven triggers buys 28px — enough that
                // "Developers" clears the search control again with room over.
                'group inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-ui px-2 text-[0.9375rem] text-steel-300',
                'transition-colors duration-200 hover:bg-bg-2 hover:text-steel-100 data-[state=open]:bg-bg-2 data-[state=open]:text-steel-100',
              )}
            >
              {group.label}
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                aria-hidden
                className="text-steel-500 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              className={cn(
                'absolute left-0 top-full pt-3',
                'data-[motion=from-start]:animate-ticker-in data-[motion=from-end]:animate-ticker-in',
              )}
            >
              <div className="surface-sheen w-[min(46rem,calc(100vw-3rem))] overflow-hidden rounded-panel border border-line-2 bg-bg-1 shadow-panel">
                <div className="grid gap-6 p-6 md:grid-cols-[15rem_1fr]">
                  <div className="flex flex-col gap-2 border-line-1 md:border-r md:pr-6">
                    <Link
                      href={group.href}
                      className="text-[0.9375rem] font-medium text-steel-100 hover:text-signal"
                    >
                      {group.label} overview
                    </Link>
                    <p className="text-[0.875rem] leading-relaxed text-steel-500">{group.blurb}</p>
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <NavigationMenu.Link asChild>
                          <Link
                            href={link.href}
                            className="block rounded-ui px-3 py-2.5 transition-colors duration-200 hover:bg-bg-2 hover:shadow-soft"
                          >
                            <span className="block text-[0.9375rem] text-steel-100">{link.label}</span>
                            <span className="mt-0.5 block text-[0.8125rem] leading-snug text-steel-500">
                              {link.description}
                            </span>
                          </Link>
                        </NavigationMenu.Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
