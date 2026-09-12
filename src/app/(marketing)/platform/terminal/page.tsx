import type { Metadata } from 'next'
import { StandardPage } from '@/components/layout/page-shell'
import { WorkspaceMap } from '@/components/platform/workspace-map'
import { terminal as copy } from '@/lib/copy/platform'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: copy.title,
  description: copy.description,
  path: '/platform/terminal',
})

export default function TerminalPage() {
  return (
    <StandardPage copy={copy} modulesHeading="Inside the terminal" heroBackdrop="tunnel">
      <WorkspaceMap />
    </StandardPage>
  )
}
