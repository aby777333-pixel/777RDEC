/**
 * Every brand string the app shows, in one place, so a white-label build is a
 * set of environment variables rather than a code change. Each value is read
 * at build time (Vite inlines VITE_* variables) and falls back to the 777 Raptor
 * default. Example white-label build:
 *
 *   VITE_BRAND_FAMILY="Acme" VITE_BRAND_PLATFORM="Acme" VITE_BRAND_COMPANY="Acme Markets" \
 *   VITE_BRAND_HOME_HREF="https://acme.example/strategy-builder" npm run build
 */
const ENV = (import.meta as any).env || {};

const pick = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;

export const BRAND = {
  /** The product family the app belongs to: "EMIL". */
  family: pick(ENV.VITE_BRAND_FAMILY, 'EMIL'),
  /** This app's own name within the family. */
  appName: pick(ENV.VITE_BRAND_APP_NAME, 'Strategy Builder'),
  /** The operator shown in the footer line and the browser tab. */
  company: pick(ENV.VITE_BRAND_COMPANY, '777 Raptor'),
  /** The underlying platform: "Raptor Terminal", "Raptor Market API"… */
  platform: pick(ENV.VITE_BRAND_PLATFORM, 'Raptor'),
  /** Where the back button goes: the app's page on the host site. */
  homeHref: pick(ENV.VITE_BRAND_HOME_HREF, '/platform/emil/strategy-builder'),
  /** Where visitors ask for API keys against simulated data. */
  sandboxHref: pick(ENV.VITE_BRAND_SANDBOX_HREF, '/developers/sandbox'),
} as const;

/** "EMIL Strategy Builder". */
export const APP_TITLE = `${BRAND.family} ${BRAND.appName}`;
