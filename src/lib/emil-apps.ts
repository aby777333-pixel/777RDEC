import { EMIL_STRATEGY_BUILDER } from './brand'

/**
 * The EMIL app registry: every standalone app brought into the EMIL universe.
 *
 * Each app is its own project under `apps/<id>`, built into `public/<id>` and
 * opened at `/<id>/index.html` (a plain <a>, never next/link — it is static
 * files, not a Next route). Its marketing page lives in the Next app at `page`.
 * Navigation, the sitemap, llms.txt and breadcrumbs pick an app up from here.
 *
 * Adding one: see apps/README.md. Ids start with `emil-`, which is what the
 * redirect from /emil-<id> to /emil-<id>/index.html in next.config.mjs relies on.
 */
export type EmilApp = {
  /** Folder name under apps/ and public/, and the URL segment. */
  id: `emil-${string}`
  /** Display name, from brand.ts. */
  name: string
  /** The app's page on this site. */
  page: string
  /** One line for the navigation menu. */
  navDescription: string
}

export const EMIL_APPS = [
  {
    id: 'emil-strategy-builder',
    name: EMIL_STRATEGY_BUILDER,
    page: '/platform/emil/strategy-builder',
    navDescription: 'Fifteen agents, one approval, a full audit trail.',
  },
] as const satisfies readonly EmilApp[]

export type EmilAppId = (typeof EMIL_APPS)[number]['id']

/** The app's entry file, optionally at one of its hash routes (`'/audit'`). */
export function emilAppHref(id: EmilAppId, route?: `/${string}`): string {
  return `/${id}/index.html${route ? `#${route}` : ''}`
}

export function emilApp(id: EmilAppId): EmilApp {
  const app = EMIL_APPS.find((candidate) => candidate.id === id)
  if (!app) throw new Error(`Unknown EMIL app: ${id}`)
  return app
}
