import { SkipLink } from '@/components/layout/skip-link'

/**
 * The sandbox runs without site chrome (§5): no nav, no footer. Its own
 * persistent controls provide the exit route and the simulated-data notice.
 */
export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <main id="main" className="min-h-dvh bg-bg-0">
        {children}
      </main>
    </>
  )
}
