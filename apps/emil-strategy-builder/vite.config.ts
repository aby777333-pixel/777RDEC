import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The EMIL Strategy Builder is a standalone Vite SPA served as static files. By
// default it builds straight into the 777 Raptor site's public folder, so the
// Next.js build and the Netlify deploy need no extra step: run
// `npm run build:apps` from the repo root and commit the output.
//
// Another host (EMIL Trade serves it at /ai-lab/) builds the same source with
// EMIL_APP_BASE and EMIL_APP_OUT_DIR — see apps/README.md.
const base = process.env.EMIL_APP_BASE || '/emil-strategy-builder/'
const outDir = process.env.EMIL_APP_OUT_DIR || '../../public/emil-strategy-builder'

export default defineConfig({
  // Absolute base: the app is opened as <base>index.html and its assets must
  // resolve the same way whatever URL it was reached by.
  base,
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    // The shared strategy kit lives in packages/, outside this app's folder.
    fs: { allow: [fileURLToPath(new URL('../..', import.meta.url))] },
    proxy: {
      // Market data goes through the site's proxy route in production. In local
      // dev, run the Next site too (`npm run dev` at the repo root) and this
      // forwards to it; set VITE_DEV_SITE if it is not on port 3000.
      '/api': { target: process.env.VITE_DEV_SITE || 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          flow: ['reactflow'],
          syntax: ['react-syntax-highlighter'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
})
