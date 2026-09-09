import { ImageResponse } from 'next/og'
import { SITE_TAGLINE } from '@/lib/brand'

export const runtime = 'edge'

const SIZE = { width: 1200, height: 630 }

/**
 * Open Graph images with the chrome-text treatment. Built with next/og rather
 * than a static asset so every route gets its own title card.
 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = (searchParams.get('title') ?? SITE_TAGLINE).slice(0, 90)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#050505',
          padding: '72px',
          // Hairline grid, drawn as a repeating gradient.
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <svg width="72" height="40" viewBox="0 0 44 24" fill="none">
            <g stroke="#D7DADF" strokeWidth="1.6" strokeLinecap="round">
              <path d="M2 21 C 12 18, 26 12, 42 2" />
              <path d="M2 17.5 C 11 15, 22 10, 34 2.5" opacity="0.75" />
              <path d="M2 14 C 10 12, 18 8.5, 27 3" opacity="0.55" />
              <path d="M2 10.5 C 9 9, 15 7, 21 3.5" opacity="0.38" />
            </g>
          </svg>
          <div style={{ width: '1px', height: '44px', background: 'rgba(255,255,255,0.16)' }} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <span style={{ fontSize: 40, fontWeight: 700, color: '#D7DADF', letterSpacing: '-0.02em' }}>
              777
            </span>
            <span
              style={{
                fontSize: 40,
                fontWeight: 700,
                color: '#F2F3F5',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}
            >
              Raptor
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: title.length > 42 ? 68 : 88,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            color: '#E6E8EB',
            display: 'flex',
            maxWidth: '960px',
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#7DD3FC' }} />
          <span
            style={{
              fontSize: 22,
              color: '#8A8F98',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {SITE_TAGLINE}
          </span>
        </div>
      </div>
    ),
    SIZE,
  )
}
