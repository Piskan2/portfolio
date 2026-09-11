// Build-time generator for the two crawlable static pages.
//
// `buildPages()` bundles src/examples/content.ts with esbuild (build-only
// tooling — never shipped to a browser) and returns the generated landing
// (index.html) and profile (profile.html) HTML. When run directly
// (`node scripts/generate-static-pages.mjs`, wired into the build script) it
// writes them to dist/ after `vite build`. The Vite dev plugin imports
// buildPages() to serve the identical pages in dev, so `npm run dev` mirrors
// the deployed site.
//
// Every local asset/link path is RELATIVE (styles/seo.css, profile.html, …)
// so the pages work in dev, preview, the GitHub Pages deploy, and file:// —
// the only absolute URLs are the canonical/og:url/social ones, which must be
// absolute by definition and come from the single BASE_URL constant.

import { build as esbuild } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// The generator is imported by the Vite config, where import.meta.url would
// point at the (bundled) config, not this file. Both callers (the CLI and the
// dev plugin) run from the project root, so process.cwd() is the reliable base.
const rootDir = process.cwd()

// Single source of truth for every deployed (absolute) URL.
const BASE_URL = 'https://piskan2.github.io/portfolio'
const OG_IMAGE = `${BASE_URL}/favicon.svg`

// ---------------------------------------------------------------------------
// Small pure helpers (no content dependency).
// ---------------------------------------------------------------------------
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function jsonLdScript(obj) {
  const json = JSON.stringify(obj, null, 2)
  // Escape only what matters when embedding JSON inside an HTML document.
  const safe = json.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  return `<script type="application/ld+json">${safe}</script>`
}

function renderHead({ title, description, canonical, type = 'website', siteName, css = 'styles/seo.css' }) {
  return `    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${esc(description)}" />
    <title>${esc(title)}</title>
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${OG_IMAGE}" />
    <meta property="og:site_name" content="${esc(siteName)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <link rel="stylesheet" href="${css}" />`
}

function document({ title, description, canonical, type, ldJson, body, siteName, css = 'styles/seo.css', mainClass = 'container' }) {
  return `<!doctype html>
<html lang="en">
  <head>
${renderHead({ title, description, canonical, type, siteName, css })}
${ldJson ? '\n' + ldJson + '\n' : ''}  </head>
  <body>
    <main class="${mainClass}">
${body}
    </main>
  </body>
</html>
`
}

function renderList(sectionId, heading, rows) {
  return `  <section id="${sectionId}" aria-label="${heading}">
    <h2>${heading}</h2>
    <ul class="compact">
${rows}
    </ul>
  </section>`
}

