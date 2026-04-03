import { useRef, useEffect, useCallback } from 'react';

/**
 * Attaches an IntersectionObserver to all `.mg-animate` child elements
 * of the returned ref, adding `.is-visible` when they enter the viewport.
 */
export function useScrollReveal(rootMargin = '-80px') {
  const ref = useRef<HTMLElement>(null);

  const observe = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-visible');
          }
        });
      },
      { rootMargin, threshold: 0.1 }
    );
    el.querySelectorAll<HTMLElement>('.mg-animate').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [rootMargin]);

  useEffect(() => { return observe(); }, [observe]);
  return ref;
}
