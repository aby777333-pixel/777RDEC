import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/brand'

/**
 * Crawl policy.
 *
 * The site is public marketing and documentation, and the goal is reach: every
 * page is open to search engines, social previewers and AI assistants alike.
 *
 * Crawlers are listed by purpose rather than left to the `*` group, so the
 * policy is a deliberate, visible decision and each class can be changed on
 * its own. Note that a crawler matching a named group ignores `*` entirely,
 * which is why every group carries the same disallow list.
 *
 * To opt out of AI model training while staying visible in AI search and
 * assistant answers, change the `AI_TRAINING` group to `disallow: '/'` —
 * `AI_SEARCH_AND_ASSISTANTS` is a separate group precisely so that stays open.
 */

/** Not for crawlers: the internal QA surface and API endpoints. */
const DISALLOW = ['/design-system', '/api/']

/**
 * /api/og renders the Open Graph card for each page. Previewers that honour
 * robots.txt (X/Twitter, LinkedIn, Slack) and Google Images must be able to
 * fetch it, so it is carved out of the /api/ disallow — the longer rule wins.
 */
const ALLOW = ['/', '/api/og']

const SEARCH_ENGINES = [
  'Googlebot',
  'Googlebot-Image',
  'Bingbot',
  'Applebot',
  'DuckDuckBot',
  'YandexBot',
  'Baiduspider',
]

const SOCIAL_PREVIEWERS = [
  'facebookexternalhit',
  'LinkedInBot',
  'Twitterbot',
  'Slackbot',
  'WhatsApp',
  'TelegramBot',
  'Discordbot',
]

/** Index pages for AI search results, or fetch a page a user asked about. */
const AI_SEARCH_AND_ASSISTANTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'DuckAssistBot',
  'MistralAI-User',
]

/** Collect pages for model training. Open today; see the note above. */
const AI_TRAINING = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Amazonbot',
  'CCBot',
]

export default function robots(): MetadataRoute.Robots {
  const group = (userAgent: string | string[]) => ({ userAgent, allow: ALLOW, disallow: DISALLOW })
  return {
    rules: [
      group(SEARCH_ENGINES),
      group(SOCIAL_PREVIEWERS),
      group(AI_SEARCH_AND_ASSISTANTS),
      group(AI_TRAINING),
      group('*'),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
