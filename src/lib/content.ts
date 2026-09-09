import 'server-only'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import matter from 'gray-matter'

export type ContentCollection = 'research' | 'news'

export type Frontmatter = {
  title: string
  description: string
  date: string
  author: string
  /** Placeholder content ships with draft: true and is labelled as such. */
  draft: boolean
  tags: readonly string[]
}

export type ContentEntry = { slug: string; frontmatter: Frontmatter; body: string }

const CONTENT_ROOT = join(process.cwd(), 'content')

function toFrontmatter(data: Record<string, unknown>): Frontmatter {
  return {
    title: typeof data.title === 'string' ? data.title : 'Untitled',
    description: typeof data.description === 'string' ? data.description : '',
    date: typeof data.date === 'string' ? data.date : '1970-01-01',
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
        frontmatter: toFrontmatter(parsed.data),
        body: parsed.content,
      }
    })
    .sort((a, b) => b.frontmatter.date.localeCompare(a.frontmatter.date))
}

export function getContent(collection: ContentCollection, slug: string): ContentEntry | null {
  return listContent(collection).find((entry) => entry.slug === slug) ?? null
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
