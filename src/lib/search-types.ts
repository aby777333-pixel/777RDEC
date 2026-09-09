/**
 * Search types and labels, shared by the server-side index builder and the
 * client that renders it. Deliberately free of `server-only` so the client
 * component can import it — the index itself is still built on the server, in
 * search.ts, and arrives as props.
 */

export type SearchKind = 'page' | 'post' | 'research' | 'news' | 'legal' | 'faq'

export type SearchDoc = {
  path: string
  title: string
  summary: string
  kind: SearchKind
  /** Lower-cased haystack: everything worth matching on, joined. */
  keywords: string
}

const KIND_LABEL: Record<SearchKind, string> = {
  page: 'Page',
  post: 'Blog',
  research: 'Research',
  news: 'News',
  legal: 'Legal',
  faq: 'FAQ',
}

export function kindLabel(kind: SearchKind): string {
  return KIND_LABEL[kind]
}