// ---------------------------------------------------------------------------
// buildPages(): bundle content.ts and return the two generated pages.
// ---------------------------------------------------------------------------
export async function buildPages() {
  const genDir = join(tmpdir(), 'portfolio-static-pages')
  mkdirSync(genDir, { recursive: true })
  const outfile = join(genDir, 'content.mjs')
  await esbuild({
    entryPoints: [join(rootDir, 'src/examples/content.ts')],
    outfile,
    bundle: true,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  })

  const {
    profile,
    contact,
    certs,
    projects,
    experience,
    skillGroups,
    writing,
  } = await import(pathToFileURL(outfile).href)

  const siteName = `${profile.name} — Portfolio`

  function personNode() {
    const knowsAbout = skillGroups.flatMap((g) => g.skills.map((s) => s.name))
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.role,
      residence: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: profile.location.split(',')[0].trim(),
        },
      },
      worksFor: {
        '@type': 'Organization',
        name: profile.currentCompany,
      },
      knowsAbout,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'employment relations',
        url: contact.linkedin,
      },
      sameAs: [contact.linkedin],
    }
  }

  function renderSkills() {
    const groups = skillGroups.map((g) => {
      const items = g.skills
        .map((s) => `        <li class="${s.primary ? 'skill-primary' : ''}">${esc(s.name)}</li>`)
        .join('\n')
      return `    <div class="skill-group">
      <h3>${esc(g.title)}</h3>
      <ul>
${items}
      </ul>
    </div>`
    })
    return `  <section id="skills" aria-label="Skills by category">
    <h2>Skills by category</h2>
    <div class="skill-groups">
${groups.join('\n')}
    </div>
  </section>`
  }

  function renderProjects() {
    const blocks = projects.map((p) => {
      const stack = p.stack.map((t) => `          <li>${esc(t)}</li>`).join('\n')
      return `    <article class="block">
      <h3>${esc(p.title)}</h3>
      <p><strong>${esc(p.company)}</strong> &middot; ${esc(p.period)}</p>
      <p>${esc(p.description)}</p>
      <p><span class="label">Stack:</span></p>
      <ul class="stack">
${stack}
      </ul>
    </article>`
    })
    return `  <section id="projects" aria-label="Selected projects">
    <h2>Selected projects</h2>
${blocks.join('\n')}
  </section>`
  }

  function renderExperience() {
    const blocks = experience.map((e) => {
      const loc = e.location ? ` &middot; ${esc(e.location)}` : ''
      const achievements = e.achievements.map((a) => `          <li>${esc(a)}</li>`).join('\n')
      const tech = e.techStack.map((t) => `          <li>${esc(t)}</li>`).join('\n')
      const achHtml = achievements
        ? `      <ul class="achievements">
${achievements}
      </ul>`
        : ''
      const techHtml = tech
        ? `      <ul class="stack">
${tech}
      </ul>`
        : ''
      return `    <article class="block">
      <h3>${esc(e.company)}</h3>
      <p>${esc(e.role)} &middot; ${esc(e.period)}${loc}</p>
      <p>${esc(e.description)}</p>
${achHtml}
${techHtml}
    </article>`
    })
    return `  <section id="experience" aria-label="Experience timeline">
    <h2>Experience timeline</h2>
${blocks.join('\n')}
  </section>`
  }

  // ----- Landing page (dist/index.html) -----
  const LANDING_CANONICAL = `${BASE_URL}/`
  const LANDING_DESCRIPTION = `${profile.name} — ${profile.role}. ${profile.summary[0].slice(0, 150)}`
  const LANDING_TITLE = `${profile.name} — ${profile.role}`

  // Shell-style host derived from the name (NFD-normalised, diacritics
  // stripped, first token, lowercased) — never hardcoded.
  const host = profile.name
    .split(' ')[0]
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  // The hero carries the first summary line; About carries the rest, so no
  // paragraph is repeated.
  const aboutHtml = profile.summary
    .slice(1)
    .map((p) => `        <p>${esc(p)}</p>`)
    .join('\n')

  const landingBody = `    <header class="term-bar">
      <span class="term-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="term-title">${esc(host)}@portfolio — bash</span>
    </header>
    <div class="term-body">
      <p class="prompt-line"><span class="prompt">${esc(host)}@portfolio:~$</span> whoami<span class="caret" aria-hidden="true"></span></p>
      <h1>${esc(profile.name)} &mdash; ${esc(profile.role)}</h1>
      <p class="meta">
        <span><span class="label">Location</span> ${esc(profile.location)}</span>
        <span><span class="label">Experience</span> ${esc(profile.yearsExperience)}</span>
      </p>
      <p class="pitch">${esc(profile.summary[0])}</p>
      <div class="cta-row">
        <a class="btn" href="profile.html">Full profile</a>
        <a class="btn secondary" href="terminal.html">Terminal demo</a>
      </div>
      <section id="about" aria-label="About">
        <h2>About</h2>
${aboutHtml}
      </section>
    </div>`

  const landingHtml = document({
    title: LANDING_TITLE,
    description: LANDING_DESCRIPTION,
    canonical: LANDING_CANONICAL,
    type: 'website',
    siteName,
    css: 'styles/landing.css',
    mainClass: 'term',
    ldJson: jsonLdScript(personNode()),
    body: landingBody,
  })

  // ----- Static profile page (dist/profile.html) -----
  const PROFILE_CANONICAL = `${BASE_URL}/profile.html`
  const PROFILE_DESCRIPTION = `${profile.name} — ${profile.role}, ${profile.location}. ${profile.yearsExperience} years of experience. Full timeline, skills, projects, education, and certifications.`
  const PROFILE_TITLE = `Profile — ${profile.name}`

  const metaHtml = `      <ul class="meta">
        <li><span class="label">Location</span> ${esc(profile.location)}</li>
        <li><span class="label">Experience</span> ${esc(profile.yearsExperience)}</li>
        <li><span class="label">Career start</span> ${esc(profile.careerStart)}</li>
        <li><span class="label">Currently at</span> ${esc(profile.currentCompany)}</li>
      </ul>`

  const summaryHtml = profile.summary.map((p) => `      <p>${esc(p)}</p>`).join('\n')

  const contactHtml = `      Connect on <a class="contact-link" href="${esc(contact.linkedin)}">${esc(contact.label)}</a>`

  const eduRows = profile.education
    .map(
      (e) =>
        `      <li><h3>${esc(e.degree)}</h3> ${esc(e.institution)} <span class="year">${esc(e.years)}</span></li>`,
    )
    .join('\n')

  const certRows = certs
    .map((c) => `      <li><h3>${esc(c.name)}</h3> ${esc(c.issuer)}</li>`)
    .join('\n')

  const writingHtml = writing.length
    ? writing
        .map(
          (w) =>
            `      <li><h3>${esc(w.title)}</h3> <span class="year">${esc(w.date)}</span><p>${esc(w.excerpt)}</p></li>`,
        )
        .join('\n')
    : '      <p class="empty">No published writing yet</p>'

  const profileBody = `    <header class="hero">
      <h1>${esc(profile.name)}</h1>
      <span class="role">${esc(profile.role)}</span>
${metaHtml}
${contactHtml}
    </header>
${renderList('summary', 'Summary', summaryHtml)}
${renderSkills()}
${renderProjects()}
${renderExperience()}
${renderList('education', 'Education', eduRows)}
${renderList('certs', 'Certifications', certRows)}
  <section id="writing" aria-label="Writing">
    <h2>Writing</h2>
    <ul class="compact">
${writingHtml}
    </ul>
  </section>
  <section id="contact" aria-label="Contact">
    <h2>Contact</h2>
${contactHtml}
  </section>
    <footer>
      <p>${esc(profile.name)} &middot; ${esc(profile.role)}</p>
    </footer>`

  const profileLdJson = jsonLdScript({
    '@context': 'https://schema.org',
    '@graph': [
      personNode(),
      {
        '@type': 'ItemList',
        name: 'Selected projects',
        description: 'Projects from the profile timeline.',
        itemListElement: projects.map((p, i) => ({
          '@type': 'CreativeWork',
          position: i + 1,
          name: p.title,
          description: p.description,
          author: { '@type': 'Person', name: profile.name },
        })),
      },
    ],
  })

  const profileHtml = document({
    title: PROFILE_TITLE,
    description: PROFILE_DESCRIPTION,
    canonical: PROFILE_CANONICAL,
    type: 'ProfilePage',
    siteName,
    ldJson: profileLdJson,
    body: profileBody,
  })

  return {
    landingHtml,
    profileHtml,
    counts: {
      projects: projects.length,
      experience: experience.length,
      certs: certs.length,
      writing: writing.length,
    },
  }
}

// ---------------------------------------------------------------------------
// CLI: when run directly, write the pages to dist/.
// ---------------------------------------------------------------------------
const isMain =
  process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url)

if (isMain) {
  const distDir = join(rootDir, 'dist')
  const { landingHtml, profileHtml, counts } = await buildPages()
  writeFileSync(join(distDir, 'index.html'), landingHtml)
  writeFileSync(join(distDir, 'profile.html'), profileHtml)
  console.log('[generate-static-pages] wrote dist/index.html and dist/profile.html')
  console.log(
    `[generate-static-pages] ${counts.projects} projects, ${counts.experience} roles, ${counts.certs} certs, ${counts.writing} writing items`,
  )
}
