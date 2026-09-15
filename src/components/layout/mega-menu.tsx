'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import { ChevronDown } from 'lucide-react'
import { NAV_GROUPS, NAV_MENUS, isCurrentPage, isWithinSection, type NavLink } from '@/lib/navigation'
import { cn } from '@/lib/utils'

/** The trigger of the menu holding the current page: brighter, with a signal rule under it. */
const ACTIVE_TRIGGER =
  'text-steel-100 after:pointer-events-none after:absolute after:inset-x-2 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-signal'

/** A menu entry, ruled and tinted when it is the page being viewed. */
function linkClass(active: boolean) {
  return cn(
    'block rounded-ui border-l-2 px-3 py-2.5 transition-colors duration-200 hover:bg-bg-2 hover:shadow-soft',
    active ? 'border-signal bg-bg-2' : 'border-transparent',
  )
}

function MenuLinkLabel({ link, active }: { link: NavLink; active: boolean }) {
  return (
    <>
      <span
        className={cn(
          'flex flex-wrap items-center gap-x-2 text-[0.9375rem]',
          active ? 'text-signal' : 'text-steel-100',
        )}
      >
        {link.label}
        {active ? (
          <span className="rounded-full border border-signal/40 px-1.5 text-[0.625rem] uppercase tracking-[0.12em]">
            You are here
          </span>
        ) : null}
      </span>
      <span className="mt-0.5 block text-[0.8125rem] leading-snug text-steel-500">{link.description}</span>
    </>
  )
}

export function MegaMenu() {
  const pathname = usePathname()
  return (
    <NavigationMenu.Root className="relative hidden xl:flex" delayDuration={80}>
      <NavigationMenu.List className="flex items-center gap-0.5">
        {NAV_GROUPS.map((group) => {
          const groupActive =
            isWithinSection(pathname, group.href) ||
            group.links.some((link) => isWithinSection(pathname, link.href))
          const overviewActive = isCurrentPage(pathname, group.href)
          return (
          <NavigationMenu.Item key={group.label}>
            <NavigationMenu.Trigger
              className={cn(
                'relative',
                groupActive && ACTIVE_TRIGGER,
                // px-2 rather than px-2.5: the 64px logo spends ~36px more of
                // the menu bar's horizontal budget than the 48px one did, and
                // at 1280 that budget was already down to single digits. Four
                // pixels back across seven triggers buys 28px — enough that
                // "Developers" clears the search control again with room over.
                // Smaller type and padding below 2xl: with Gallery in the bar,
                // 1280 no longer has room for eight triggers at full size.
                'group inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-ui px-1.5 text-[0.875rem] text-steel-300 2xl:px-2 2xl:text-[0.9375rem]',
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
                      aria-current={overviewActive ? 'page' : undefined}
                      className={cn(
                        'text-[0.9375rem] font-medium hover:text-signal',
                        overviewActive ? 'text-signal' : 'text-steel-100',
                      )}
                    >
                      {group.label} overview
                    </Link>
                    <p className="text-[0.875rem] leading-relaxed text-steel-500">{group.blurb}</p>
                  </div>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {group.links.map((link) => {
                      const active = isCurrentPage(pathname, link.href)
                      return (
                        <li key={link.href}>
                          <NavigationMenu.Link asChild active={active}>
                            <Link
                              href={link.href}
                              aria-current={active ? 'page' : undefined}
                              className={linkClass(active)}
                            >
                              <MenuLinkLabel link={link} active={active} />
                            </Link>
                          </NavigationMenu.Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          )
        })}
        {NAV_MENUS.map((menu) => {
          const menuActive = menu.links.some((link) => isCurrentPage(pathname, link.href))
          return (
          // Relative, so the compact panel hangs under its own trigger rather
          // than from the left edge of the bar like the mega panels do.
          <NavigationMenu.Item key={menu.label} className="relative">
            <NavigationMenu.Trigger
              className={cn(
                'relative',
                menuActive && ACTIVE_TRIGGER,
                'group inline-flex h-9 shrink-0 items-center gap-1 whitespace-nowrap rounded-ui px-1.5 text-[0.875rem] text-steel-300 2xl:px-2 2xl:text-[0.9375rem]',
                'transition-colors duration-200 hover:bg-bg-2 hover:text-steel-100 data-[state=open]:bg-bg-2 data-[state=open]:text-steel-100',
              )}
            >
              {menu.label}
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
              <ul className="surface-sheen flex w-72 flex-col gap-1 overflow-hidden rounded-panel border border-line-2 bg-bg-1 p-3 shadow-panel">
                {menu.links.map((link) => {
                  const active = isCurrentPage(pathname, link.href)
                  return (
                    <li key={link.href}>
                      <NavigationMenu.Link asChild active={active}>
                        <Link
                          href={link.href}
                          aria-current={active ? 'page' : undefined}
                          className={linkClass(active)}
                        >
                          <MenuLinkLabel link={link} active={active} />
                        </Link>
                      </NavigationMenu.Link>
                    </li>
                  )
                })}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          )
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  )
}
