/**
 * Builds the standalone EMIL apps under apps/ into public/<id>, where the site
 * serves them as static files. Not part of `npm run build`: the built output
 * is committed, so a Netlify deploy never depends on these toolchains.
 *
 *   npm run build:apps                          every app
 *   npm run build:apps -- emil-strategy-builder one app
 *
 * Installs each app's dependencies from its lockfile first when they are
 * missing. See apps/README.md.
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const APPS_DIR = join(process.cwd(), 'apps')
const requested = process.argv.slice(2)

function run(cwd: string, args: readonly string[]): void {
  // Under `npm run`, npm_execpath is npm's own CLI script: run it with this
  // Node directly, which needs no shell on any platform.
  const npmCli = process.env.npm_execpath
  const result = npmCli
    ? spawnSync(process.execPath, [npmCli, ...args], { cwd, stdio: 'inherit' })
    : spawnSync('npm', args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
  if (result.status !== 0) {
    console.error(`\n  build:apps FAILED — npm ${args.join(' ')} in ${cwd}\n`)
    process.exit(result.status ?? 1)
  }
}

const apps = readdirSync(APPS_DIR).filter(
  (entry) => statSync(join(APPS_DIR, entry)).isDirectory() && existsSync(join(APPS_DIR, entry, 'package.json')),
)

const unknown = requested.filter((id) => !apps.includes(id))
if (unknown.length > 0) {
  console.error(`\n  build:apps — no such app: ${unknown.join(', ')}. Found: ${apps.join(', ')}\n`)
  process.exit(1)
}

for (const id of requested.length > 0 ? requested : apps) {
  const dir = join(APPS_DIR, id)
  console.log(`\n  building ${id}`)
  if (!existsSync(join(dir, 'node_modules'))) run(dir, ['ci', '--no-audit', '--no-fund'])
  run(dir, ['run', 'build'])
}

console.log('\n  build:apps done — commit the changes under public/.\n')
