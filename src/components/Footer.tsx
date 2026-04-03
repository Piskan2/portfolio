import type { ReactElement } from 'react';

export default function Footer(): ReactElement {
  return (
    <footer className="mg-footer">
      <div className="mg-footer__inner">
        <span className="mg-footer__brand">
          Petr <span>Novák</span>
        </span>
        <p className="mg-footer__copy">
          &copy; {new Date().getFullYear()} — Full Stack Engineer
        </p>
      </div>
    </footer>
  );
}
