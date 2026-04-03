import type { ReactElement } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function AboutSection(): ReactElement {
  const sectionRef = useScrollReveal();

  return (
    <section id="about" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div className="mg-section">
        <header className="mg-section__header">
          <span className="mg-section__number mg-animate from-below">02 — About</span>
          <h2 className="mg-section__title mg-animate from-below">
            Engineer by trade,<br /><em>problem solver</em> by nature
          </h2>
        </header>

        <div className="mg-about__grid">
          <div className="mg-about__prose mg-animate from-left">
            <p>
              I'm a <span className="mg-about__highlight">Full Stack Engineer</span> currently
              at Inflection AI, where I build and maintain the infrastructure that powers
              production AI agent systems. My work sits at the intersection of backend
              reliability, LLM tooling, and developer experience.
            </p>
            <p>
              My background spans <span className="mg-about__highlight">9+ years</span> across
              startups and scale-ups — from early-stage product integrations to high-traffic
              distributed systems. I have a deep affinity for clean architecture, async-first
              design, and shipping systems that genuinely hold up under load.
            </p>
            <p>
              Outside of work I explore open-source AI tooling and keep a close eye on how
              developer tooling is evolving. I&apos;m especially interested in system design,
              reliability, and the kind of engineering decisions that make complex systems
              feel simple to use.
            </p>
          </div>

          <div className="mg-about__panel">
            <div className="mg-about__stat-group mg-animate from-right">
              <p className="mg-about__stat-label">Education</p>
              <p className="mg-about__stat-value">
                Ing. Applied Informatics
                <small>Prague University of Economics and Business, 2019–2021</small>
              </p>
              <p className="mg-about__stat-value mg-about__stat-value--spaced">
                Bc. Information Technology
                <small>University of Pardubice, 2014–2019</small>
              </p>
            </div>

            <div className="mg-about__stat-group mg-animate from-right">
              <p className="mg-about__stat-label">Current Role</p>
              <p className="mg-about__stat-value">
                Full Stack Engineer
                <small>Inflection AI · Prague</small>
              </p>
            </div>

            <div className="mg-about__stat-group mg-animate from-right">
              <p className="mg-about__stat-label">Location</p>
              <p className="mg-about__stat-value">Prague, Czech Republic</p>
            </div>

            <div className="mg-about__stat-group mg-animate from-right">
              <p className="mg-about__stat-label">Quick Links</p>
              <p className="mg-about__stat-value">
                <a
                  href="https://linkedin.com/in/pe-nov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mg-about__link"
                >
                  LinkedIn
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
