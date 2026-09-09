'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search as SearchIcon } from 'lucide-react'
import { Panel } from '@/components/ui/panel'
import { Chip } from '@/components/ui/chip'
import { kindLabel, type SearchDoc, type SearchKind } from '@/lib/search-types'
import { cn } from '@/lib/utils'

const FILTERS: readonly { value: SearchKind | 'all'; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'page', label: 'Pages' },
  { value: 'post', label: 'Blog' },
  { value: 'research', label: 'Research' },
  { value: 'news', label: 'News' },
  { value: 'faq', label: 'FAQ' },
  { value: 'legal', label: 'Legal' },
]

/**
 * Scoring, in order of what a reader means by a match:
 * a whole-phrase title hit beats a whole-phrase body hit, which beats every
 * term appearing somewhere. A document missing any term scores zero and is
 * dropped, so the results narrow as you type instead of widening.
 */
function score(doc: SearchDoc, terms: readonly string[], phrase: string): number {
  const title = doc.title.toLowerCase()
  let total = 0

  if (phrase.length > 2) {
    if (title.includes(phrase)) total += 60
    if (doc.keywords.includes(phrase)) total += 20
  }

  for (const term of terms) {
    if (title.includes(term)) total += 12
    else if (doc.summary.toLowerCase().includes(term)) total += 6
    else if (doc.keywords.includes(term)) total += 3
    else return 0
  }

  // A short, exact title is usually the page someone is actually after.
  if (title === phrase) total += 40
  return total
}

export function SiteSearch({ index }: { index: readonly SearchDoc[] }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<SearchKind | 'all'>('all')

  const results = useMemo(() => {
    const phrase = query.toLowerCase().replace(/\s+/g, ' ').trim()
    const terms = phrase.split(' ').filter((term) => term.length > 1)
    if (terms.length === 0) return []

    return index
      .filter((doc) => filter === 'all' || doc.kind === filter)
      .map((doc) => ({ doc, value: score(doc, terms, phrase) }))
      .filter((hit) => hit.value > 0)
      .sort((a, b) => b.value - a.value || a.doc.title.localeCompare(b.doc.title))
      .slice(0, 40)
  }, [index, query, filter])

  const searching = query.trim().length > 1

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <SearchIcon
          size={18}
          strokeWidth={1.5}
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-steel-500"
        />
        <label htmlFor="site-search" className="sr-only">
          Search 777 Raptor
        </label>
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages, posts, research and notices…"
          autoComplete="off"
          // eslint-disable-next-line jsx-a11y/no-autofocus -- this is the sole purpose of the page.
          autoFocus
          className={cn(
            'w-full rounded-ui border border-line-2 bg-bg-0 py-3.5 pl-12 pr-4 text-[1rem] text-steel-100',
            'transition-colors duration-200 placeholder:text-steel-700 hover:border-steel-700',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal',
          )}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFilter(option.value)}
            aria-pressed={filter === option.value}
            className={cn(
              'rounded-ui border px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] transition-colors duration-200',
              filter === option.value
                ? 'border-signal/50 bg-signal/[0.08] text-signal'
                : 'border-line-2 text-steel-500 hover:border-steel-700 hover:text-steel-300',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <p className="text-[0.8125rem] text-steel-500" role="status" aria-live="polite">
        {searching
          ? `${results.length} ${results.length === 1 ? 'result' : 'results'} for “${query.trim()}”`
          : `Searching ${index.length} pages and articles.`}
      </p>

      {searching && results.length === 0 ? (
        <Panel tone="raised" className="p-6">
          <p className="text-body text-steel-300">
            Nothing matched. Try a single word — “EMIL”, “FIX”, “custody”, “white label” — or{' '}
            <Link href="/company/contact" className="text-signal underline underline-offset-4">
              ask us directly
            </Link>
            .
          </p>
        </Panel>
      ) : null}

      {results.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {results.map(({ doc }, position) => (
            <li key={`${doc.kind}-${doc.path}-${doc.title}`}>
              <Panel interactive tintIndex={position} className="p-0">
                <Link href={doc.path} className="flex flex-col gap-2 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Chip>{kindLabel(doc.kind)}</Chip>
                    <span className="font-mono text-[0.6875rem] text-steel-500">{doc.path}</span>
                  </div>
                  <span className="tint-ink font-display text-[1.125rem] leading-snug">
                    {doc.title}
                  </span>
                  <span className="text-[0.9375rem] leading-relaxed text-steel-300">
                    {doc.summary}
                  </span>
                </Link>
              </Panel>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
