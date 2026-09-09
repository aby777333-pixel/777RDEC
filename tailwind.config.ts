import type { Config } from 'tailwindcss'

/**
 * Every colour resolves to a CSS variable so a single `.dark` class swap
 * re-themes the whole site. Light and dark are both first-class: see
 * src/styles/globals.css for the two palettes.
 */
const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: 'var(--bg-0)',
          1: 'var(--bg-1)',
          2: 'var(--bg-2)',
          3: 'var(--bg-3)',
        },
        steel: {
          100: 'var(--steel-100)',
          300: 'var(--steel-300)',
          500: 'var(--steel-500)',
          700: 'var(--steel-700)',
        },
        line: {
          1: 'var(--line-1)',
          2: 'var(--line-2)',
        },
        signal: 'var(--signal)',
        up: 'var(--up)',
        down: 'var(--down)',
        armed: 'var(--armed)',
        warn: 'var(--warn)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em' }],
        data: ['0.8125rem', { lineHeight: '1.35' }],
        body: ['1.0625rem', { lineHeight: '1.6' }],
        h2: ['clamp(2.25rem, 5vw, 4.5rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        h1: ['clamp(3rem, 8vw, 8rem)', { lineHeight: '0.92', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        ui: '6px',
        card: '12px',
        panel: '20px',
      },
      maxWidth: {
        container: '1440px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        raised: 'var(--shadow-raised)',
        panel: 'var(--shadow-panel)',
        lift: 'var(--shadow-lift)',
        edge: 'var(--edge-highlight)',
        'ring-signal': '0 0 0 1px var(--signal), 0 0 0 4px color-mix(in srgb, var(--signal) 22%, transparent)',
      },
      backgroundImage: {
        chrome: 'var(--chrome)',
        'grid-hairline':
          'linear-gradient(to right, var(--line-1) 1px, transparent 1px), linear-gradient(to bottom, var(--line-1) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '64px 64px',
      },
      transitionTimingFunction: {
        raptor: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'pulse-signal': {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.55' },
          '50%': { transform: 'scale(1.06)', opacity: '0.95' },
        },
        'ticker-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-signal': 'pulse-signal 2.4s ease-in-out infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
        'ticker-in': 'ticker-in 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
