import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';

const LINE_DELAYS = [0, 400, 900, 1300, 1700, 2100, 2700];

export default function HeroSection(): ReactElement {
  const leftRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  useEffect(() => {
    const el = leftRef.current;
    if (!el) {
      return;
    }

    const timers = Array.from(el.querySelectorAll<HTMLElement>('.mg-animate')).map((item, i) =>
      window.setTimeout(() => item.classList.add('is-visible'), 100 + i * 120)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  useEffect(() => {
    const el = terminalRef.current;
    if (!el) {
      return;
    }

    const timer = window.setTimeout(() => el.classList.add('is-visible'), 300);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timers = LINE_DELAYS.map((delay, i) =>
      window.setTimeout(() => {
        setRevealed((prev) => new Set([...prev, i]));
      }, delay)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const vis = (i: number) => (revealed.has(i) ? undefined : { opacity: 0 });

  return (
    <section id="home" className="mg-hero mg-hero--terminal">
      <div className="mg-hero__grid-bg" aria-hidden="true" />

      <div className="mg-hero__split">
        <div className="mg-hero__left" ref={leftRef}>
          <p className="mg-hero__overline mg-animate from-below">
            Full Stack Engineer &amp; AI Specialist
          </p>
          <h1 className="mg-hero__name">
            <span className="mg-hero__name-first mg-animate from-left">Petr</span>
            <span className="mg-hero__name-last mg-animate from-left">Novák</span>
          </h1>
          <p className="mg-hero__role mg-animate from-below">
            <strong>Full Stack Engineer</strong> @ Inflection AI &mdash; building
            enterprise AI platforms
          </p>
          <p className="mg-hero__description mg-animate from-below">
            9+ years turning complex engineering problems into clean, scalable solutions.
            From distributed microservices to LLM-powered agentic pipelines.
          </p>
          <div className="mg-hero__cta mg-animate from-below">
            <a href="#experience" className="mg-btn mg-btn--primary">
              View Work
            </a>
            <a href="#contact" className="mg-btn mg-btn--outline">
              Get in Touch
            </a>
          </div>
        </div>

        <div className="mg-animate from-right" ref={terminalRef}>
          <div className="mg-terminal" aria-label="Skills overview terminal">
            <div className="mg-terminal__titlebar">
              <span className="mg-terminal__dot mg-terminal__dot--red" />
              <span className="mg-terminal__dot mg-terminal__dot--yellow" />
              <span className="mg-terminal__dot mg-terminal__dot--green" />
              <span className="mg-terminal__title">petr@devbox &mdash; ~/profile</span>
            </div>
            <div className="mg-terminal__body">
              <span className="mg-terminal__line" style={vis(0)}>
                <span className="mg-terminal__prompt">&gt;</span>
                {' '}./init_profile.sh
              </span>
              <span className="mg-terminal__line mg-terminal__line--dim" style={vis(1)}>
                [INFO] Booting systems...
              </span>
              <span className="mg-terminal__line" style={vis(2)}>
                <span className="mg-terminal__key">Loading Backend:</span>
                {'   '}Java 17, Spring Boot, Python &mdash;{' '}
                <span className="mg-terminal__ok">SUCCESS</span>
              </span>
              <span className="mg-terminal__line" style={vis(3)}>
                <span className="mg-terminal__key">Loading Frontend:</span>
                {'  '}React, Next.js, TS &mdash;{' '}
                <span className="mg-terminal__ok">SUCCESS</span>
              </span>
              <span className="mg-terminal__line" style={vis(4)}>
                <span className="mg-terminal__key">Loading Cloud:</span>
                {'     '}Docker, K8s, GitHub CI/CD &mdash;{' '}
                <span className="mg-terminal__ok">SUCCESS</span>
              </span>
              <span className="mg-terminal__line" style={vis(5)}>
                <span className="mg-terminal__key">Loading AI:</span>
                {'       '}LangGraph, LiteLLM &mdash;{' '}
                <span className="mg-terminal__ok">SUCCESS</span>
              </span>
              <span className="mg-terminal__line" style={vis(6)}>
                <span className="mg-terminal__prompt">&gt;</span>
                {' '}System ready. Awaiting connection
                <span className="mg-terminal__cursor" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mg-hero__scroll-hint mg-hero__scroll-hint--floating mg-animate from-below">
        <div className="mg-hero__scroll-arrow" />
        Scroll
      </div>
    </section>
  );
}
