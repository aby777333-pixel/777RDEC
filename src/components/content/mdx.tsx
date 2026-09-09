import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'
import { CodeBlock } from '@/components/ui/code-block'

/**
 * MDX rendered with the site's own type scale rather than a prose plugin, so
 * article body copy matches the rest of the design system exactly.
 */
const components = {
  h2: (props: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2
      {...props}
      className="mt-10 font-display text-[1.5rem] uppercase leading-tight tracking-tight text-steel-100"
    />
  ),
  h3: (props: React.ComponentPropsWithoutRef<'h3'>) => (
    <h3 {...props} className="mt-8 font-display text-[1.1875rem] leading-snug text-steel-100" />
  ),
  p: (props: React.ComponentPropsWithoutRef<'p'>) => (
    <p {...props} className="mt-4 text-[1.0625rem] leading-relaxed text-steel-300" />
  ),
  ul: (props: React.ComponentPropsWithoutRef<'ul'>) => (
    <ul {...props} className="mt-4 flex flex-col gap-2.5" />
  ),
  ol: (props: React.ComponentPropsWithoutRef<'ol'>) => (
    <ol {...props} className="mt-4 flex list-inside list-decimal flex-col gap-2.5" />
  ),
  li: (props: React.ComponentPropsWithoutRef<'li'>) => (
    <li {...props} className="text-[1.0625rem] leading-relaxed text-steel-300" />
  ),
  strong: (props: React.ComponentPropsWithoutRef<'strong'>) => (
    <strong {...props} className="font-semibold text-steel-100" />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<'blockquote'>) => (
    <blockquote
      {...props}
      className="mt-6 border-l-2 border-signal/50 pl-5 text-[1.0625rem] leading-relaxed text-steel-300"
    />
  ),
  hr: () => <hr className="mt-10 border-line-2" />,
  a: ({ href = '', ...rest }: React.ComponentPropsWithoutRef<'a'>) =>
    href.startsWith('/') ? (
      <Link href={href} {...rest} className="text-signal underline underline-offset-4" />
    ) : (
      <a
        href={href}
        {...rest}
        rel="noopener noreferrer"
        className="text-signal underline underline-offset-4"
      />
    ),
  pre: ({ children }: React.ComponentPropsWithoutRef<'pre'>) => {
    // MDX wraps fenced code in <pre><code>; unwrap into the site's code panel.
    const code =
      typeof children === 'object' && children !== null && 'props' in children
        ? String((children as { props: { children?: unknown } }).props.children ?? '')
        : String(children ?? '')
    return <CodeBlock code={code.replace(/\n$/, '')} className="mt-6" />
  },
  code: (props: React.ComponentPropsWithoutRef<'code'>) => (
    <code
      {...props}
      className="rounded-[3px] bg-bg-2 px-1.5 py-0.5 font-mono text-[0.875rem] text-steel-100"
    />
  ),
}

export function Mdx({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />
}
