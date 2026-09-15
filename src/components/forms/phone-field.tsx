'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import type { CountryCode } from 'libphonenumber-js/min'
import {
  formatNational,
  guessPhoneCountry,
  isValidPhone,
  phoneCountries,
  splitInternational,
  toE164,
  type PhoneCountry,
} from '@/lib/forms/phone'
import { cn } from '@/lib/utils'

/**
 * Phone number with a searchable country code.
 *
 * The country button opens a list of every country that can be searched by
 * name, ISO code or dialling code ("india", "IN", "+91", "91"), and driven from
 * the keyboard — arrows to move, Enter to choose, Escape to close. The number
 * formats itself in that country's grouping as it is typed, and is checked
 * against the country's numbering plan when the field is left.
 *
 * What is submitted is `phone` in E.164 and `phoneCountry`. A number that does
 * not validate is still submitted as typed (with its dialling code), so the
 * server — which makes the final decision — can say exactly what is wrong.
 */
export function PhoneField({
  error,
  className,
}: {
  /** The server's message for this field, when the last submission had one. */
  error?: string
  className?: string
}) {
  const countries = useMemo(() => phoneCountries(), [])
  const [country, setCountry] = useState<CountryCode>('GB')
  const [national, setNational] = useState('')
  const [touched, setTouched] = useState(false)
  /** Whether the number has been edited since the server's message arrived. */
  const [editedSinceError, setEditedSinceError] = useState(false)
  useEffect(() => setEditedSinceError(false), [error])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  // The default country is the browser's region — read after mount so the
  // server render and the first client render agree.
  useEffect(() => setCountry(guessPhoneCountry()), [])

  const selected = countries.find((c) => c.code === country) ?? countries[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return countries
    const digits = q.replace(/[^\d]/g, '')
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase() === q ||
        (digits.length > 0 && c.dial.slice(1).startsWith(digits)),
    )
  }, [countries, query])

  useEffect(() => {
    // Every opening starts from a clear search, however the list was last closed.
    if (!open) {
      setQuery('')
      return
    }
    setHighlight(Math.max(0, countries.findIndex((c) => c.code === country)))
    window.requestAnimationFrame(() => searchRef.current?.focus())
    // Only when opening.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => setHighlight(0), [query])

  // Keep the highlighted option in view while arrowing through the list.
  useEffect(() => {
    if (!open) return
    const item = listRef.current?.children[highlight] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlight, open])

  // Close on a press outside.
  useEffect(() => {
    if (!open) return
    const onDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const choose = (next: PhoneCountry) => {
    setCountry(next.code)
    setNational((value) => formatNational(value, next.code))
    setEditedSinceError(true)
    setOpen(false)
    setQuery('')
    window.requestAnimationFrame(() => inputRef.current?.focus())
  }

  const onSearchKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlight((h) => Math.min(filtered.length - 1, h + 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const next = filtered[highlight]
      if (next) choose(next)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  const hasNumber = national.replace(/[^\d]/g, '').length > 0
  const valid = hasNumber && isValidPhone(national, country)
  const localError = touched && hasNumber && !valid ? 'This does not look like a valid number for the selected country.' : undefined
  // The server's message stands until the number is edited; after that the
  // live check speaks for the field.
  const shownError = localError ?? (editedSinceError ? undefined : error)
  const e164 = hasNumber ? (toE164(national, country) ?? `${selected?.dial ?? ''}${national.replace(/[^\d]/g, '')}`) : ''

  return (
    <div ref={rootRef} className={cn('relative flex flex-col gap-2', className)}>
      <label htmlFor="phoneNational" className="text-eyebrow uppercase text-steel-500">
        Phone
        <span className="ml-1.5 normal-case tracking-normal text-steel-700">(optional)</span>
      </label>

      <input type="hidden" name="phone" value={e164} />
      <input type="hidden" name="phoneCountry" value={country} />

      <div
        className={cn(
          'flex w-full items-stretch rounded-ui border bg-bg-0 transition-colors duration-200 focus-within:border-signal/60',
          shownError ? 'border-down/60' : 'border-line-2 hover:border-steel-700',
        )}
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={`Country code: ${selected?.name ?? ''} ${selected?.dial ?? ''}. Change`}
          className="flex shrink-0 items-center gap-1.5 rounded-l-ui border-r border-line-2 px-3 text-[0.9375rem] text-steel-100 transition-colors hover:bg-bg-2"
        >
          <span aria-hidden className="text-[1.05rem] leading-none">
            {selected?.flag}
          </span>
          <span className="font-mono text-[0.8125rem] text-steel-300" data-numeric>
            {selected?.dial}
          </span>
          <ChevronDown
            size={14}
            strokeWidth={1.5}
            aria-hidden
            className={cn('text-steel-500 transition-transform duration-200', open && 'rotate-180')}
          />
        </button>
        <input
          ref={inputRef}
          id="phoneNational"
          name="phoneNational"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="Phone number"
          value={national}
          onChange={(event) => {
            const typed = event.target.value
            setEditedSinceError(true)
            // A full international number (typed or pasted): take its country.
            const international = splitInternational(typed)
            if (international) {
              setCountry(international.country)
              setNational(international.national)
              return
            }
            // Deleting: leave the text as it is, so formatting never fights
            // the backspace key. Typing forwards: format in the country's
            // own grouping.
            if (typed.length < national.length) setNational(typed)
            else setNational(typed.trim().startsWith('+') ? typed : formatNational(typed, country))
          }}
          onBlur={() => setTouched(true)}
          aria-invalid={shownError ? true : undefined}
          aria-describedby={shownError ? 'phone-error' : undefined}
          className="min-w-0 flex-1 rounded-r-ui bg-transparent px-3 py-2.5 text-[0.9375rem] text-steel-100 outline-none placeholder:text-steel-700"
        />
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-ui border border-line-2 bg-bg-1 shadow-panel">
          <div className="flex items-center gap-2 border-b border-line-1 px-3">
            <Search size={14} strokeWidth={1.5} aria-hidden className="shrink-0 text-steel-500" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKey}
              placeholder="Search country or code"
              aria-label="Search countries"
              aria-controls={listId}
              aria-activedescendant={filtered[highlight] ? `${listId}-${filtered[highlight].code}` : undefined}
              role="combobox"
              aria-expanded
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-[0.9375rem] text-steel-100 outline-none placeholder:text-steel-700"
            />
          </div>
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label="Countries"
            className="scroll-steel max-h-64 overflow-y-auto overscroll-contain py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2.5 text-[0.875rem] text-steel-500">No country matches “{query}”.</li>
            ) : (
              filtered.map((c, index) => {
                const isSelected = c.code === country
                return (
                  <li
                    key={c.code}
                    id={`${listId}-${c.code}`}
                    role="option"
                    aria-selected={isSelected}
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => choose(c)}
                    onPointerMove={() => setHighlight(index)}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-[0.875rem]',
                      index === highlight ? 'bg-bg-2 text-steel-100' : 'text-steel-300',
                    )}
                  >
                    <span aria-hidden className="w-5 text-center text-[1rem] leading-none">
                      {c.flag}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-[0.75rem] text-steel-500" data-numeric>
                      {c.dial}
                    </span>
                    {isSelected ? <Check size={14} strokeWidth={1.75} aria-hidden className="text-signal" /> : null}
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}

      {shownError ? (
        <p id="phone-error" className="text-[0.8125rem] text-down">
          {shownError}
        </p>
      ) : valid ? (
        <p className="text-[0.8125rem] text-steel-500" data-numeric>
          Saved as {e164}
        </p>
      ) : null}
    </div>
  )
}
