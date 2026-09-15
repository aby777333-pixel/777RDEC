/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Theme tokens are CSS variables (space-separated RGB channels, defined in
      // src/index.css) so a white-label build re-skins the app by overriding
      // them, and opacity modifiers like `bg-primary/15` keep working.
      colors: {
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        subtext: 'rgb(var(--color-subtext) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 12px rgba(125,211,252,0.5)',
        'neon-green': '0 0 12px rgba(52,211,153,0.5)',
        'neon-red': '0 0 12px rgba(248,113,113,0.5)',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 6px rgba(125,211,252,0.4)' },
          '50%': { boxShadow: '0 0 18px rgba(125,211,252,0.9)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 1.6s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}
