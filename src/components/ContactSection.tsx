import type { ReactElement } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const LINKS = [
  {
    icon: '⬡',
    label: 'linkedin.com/in/pe-nov',
    href: 'https://linkedin.com/in/pe-nov',
    external: true,
  },
];

export default function ContactSection(): ReactElement {
  const sectionRef = useScrollReveal();

  return (
    <section id="contact" ref={sectionRef as React.RefObject<HTMLElement>}>
      <div className="mg-contact">
        <div className="mg-contact__inner">
          <p className="mg-contact__overline mg-animate from-below">05 — Contact</p>
          <h2 className="mg-contact__heading mg-animate from-below">
            Let's build something <em>great</em>
          </h2>
          <p className="mg-contact__sub mg-animate from-below">
            Open to senior engineering roles and interesting problems. If you're working on
            something ambitious, feel free to reach out on LinkedIn.
          </p>
          <ul className="mg-contact__links">
            {LINKS.map((l, i) => (
              <li key={l.href} className="mg-animate from-below" style={{ transitionDelay: `${i * 100}ms` }}>
                <a
                  href={l.href}
                  className="mg-contact__link"
                  {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <span className="mg-contact__link-icon" aria-hidden="true">
                    {l.icon}
                  </span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
