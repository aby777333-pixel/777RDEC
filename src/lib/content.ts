import 'server-only'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'

export type ContentCollection = 'research' | 'news' | 'blog'

export type Frontmatter = {
  title: string
  description: string
  date: string
  author: string
  /** Placeholder content ships with draft: true and is labelled as such. */
  draft: boolean
  tags: readonly string[]
  /** Blog only: the category slug this post belongs to. */
  category: string
  /** Rough read time in minutes, computed from the body if not given. */
  readMinutes: number
}

export type ContentEntry = { slug: string; frontmatter: Frontmatter; body: string }

const CONTENT_ROOT = join(process.cwd(), 'content')

/**
 * YAML parses an unquoted `2026-05-07` into a Date, not a string, so a plain
 * `typeof === 'string'` guard silently turns every post's date into the epoch.
 * Normalise both shapes to an ISO date string.
 */
function toIsoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  }
  return '1970-01-01'
}

function toFrontmatter(data: Record<string, unknown>, body: string): Frontmatter {
  const words = body.split(/\s+/).filter(Boolean).length
  return {
    category: typeof data.category === 'string' ? data.category : 'general',
    readMinutes:
      typeof data.readMinutes === 'number' ? data.readMinutes : Math.max(1, Math.round(words / 220)),
    title: typeof data.title === 'string' ? data.title : 'Untitled',
    description: typeof data.description === 'string' ? data.description : '',
    date: toIsoDate(data.date),
    author: typeof data.author === 'string' ? data.author : '777 Raptor',
    draft: data.draft === true,
    tags: Array.isArray(data.tags) ? data.tags.filter((t): t is string => typeof t === 'string') : [],
  }
}

export function listContent(collection: ContentCollection): readonly ContentEntry[] {
  const dir = join(CONTENT_ROOT, collection)
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const parsed = matter(readFileSync(join(dir, file), 'utf8'))
      return {
        slug: file.replace(/\.mdx$/, ''),
        frontmatter: toFrontmatter(parsed.data, parsed.content),
        body: parsed.content,
      }
    })
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
}

export function getContent(collection: ContentCollection, slug: string): ContentEntry | null {
  return listContent(collection).find((entry) => entry.slug === slug) ?? null
}

/** Blog categories, ordered, with the copy the index and menu both use. */
/**
 * `tint` is a fixed hue index per category, not positional — so EMIL is always
 * blue and Risk always rose, wherever the category appears.
 */
export const BLOG_CATEGORIES = [
  { slug: 'emil', label: 'EMIL', tint: 0, blurb: 'The intelligence layer: how it learns, what it is allowed to do, and where it stops.' },
  { slug: 'risk', label: 'Risk', tint: 4, blurb: 'Exposure, limits, drawdown guards and capital protection in practice.' },
  { slug: 'brokerage', label: 'Brokerage', tint: 1, blurb: 'Running a brokerage on one stack instead of three vendors.' },
  { slug: 'engineering', label: 'Engineering', tint: 2, blurb: 'How the platform is built, and what breaks when it is built badly.' },
  { slug: 'markets', label: 'Markets', tint: 5, blurb: 'Market structure, sessions and cross-asset behaviour.' },
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]

export function categoryFor(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((category) => category.slug === slug)
}

export function postsInCategory(slug: string): readonly ContentEntry[] {
  return listContent('blog').filter((entry) => entry.frontmatter.category === slug)
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
