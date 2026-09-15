/**
 * Indexability guard. Runs after `next build` (wired into `npm run build`) and
 * fails the build — so the deploy never goes live — if production output would
 * hide the site from search engines or ship pages without their basic tags.
 *
 * Fails on:
 *   - a `noindex` robots meta on any prerendered page not in NOINDEX_ALLOWED
 *   - robots.txt blocking the whole site for `*`, Googlebot or Bingbot
 *   - an `X-Robots-Tag: noindex` header in netlify.toml
 *   - an indexable page missing its <title>, meta description or canonical
 *   - canonicals or sitemap URLs pointing at more than one origin
 *   - the sitemap listing a page that is marked noindex
 *
 * Warns (does not fail) on pages without exactly one <h1>, and on indexable
 * pages missing from the sitemap.
 *
 * Only prerendered HTML is inspected; routes rendered on demand (contact,
 * request-demo, status) share the same metadata helpers.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const APP_DIR = join(ROOT, '.next', 'server', 'app')

/** Routes that are deliberately kept out of the index. */
const NOINDEX_ALLOWED = new Set(['/design-system', '/search', '/_not-found'])

type Page = { route: string; html: string }

const errors: string[] = []
const warnings: string[] = []

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (entry.endsWith('.html')) out.push(full)
  }
  return out
}

function routeFor(file: string): string {
  const rel = relative(APP_DIR, file).split(sep).join('/').replace(/\.html$/, '')
  return rel === 'index' ? '/' : `/${rel}`
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, 'i'))
  return match ? match[1] : null
}

function metaTags(html: string, key: 'name' | 'property', value: string): string[] {
  const tags = html.match(/<meta\s[^>]*>/gi) ?? []
  return tags.filter((tag) => (attr(tag, key) ?? '').toLowerCase() === value)
}

function decode(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
}

function checkPages(pages: readonly Page[]): { canonicals: Map<string, string>; noindex: Set<string> } {
  const canonicals = new Map<string, string>()
  const noindex = new Set<string>()

  for (const { route, html } of pages) {
    const robots = metaTags(html, 'name', 'robots').map((tag) => (attr(tag, 'content') ?? '').toLowerCase())
    const isNoindex = robots.some((content) => content.includes('noindex'))

    if (isNoindex) {
      noindex.add(route)
      if (!NOINDEX_ALLOWED.has(route)) errors.push(`${route}: robots meta contains noindex`)
      continue
    }
    if (NOINDEX_ALLOWED.has(route)) continue

    const title = html.match(/<title>([^<]*)<\/title>/i)
    if (!title || title[1].trim().length === 0) errors.push(`${route}: missing <title>`)

    const description = metaTags(html, 'name', 'description')
    if (description.length === 0 || (attr(description[0], 'content') ?? '').trim().length === 0) {
      errors.push(`${route}: missing meta description`)
    }

    const canonicalTags = (html.match(/<link\s[^>]*>/gi) ?? []).filter(
      (tag) => (attr(tag, 'rel') ?? '').toLowerCase() === 'canonical',
    )
    if (canonicalTags.length !== 1) {
      errors.push(`${route}: expected 1 canonical link, found ${canonicalTags.length}`)
    } else {
      canonicals.set(route, decode(attr(canonicalTags[0], 'href') ?? ''))
    }

    if (metaTags(html, 'property', 'og:image').length === 0) warnings.push(`${route}: no og:image`)

    const h1 = (html.match(/<h1[\s>]/gi) ?? []).length
    if (h1 !== 1) warnings.push(`${route}: ${h1} <h1> elements (expected 1)`)
  }

  const origins = new Set(
    Array.from(canonicals.values()).map((href) => {
      try {
        return new URL(href).origin
      } catch {
        return `invalid:${href}`
      }
    }),
  )
  if (origins.size > 1) errors.push(`canonicals span several origins: ${Array.from(origins).join(', ')}`)

  return { canonicals, noindex }
}

