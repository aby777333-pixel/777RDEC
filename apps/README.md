# EMIL apps

Standalone apps brought into the EMIL universe. Each is its own project with its
own toolchain, kept apart from the Next.js site so neither can break the other:
the site's type-check, lint, copy check and Netlify build never touch `apps/`.

| App | Source | Served from | Page |
| --- | --- | --- | --- |
| EMIL Strategy Builder | `apps/emil-strategy-builder` (Vite + React) | `/emil-strategy-builder/index.html` | `/platform/emil/strategy-builder` |

## How an app is wired

- **Build output is committed.** `npm run build:apps` (or `-- <id>` for one)
  builds each app into `public/<id>/`. Netlify deploys those files as they are.
- **Static, not a Next route.** Link to `/<id>/index.html` with a plain `<a>`
  (`emilAppHref()` in `src/lib/emil-apps.ts`), never `next/link`. Apps route with
  a hash (`#/audit`). `/emil-<id>` redirects to the entry file.
- **One registry.** `src/lib/emil-apps.ts` lists every app; the Platform menu,
  sitemap, llms.txt and breadcrumbs follow it.
- **Market data** goes through the shared read-only proxy at
  `/api/raptor-market/<path>` (allow-listed GETs only; origin from
  `RAPTOR_MARKET_API_ORIGIN`).
- **No phantom backends.** An app that has no backend on this site must not poll
  one: gate those calls behind a build-time variable and use its demo data.

## Bringing in the next app

1. Copy the source (no `node_modules`, `dist`, or generated `vite.config.js`)
   to `apps/emil-<name>/`.
2. In its Vite config set `base: '/emil-<name>/'` and
   `build.outDir: '../../public/emil-<name>'` with `emptyOutDir: true`.
3. Move every brand string into a `src/brand.ts` read from `VITE_BRAND_*`
   variables, and theme colours into CSS variables (copy the Strategy Builder's
   `brand.ts`, `tailwind.config.js` colours and `index.css` `:root` block).
4. Point market calls at `/api/raptor-market`; gate calls to backends this site
   does not have.
5. Add the app to `EMIL_APPS`, its name to `src/lib/brand.ts`, its copy to
   `src/lib/copy/`, its page under `src/app/(marketing)/platform/emil/`, and the
   page to `PAGES` in `src/lib/search.ts`.
6. `npm run build:apps -- emil-<name>`, then `npm run verify` and `npm run build`.

## White-labelling

Each app's names, links and palette come from build-time settings, so a partner
build needs no code change:

```bash
VITE_BRAND_FAMILY="Acme" VITE_BRAND_PLATFORM="Acme" VITE_BRAND_COMPANY="Acme Markets" \
VITE_BRAND_HOME_HREF="https://acme.example/strategy-builder" npm run build
```

Colours: override the `--color-*` variables in the app's `src/index.css`.
Chart series colours are still set inside the components.
