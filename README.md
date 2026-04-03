# Petr Novák Portfolio

Personal portfolio site built with React, TypeScript, Vite, and Tailwind CSS.

## Highlights

- focused single-page portfolio with clear section-based navigation
- custom dark visual system with motion driven by `IntersectionObserver`
- responsive layout optimized for desktop and mobile
- automated GitHub Pages deployment via GitHub Actions

## Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- ESLint 9

## Local development

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Project structure

```text
src/
  components/
    AboutSection.tsx
    ContactSection.tsx
    ExperienceSection.tsx
    Footer.tsx
    HeroSection.tsx
    Navbar.tsx
    SkillsSection.tsx
  hooks/
    useScrollReveal.ts
  App.tsx
  index.css
  main.tsx
```

## Deployment

This repository is configured for GitHub Pages:

- repository: `https://github.com/Piskan2/portfolio`
- site: `https://piskan2.github.io/portfolio/`

To enable deployment:

1. Open **Settings** → **Pages** in the GitHub repository.
2. Set **Source** to **GitHub Actions**.
3. Push to `master` or run the workflow manually from the **Actions** tab.

The deployment workflow currently watches the `master` branch.

## Notes

- the Vite `base` path is configured for GitHub Pages deployment from `/portfolio/`
- generated build artifacts are excluded from version control
- the project targets Node.js `22.12+` to match the Vite 7 runtime requirement
- if you want the site to live at `/` instead of `/portfolio/`, the repository must be renamed to `Piskan2.github.io` or served from a custom domain
