/**
 * Copy guard. Fails the build if forbidden marketing claims appear anywhere in
 * shipped copy (super-prompt §7). Wired into `npm run build`.
 *
 * This is deliberately blunt: a claim that needs a nuanced exception needs a
 * conversation with compliance, not a regex escape hatch.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['src', 'content', 'docs']
const EXTENSIONS = ['.ts', '.tsx', '.mdx', '.md']

/** Substring matches are case-insensitive and whitespace-tolerant. */
const FORBIDDEN = [
  'guaranteed',
  'never lose',
  'risk-free',
  'risk free',
  'beat the market',
  'AI always wins',
  'revolutionary',
  'game-changing',
  'game changing',
  'unprecedented',
  "world's best",
  'worlds best',
  '100% accurate',
  'profit guarantee',
] as const

/** This file necessarily contains the banned strings. */
const SELF = relative(ROOT, join(ROOT, 'scripts', 'check-copy.ts'))

type Finding = { file: string; line: number; term: string; text: string }

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full, out)
    } else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      out.push(full)
    }
  }
  return out
}

function run(): void {
  const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
  const findings: Finding[] = []

  for (const file of files) {
    const rel = relative(ROOT, file)
    if (rel === SELF) continue
    const lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((text, index) => {
      const haystack = text.toLowerCase()
      for (const term of FORBIDDEN) {
        if (haystack.includes(term.toLowerCase())) {
          findings.push({ file: rel, line: index + 1, term, text: text.trim() })
        }
      }
    })
  }

  if (findings.length > 0) {
    console.error(`\n  copy check FAILED — ${findings.length} forbidden claim(s):\n`)
    for (const f of findings) {
      console.error(`  ${f.file}:${f.line}  "${f.term}"`)
      console.error(`    ${f.text.slice(0, 120)}\n`)
    }
    console.error('  These claims may not appear on this site. See super-prompt §7.\n')
    process.exit(1)
  }

  console.log(`  copy check passed — ${files.length} files, 0 forbidden claims.`)
}

run()
