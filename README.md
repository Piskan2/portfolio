# Portfolio (REPL)

A personal portfolio rendered as a single full-screen, typeable terminal — the REPL concept skin.
Built with React, TypeScript, Vite 7, and ESLint. All biographical content (name, role, companies,
dates, locations, projects, skills, contact) comes from `src/examples/content.ts`, so no personal
data is hardcoded in the skin.

## Features

- One design only: the REPL skin renders full-screen at the root URL (and at `#repl`).
- Interactive terminal: type commands (`projects`, `writing`, `experience`, `skills`, `contact`,
  `help`, `whoami`, `date`, `uname -a`, `clear`, `reboot`, …) or use the title-bar section tabs.
- MS-DOS-style BIOS POST on power-up; the inline prompt lives in the stream (it is not pinned chrome).
- No theme picker — this is the only theme.

## Stack

- React 19, TypeScript 5, Vite 7, ESLint 9

## Local development

```bash
npm install
npm run dev     # http://localhost:5173/portfolio/
npm run lint
npm run build   # outputs dist/
```

## Project structure

```text
src/
  skins/
    repl/
      ReplSkin.tsx    # the REPL skin — full-screen typeable terminal
      repl.css
  examples/
    content.ts        # all portfolio content (single source of truth)
  main.tsx            # app entry
  App.tsx             # renders REPL as the only theme
```

## Deployment

This repository is configured for GitHub Pages. The Vite `base` path is set to `/portfolio/`.
All deployment settings live in three places — update them to change the target:

- `homepage` in `package.json`
- `base` in `vite.config.ts`
- `.github/workflows/deploy.yml`

The generated build artifacts in `dist/` are excluded from version control.
