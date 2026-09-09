'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CodeBlock({
  code,
  label,
  className,
}: {
  code: string
  label?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // Clipboard permission denied — the code is still selectable.
    }
  }

  return (
    <div className={cn('overflow-hidden rounded-card border border-line-2 bg-bg-2', className)}>
      <div className="flex items-center justify-between border-b border-line-1 px-4 py-2">
        <span className="text-eyebrow uppercase text-steel-500">{label ?? 'Example'}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-ui px-2 py-1 text-[0.75rem] text-steel-500 transition-colors hover:text-steel-100"
        >
          {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="scroll-steel overflow-x-auto px-4 py-4 text-data">
        <code className="font-mono text-steel-300">{code}</code>
      </pre>
    </div>
  )
}