function checkRobotsTxt(): void {
  const file = join(APP_DIR, 'robots.txt.body')
  if (!existsSync(file)) {
    errors.push('robots.txt was not generated')
    return
  }
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  let agents: string[] = []
  let inRules = false
  for (const raw of lines) {
    const line = raw.trim()
    const [key, ...rest] = line.split(':')
    const value = rest.join(':').trim()
    if (/^user-agent$/i.test(key)) {
      if (inRules) agents = []
      inRules = false
      agents.push(value.toLowerCase())
    } else if (/^(allow|disallow)$/i.test(key)) {
      inRules = true
      const critical = agents.some((agent) => ['*', 'googlebot', 'bingbot'].includes(agent))
      if (critical && /^disallow$/i.test(key) && value === '/') {
        errors.push(`robots.txt disallows the whole site for ${agents.join(', ')}`)
      }
    }
  }
  if (!lines.some((line) => /^sitemap:/i.test(line.trim()))) errors.push('robots.txt has no Sitemap line')
}

function checkNetlifyHeaders(): void {
  const file = join(ROOT, 'netlify.toml')
  if (!existsSync(file)) return
  if (/x-robots-tag[^\n]*noindex/i.test(readFileSync(file, 'utf8'))) {
    errors.push('netlify.toml sets an X-Robots-Tag noindex header')
  }
}

function checkSitemap(canonicals: Map<string, string>, noindex: Set<string>): void {
  const file = join(APP_DIR, 'sitemap.xml.body')
  if (!existsSync(file)) {
    errors.push('sitemap.xml was not generated')
    return
  }
  const locs = Array.from(readFileSync(file, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g), (m) => decode(m[1]))
  if (locs.length === 0) errors.push('sitemap.xml lists no URLs')

  const canonicalOrigin = canonicals.size > 0 ? new URL(Array.from(canonicals.values())[0]).origin : null
  const listedPaths = new Set<string>()
  for (const loc of locs) {
    let parsed: URL
    try {
      parsed = new URL(loc)
    } catch {
      errors.push(`sitemap.xml: invalid URL ${loc}`)
      continue
    }
    if (canonicalOrigin && parsed.origin !== canonicalOrigin) {
      errors.push(`sitemap.xml: ${loc} is not on the canonical origin ${canonicalOrigin}`)
    }
    const path = parsed.pathname === '' ? '/' : parsed.pathname
    listedPaths.add(path)
    if (noindex.has(path)) errors.push(`sitemap.xml lists ${path}, which is noindex`)
  }

  for (const [route, href] of Array.from(canonicals)) {
    const path = new URL(href).pathname || '/'
    if (path === route && !listedPaths.has(path)) warnings.push(`${route}: indexable but not in sitemap.xml`)
  }
}

function run(): void {
  if (!existsSync(APP_DIR)) {
    console.error('\n  seo check FAILED — no build output at .next/server/app. Run `next build` first.\n')
    process.exit(1)
  }

  const pages = walk(APP_DIR).map((file) => ({ route: routeFor(file), html: readFileSync(file, 'utf8') }))
  const { canonicals, noindex } = checkPages(pages)
  checkRobotsTxt()
  checkNetlifyHeaders()
  checkSitemap(canonicals, noindex)

  for (const warning of warnings) console.warn(`  seo warning — ${warning}`)

  if (errors.length > 0) {
    console.error(`\n  seo check FAILED — ${errors.length} problem(s):\n`)
    for (const error of errors) console.error(`  ${error}`)
    console.error('')
    process.exit(1)
  }

  const origin = canonicals.size > 0 ? new URL(Array.from(canonicals.values())[0]).origin : 'n/a'
  console.log(
    `  seo check passed — ${pages.length} prerendered pages, ${canonicals.size} indexable, canonical origin ${origin}.`,
  )
}

run()
