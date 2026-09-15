'use client'

import { useEffect } from 'react'
import { startScrollActivity } from '@/components/backdrops/scroll-activity'

/**
 * Mounts the page-wide scroll tracker, so CSS-animated hero scenes — which have
 * no script of their own to subscribe with — can pause while the page scrolls.
 * Renders nothing.
 */
export function ScrollActivity() {
  useEffect(() => {
    startScrollActivity()
  }, [])
  return null
}
