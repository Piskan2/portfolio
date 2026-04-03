import type { ReactElement } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  website?: string;
  description: string;
  achievements: string[];
  techStack: string[];
}

const EXPERIENCES: Experience[] = [
  {
    company: 'Inflection AI',
    role: 'Full Stack Engineer',
    period: 'Nov 2024 – Present',
    location: 'Prague',
    website: 'https://inflection.ai/',
    description: 'Building production AI agent infrastructure: anomaly detection in external data lakes, system architecture, full-stack development, CI/CD, Kubernetes, advanced AI agents with Python.',
    achievements: [
      'Designed and implemented end-to-end chat interface for enterprise AI platform with secure collaborative interactions',
      'Built AI backend as orchestration layer over multiple specialized agents for complex query resolution',
      'Integrated Azure Entra ID for centralized identity and access management',
      'Improved frontend scalability with reusable React components and refactored legacy code',
    ],
    techStack: ['Python', 'React', 'Azure Entra ID', 'Kubernetes', 'CI/CD'],
  },
  {
    company: 'BoostKPI',
    role: 'Full Stack Engineer',
    period: 'Oct 2023 – Nov 2024',
    location: 'Prague',
    website: 'https://boostkpi.com/',
    description: 'Improved anomaly detection system for BigQuery datasets, managing full-stack architecture and data integrations.',
    achievements: [
      'Led company-wide migration from EmberJS to React',
      'Enhanced CI/CD pipelines using Kubernetes and GitHub Actions',
      'Engineered 10+ integrations with external data sources',
    ],
    techStack: ['React', 'BigQuery', 'Kubernetes', 'GitHub Actions', 'TypeScript'],
  },
  {
    company: 'T-Mobile Czech Republic',
    role: 'Full Stack Engineer',
    period: 'May 2023 – Oct 2023',
    location: 'Prague',
    website: 'https://www.t-mobile.cz/info/en',
    description: 'Developed advanced B2B web application for business proposal management; owned end-to-end DevOps configuration for Jenkins and GitLab pipelines.',
    achievements: [
      'Led migration of core DevOps processes from Jenkins to GitLab CI/CD',
    ],
    techStack: ['React', 'Node.js', 'Jenkins', 'GitLab CI/CD', 'Java'],
  },
  {
    company: 'BoostKPI (Blindspot Solutions)',
    role: 'Full Stack Engineer',
    period: 'Apr 2021 – May 2023',
    location: 'Prague',
    website: 'https://blindspot.ai/',
    description: 'Developed anomaly detection system for BigQuery, improved notification platform, and built integrations for external data warehouses.',
    achievements: [
      'Developed on-demand reservation system integrated into core service, cutting costs by 50%',
      'Designed notification system delivering updates via Email, Slack, and Microsoft Teams',
    ],
    techStack: ['Python', 'BigQuery', 'Kubernetes', 'Slack API', 'Email APIs'],
  },
  {
    company: 'Citrix',
    role: 'Java Backend Engineer',
    period: 'Sep 2020 – Mar 2021',
    location: 'Prague',
    website: 'https://www.citrix.com/',
    description: 'Maintained and improved SOAP and REST API connectors for cloud services in Citrix Workspace.',
    achievements: [
      'Enhanced SOAP/REST API connectors for cloud services in Citrix Workspace',
    ],
    techStack: ['Java', 'Spring Boot', 'SOAP', 'REST', 'AWS'],
  },
  {
    company: 'GEM System – Dr.Max',
    role: 'Java Backend Engineer',
    period: 'Feb 2020 – Sep 2020',
    location: 'Prague',
    website: 'https://www.gemsystem.cz/',
    description: 'Improved core integration platform enabling communication for pharmacies, stock, e-shop, and logistics across Europe.',
    achievements: [
      'Enhanced core integration platform for pharmacy and logistics systems across Europe',
    ],
    techStack: ['Java', 'Spring Boot', 'PL/SQL', 'REST API'],
  },
  {
    company: 'Citrix',
    role: 'Java Backend Engineer',
    period: 'Aug 2019 – Jan 2020',
    location: 'Prague',
    website: 'https://www.citrix.com/',
    description: 'Maintained SOAP and REST connectors for cloud services in Citrix Workspace software.',
    achievements: [
      'Maintained and improved SOAP/REST connectors for Citrix Workspace',
    ],
    techStack: ['Java', 'Spring Boot', 'SOAP', 'REST'],
  },
  {
    company: 'Travel Agency Fischer',
    role: 'Java Backend Engineer',
    period: 'Sep 2018 – Jul 2019',
    location: 'Prague',
    description: "Developed end-to-end integration with partner travel agencies into CK Fischer's Spring-based system.",
    achievements: [
      'Designed microservices-based connectors integrating SOAP and REST APIs with partner agencies',
      'Automated data exchange, improving efficiency and revenue',
    ],
    techStack: ['Java', 'Spring Boot', 'SOAP', 'REST', 'Microservices'],
  },
  {
    company: 'Unicorn Systems a.s.',
    role: 'Java Backend Engineer',
    period: 'Jan 2016 – Jun 2017',
    location: 'Hradec Králové',
    website: 'https://unicornsystems.eu/',
    description: 'Developed price coupling system for short-term electricity markets across 4MMC region and Central Europe.',
    achievements: [
      'Developed and maintained price coupling system for European electricity markets',
    ],
    techStack: ['Java', 'Spring', 'PL/SQL', 'SQL'],
  },
];

export default function ExperienceSection(): ReactElement {
  const sectionRef = useScrollReveal();

  return (
    <section id="experience" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div className="mg-section">
        <header className="mg-section__header">
          <span className="mg-section__number mg-animate from-below">04 — Experience</span>
          <h2 className="mg-section__title mg-animate from-below">
            9 years of <em>shipping</em>
          </h2>
        </header>

        <ol className="mg-exp__list">
          {EXPERIENCES.map((exp, i) => (
            <li
              key={`${exp.company}-${exp.period}`}
              className="mg-exp-chapter mg-animate from-below"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span className="mg-exp-chapter__ordinal" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="mg-exp-chapter__body">
                <div className="mg-exp-chapter__meta">
                  <p className="mg-exp-chapter__company">
                    {exp.website ? (
                      <a href={exp.website} target="_blank" rel="noopener noreferrer">
                        {exp.company}
                      </a>
                    ) : (
                      exp.company
                    )}
                  </p>
                  <p className="mg-exp-chapter__period">{exp.period}</p>
                  <p className="mg-exp-chapter__location">{exp.location}</p>
                </div>
                <div className="mg-exp-chapter__content">
                  <h3 className="mg-exp-chapter__role">{exp.role}</h3>
                  <p className="mg-exp-chapter__desc">{exp.description}</p>
                  {exp.achievements.length > 0 && (
                    <ul className="mg-exp-chapter__achievements">
                      {exp.achievements.map((a) => (
                        <li key={a} className="mg-exp-chapter__achievement">
                          {a}
                        </li>
                      ))}
                    </ul>
                  )}
                  <ul className="mg-exp-chapter__tags">
                    {exp.techStack.map((t) => (
                      <li key={t} className="mg-exp-chapter__tag">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
