import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/portfolio/',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // Build ONLY the interactive REPL as a normal Vite HTML entry.
      // The landing (index.html) and profile pages are crawlable static
      // files produced afterward by scripts/generate-static-pages.mjs.
      input: {
        terminal: 'terminal.html',
      },
    },
  },
  server: {
    hmr: false,
  },
})