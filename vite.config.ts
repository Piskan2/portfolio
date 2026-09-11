import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The landing (index.html) and profile (profile.html) pages are pure static
// HTML generated from src/examples/content.ts (see scripts/generate-static-
// pages.mjs) so non-JS bots/HR tools can read them. In a build they're written
// into dist/ after `vite build`. In dev, this middleware serves the identical
// pages so `npm run dev` mirrors the deployed site (otherwise dev would show a
// bare index.html shell and a 404 for profile.html).
function staticPagesPlugin(): Plugin {
  let pages: { landingHtml: string; profileHtml: string } | null = null

  // Load lazily (esbuild-bundles content.ts once) via an absolute file URL so
  // resolution is correct regardless of where Vite runs the config from.
  const load = async () => {
    if (!pages) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import(
        pathToFileURL(join(process.cwd(), 'scripts/generate-static-pages.mjs')).href
      )
      pages = await mod.buildPages()
    }
    return pages
  }

  return {
    name: 'static-pages',
    apply: 'serve',
    configureServer(server) {
      // Registered directly (not via a returned function) so it runs BEFORE
      // Vite's own middlewares and can serve these routes.
      server.middlewares.use((req, res, next) => {
        const url = (req.url ?? '').split('?')[0]
        const isLanding =
          url === '/' || url === '/portfolio' || url === '/portfolio/'
        const isProfile =
          url === '/profile' ||
          url === '/profile.html' ||
          url === '/portfolio/profile' ||
          url === '/portfolio/profile.html'
        if (!isLanding && !isProfile) return next()
        load()
          .then((p) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            res.end(isLanding ? p.landingHtml : p.profileHtml)
          })
          .catch(next)
      })
    },
  }
}

export default defineConfig({
  base: '/portfolio/',
  plugins: [staticPagesPlugin(), react(), tailwindcss()],
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
