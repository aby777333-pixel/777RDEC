import Link from 'next/link'
import { ButtonLink } from '@/components/ui/button'
import { RaptorLogo } from '@/components/ui/raptor-logo'
import { WingMark } from '@/components/ui/wing-mark'
import { FOOTER_PRODUCT_LINKS } from '@/lib/navigation'

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-20">
      <div className="grid-field pointer-events-none absolute inset-0" aria-hidden />
      <WingMark
        className="pointer-events-none absolute -left-24 top-1/4 h-[22rem] w-[40rem] text-steel-700 opacity-40"
        strokeWidth={1}
      />
      <div className="relative flex max-w-xl flex-col items-center gap-8 text-center">
        <RaptorLogo size="md" />
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.18em] text-steel-500">
          404 · Not found
        </p>
        <h1 className="text-h2 uppercase text-chrome">This page isn&rsquo;t here.</h1>
        <p className="text-body text-steel-300">
          The link may be out of date, or the page may have moved. Everything else is still where
          you left it.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="primary" size="lg">
            Back to the homepage
          </ButtonLink>
          <ButtonLink href="/platform" variant="ghost" size="lg">
            See the platform
          </ButtonLink>
        </div>
        <nav aria-label="Product" className="border-t border-line-1 pt-6">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            {FOOTER_PRODUCT_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[0.875rem] text-steel-500 transition-colors hover:text-steel-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
