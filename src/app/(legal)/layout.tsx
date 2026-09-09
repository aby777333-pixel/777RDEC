import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { CookieBanner } from '@/components/layout/cookie-banner'
import { SkipLink } from '@/components/layout/skip-link'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <CookieBanner />
    </>
  )
}
