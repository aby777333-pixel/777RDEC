import { NextResponse } from 'next/server'
import { getStatus } from '@/lib/status'

export const dynamic = 'force-dynamic'

/** JSON source the status page and any external monitor can both consume. */
export function GET() {
  return NextResponse.json(getStatus(), {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
