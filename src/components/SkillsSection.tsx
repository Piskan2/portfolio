import type { ReactElement } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Skill {
  name: string;
  primary?: boolean;
}
interface Category {
  title: string;
  skills: Skill[];
}

const CATEGORIES: Category[] = [
  {
    title: 'Backend & Cloud',
    skills: [
      { name: 'Java / Spring Boot', primary: true },
      { name: 'Python', primary: true },
      { name: 'Node.js' },
      { name: 'RESTful APIs' },
      { name: 'Microservices' },
      { name: 'AWS & GCP' },
    ],
  },
  {
    title: 'Frontend',
    skills: [
      { name: 'React / Next.js', primary: true },
      { name: 'TypeScript', primary: true },
      { name: 'Ember.js' },
      { name: 'Tailwind CSS' },
      { name: 'HTML5 / CSS3' },
    ],
  },
  {
    title: 'Databases',
    skills: [
      { name: 'PostgreSQL / MySQL', primary: true },
      { name: 'Oracle SQL / PL-SQL' },
      { name: 'MongoDB' },
      { name: 'Redis' },
      { name: 'BigQuery' },
    ],
  },
  {
    title: 'DevOps & CI/CD',
    skills: [
      { name: 'Docker / Kubernetes', primary: true },
      { name: 'GitHub Actions / GitLab CI' },
      { name: 'Jenkins' },
      { name: 'Linux Operations' },
    ],
  },
  {
    title: 'AI & Data',
    skills: [
      { name: 'AI Agent Orchestration', primary: true },
      { name: 'LangChain' },
      { name: 'Anomaly Detection' },
      { name: 'Data Pipeline Design' },
    ],
  },
  {
    title: 'Tools & Platforms',
    skills: [
      { name: 'Git / SVN' },
      { name: 'Jira / Confluence' },
      { name: 'SonarQube' },
      { name: 'Networking (CCNA)' },
    ],
  },
];

const ALL_SKILL_NAMES = CATEGORIES.flatMap((c) => c.skills.map((s) => s.name));
const TICKER_ITEMS = [...ALL_SKILL_NAMES, ...ALL_SKILL_NAMES]; // duplicate for seamless loop

const CERTS = [
  'CCNA 1–4 Routing & Switching — Cisco',
];

export default function SkillsSection(): ReactElement {
  const sectionRef = useScrollReveal();

  return (
    <section id="skills" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div className="mg-section">
        <header className="mg-section__header">
          <span className="mg-section__number mg-animate from-below">03 — Skills</span>
          <h2 className="mg-section__title mg-animate from-below">
            Technologies &amp; <em>expertise</em>
          </h2>
        </header>

        {/* Ticker tape */}
        <div className="mg-skills__ticker-wrap mg-animate from-below">
          <div className="mg-skills__ticker">
            {TICKER_ITEMS.map((name, i) => (
              <span key={i} className="mg-skills__ticker-item">
                {name}
              </span>
            ))}
          </div>
        </div>

        {/* Category cards */}
        <div className="mg-skills__grid">
          {CATEGORIES.map((cat, i) => (
            <div
              key={cat.title}
              className="mg-skill-card mg-animate from-scale"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="mg-skill-card__header">
                <div className="mg-skill-card__dot" />
                <h3 className="mg-skill-card__title">{cat.title}</h3>
              </div>
              <ul className="mg-skill-card__list">
                {cat.skills.map((s) => (
                  <li
                    key={s.name}
                    className={`mg-skill-card__item${s.primary ? ' mg-skill-card__item--primary' : ''}`}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mg-skills__certs mg-animate from-below">
          <p className="mg-skills__cert-label">Certifications</p>
          <ul className="mg-skills__cert-list">
            {CERTS.map((c) => (
              <li key={c} className="mg-skills__cert-tag">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
