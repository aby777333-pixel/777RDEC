'use client'

import { useEffect, useState } from 'react'
import { initMusic, isMusicPlaying, onMusicChange, toggleMusic } from '@/lib/techno-loop'
import { cn } from '@/lib/utils'

/**
 * Play/stop for the hero's music, in the bottom right of the band.
 *
 * The music is on by default, so this is mostly a way to turn it off — and
 * turning it off is remembered, or the next link followed would start it
 * again. It is not a floating widget: it belongs to the band, where the eye
 * already is, and it leaves with the hero.
 *
 * Mounting is what asks for the music, through `initMusic`, which is written
 * to be called by every hero and to act only once. Whether it can start on
 * load at all is the browser's decision, not ours — see `@/lib/techno-loop`.
 *
 * The music itself is a module, not state in here, so it plays on across
 * client-side navigation and every hero's button shows the same truth.
 */
export function MusicToggle({ className }: { className?: string }) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    // The module may already be playing — this hero might be the second page
    // of the visit — and if it is not, this is what asks it to.
    setPlaying(isMusicPlaying())
    const unsubscribe = onMusicChange(setPlaying)
    initMusic()
    return unsubscribe
  }, [])

  return (
    <button
      type="button"
      onClick={toggleMusic}
      aria-pressed={playing}
      aria-label={playing ? 'Stop the music' : 'Play music'}
      title={playing ? 'Stop the music' : 'Play music'}
      className={cn(
        'group absolute bottom-5 right-5 z-10 flex items-center gap-2.5 rounded-full',
        'border border-line-2 bg-bg-1/70 px-3.5 py-2 backdrop-blur',
        'text-eyebrow uppercase text-steel-300 transition-colors',
        'hover:border-signal/60 hover:text-steel-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal',
        'md:bottom-6 md:right-6',
        className,
      )}
    >
      {/* Four bars: a level meter while it plays, a flat line while it does not. */}
      <span aria-hidden className="flex h-3.5 items-end gap-[2px]">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn(
              'w-[2px] rounded-sm bg-signal transition-[height,opacity] duration-300',
              playing ? 'animate-music-bar' : 'h-[2px] opacity-45',
            )}
            style={playing ? { animationDelay: `${i * 0.14}s` } : undefined}
          />
        ))}
      </span>
      <span>{playing ? 'Sound on' : 'Sound'}</span>
    </button>
  )
}
