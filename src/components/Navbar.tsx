import { useState, useEffect, useCallback } from 'react';
import type { ReactElement } from 'react';

const NAV_LINKS = [
  { label: 'About',      href: '#about' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact',    href: '#contact' },
];

export default function Navbar(): ReactElement {
  const [scrolled, setScrolled] = useState(() => window.scrollY > 20);
  const [progress, setProgress] = useState(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const { scrollY } = window;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setScrolled(scrollY > 20);
    setProgress(docHeight > 0 ? (scrollY / docHeight) * 100 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <>
      <header className={`mg-nav${scrolled ? ' scrolled' : ''}${menuOpen ? ' mg-nav--open' : ''}`}>
        <div className="mg-nav__progress" style={{ width: `${progress}%` }} />
        <div className="mg-nav__inner">
          <a href="#home" className="mg-nav__brand" aria-label="Go to home section">
            Petr <span>Novák</span>
          </a>
          <nav className="mg-nav__links" aria-label="Primary navigation">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="mg-nav__link">
                {l.label}
              </a>
            ))}
          </nav>
          <button
            className="mg-nav__menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <nav
        id="mobile-navigation"
        className={`mg-nav__drawer${menuOpen ? ' is-open' : ''}`}
        aria-label="Mobile navigation"
      >
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="mg-nav__link"
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}
