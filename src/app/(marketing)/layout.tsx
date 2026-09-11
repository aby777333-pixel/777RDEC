import { Nav } from '@/components/layout/nav'
import { Footer } from '@/components/layout/footer'
import { CookieBanner } from '@/components/layout/cookie-banner'
import { SkipLink } from '@/components/layout/skip-link'
import { ScrollControls } from '@/components/layout/scroll-controls'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <ScrollControls />
      <CookieBanner />
    </>
  )
}
