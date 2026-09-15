import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The EMIL Strategy Builder is a standalone Vite SPA served as static files by
// the 777 Raptor site. It builds straight into the site's public folder, so the
// Next.js build and the Netlify deploy need no extra step: run
// `npm run build:strategy-builder` from the repo root and commit the output.
export default defineConfig({
  // Absolute base: the app is opened as /emil-strategy-builder/index.html and
  // its assets must resolve the same way whatever URL it was reached by.
  base: '/emil-strategy-builder/',
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      // Market data goes through the site's proxy route in production. In local
      // dev, run the Next site too (`npm run dev` at the repo root) and this
      // forwards to it; set VITE_DEV_SITE if it is not on port 3000.
      '/api': { target: process.env.VITE_DEV_SITE || 'http://localhost:3000', changeOrigin: true },
    },
  },
  build: {
    outDir: '../../public/emil-strategy-builder',
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
