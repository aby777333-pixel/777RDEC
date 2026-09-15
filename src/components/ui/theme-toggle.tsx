'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const

/**
 * Three-state theme control. Rendered as a segmented switch so the current
 * choice is always visible rather than guessed from an icon.
 *
 * "System" follows the device's own light or dark setting, so on a device set
 * to light it looks exactly like Light. To keep it from reading as a duplicate,
 * its tooltip names what the device is currently asking for, and while it is
 * selected a small sun or moon on the button shows which way it resolved.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-ui border border-line-2 bg-bg-1 p-0.5',
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value
        const isSystem = value === 'system'
        const deviceTheme = mounted && systemTheme ? systemTheme : null
        const title = isSystem
          ? `Match this device${deviceTheme ? ` (currently ${deviceTheme})` : ''}`
          : `${label} theme`
        const Resolved = deviceTheme === 'dark' ? Moon : Sun
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            title={title}
            className={cn(
              'relative inline-flex h-7 w-8 items-center justify-center rounded-[4px] transition-colors duration-200',
              active ? 'bg-bg-3 text-steel-100' : 'text-steel-500 hover:text-steel-300',
            )}
          >
            <Icon size={15} strokeWidth={1.5} aria-hidden />
            {isSystem && active && deviceTheme ? (
              <Resolved
                size={9}
                strokeWidth={2.25}
                aria-hidden
                className="absolute bottom-0.5 right-0.5 text-signal"
              />
            ) : null}
            <span className="sr-only">{title}</span>
          </button>
        )
      })}
    </div>
  )
}
