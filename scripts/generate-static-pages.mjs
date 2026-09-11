// Build-time generator for the two crawlable static pages.
//
// Runs AFTER `vite build` (see the "build" script in package.json) so that
// public/ and dist/terminal.html already exist. It bundles src/examples/
// content.ts with esbuild (build-only tooling — never shipped to a browser),
// then writes dist/index.html (landing) and dist/profile.html (static HR
// profile). Every name/company/date/location comes from content.ts.
//
// .mjs at repo root: not bundled by Vite, not type-checked by tsc.

import { build as esbuild } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const DIST_DIR = rootDir + 'dist'
const GENERATOR_DIR = DIST_DIR + '/.gen'

// Single source of truth for every deployed URL.
const BASE_URL = 'https://piskan2.github.io/portfolio'
const OG_IMAGE = `${BASE_URL}/favicon.svg`

// ---------------------------------------------------------------------------
// Load content (bundled from the single TypeScript source of truth).
// ---------------------------------------------------------------------------
mkdirSync(GENERATOR_DIR, { recursive: true })

await esbuild({
  entryPoints: [rootDir + 'src/examples/content.ts'],
  outfile: GENERATOR_DIR + '/content.mjs',
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
} = await import(GENERATOR_DIR + '/content.mjs')

// ---------------------------------------------------------------------------
// Small helpers.
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

function renderHead({ title, description, canonical, type = 'website' }) {
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
    <meta property="og:site_name" content="${esc(profile.name)} — Portfolio" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(title)}" />
    <meta name="twitter:description" content="${esc(description)}" />
    <link rel="stylesheet" href="styles/seo.css" />`
}

function document({ title, description, canonical, type, ldJson, body }) {
  return `<!doctype html>
<html lang="en">
  <head>
${renderHead({ title, description, canonical, type })}
${ldJson ? '\n' + ldJson + '\n' : ''}  </head>
  <body>
    <main class="container">
${body}
    </main>
  </body>
</html>
`
}

// ---------------------------------------------------------------------------
// Section renderers for the static profile.
// ---------------------------------------------------------------------------
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

function renderList(sectionId, heading, rows) {
  return `  <section id="${sectionId}" aria-label="${heading}">
    <h2>${heading}</h2>
    <ul class="compact">
${rows}
    </ul>
  </section>`
}

// ---------------------------------------------------------------------------
// Landing page (dist/index.html): crawlable, no JS.
// ---------------------------------------------------------------------------
const LANDING_CANONICAL = `${BASE_URL}/`
const LANDING_DESCRIPTION = `${profile.name} — ${profile.role}. ${profile.summary[0].slice(0, 150)}`
const LANDING_TITLE = `${profile.name} — ${profile.role}`

const landingBody = `    <header class="hero">
      <h1>${esc(profile.name)} &mdash; ${esc(profile.role)}</h1>
      <p class="meta">
        <span><span class="label">Location</span>: ${esc(profile.location)}</span>
        <span><span class="label">Experience</span>: ${esc(profile.yearsExperience)}</span>
      </p>
      <p class="pitch">${esc(profile.summary[0])}</p>
      <div class="cta-row">
        <a class="btn" href="profile.html">Full profile</a>
        <a class="btn secondary" href="terminal.html">Terminal demo</a>
      </div>
    </header>
    <section id="about" aria-label="About">
      <h2>About</h2>
      <p>${esc(profile.summary[0])}</p>
    </section>`

const landingHtml = document({
  title: LANDING_TITLE,
  description: LANDING_DESCRIPTION,
  canonical: LANDING_CANONICAL,
  type: 'website',
  ldJson: jsonLdScript(personNode()),
  body: landingBody,
})

// ---------------------------------------------------------------------------
// Static profile page (dist/profile.html): crawlable HR/bot profile, no JS.
// ---------------------------------------------------------------------------
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
  ldJson: profileLdJson,
  body: profileBody,
})

// ---------------------------------------------------------------------------
// Write.
// ---------------------------------------------------------------------------
writeFileSync(DIST_DIR + '/index.html', landingHtml)
writeFileSync(DIST_DIR + '/profile.html', profileHtml)

console.log('[generate-static-pages] wrote dist/index.html and dist/profile.html')
console.log(`[generate-static-pages] ${projects.length} projects, ${experience.length} roles, ${certs.length} certs, ${writing.length} writing items`)
