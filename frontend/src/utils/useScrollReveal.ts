import { useEffect } from 'react';

/**
 * Lightweight, hardware-accelerated Scroll Reveal hook.
 * Uses IntersectionObserver to reveal elements once with subtle translateY(12px) and opacity.
 * Respects prefers-reduced-motion and unobserves upon entry.
 * Safe for test environments (JSDOM) and server-side rendering.
 */
export function useScrollReveal(dependencies: any[] = []): void {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const prefersReducedMotion =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    const hasIntersectionObserver = typeof window.IntersectionObserver === 'function';

    const elements = document.querySelectorAll<HTMLElement>('.bis-reveal:not(.bis-revealed)');
    if (elements.length === 0) return;

    if (prefersReducedMotion || !hasIntersectionObserver) {
      elements.forEach((el) => el.classList.add('bis-revealed'));
      return;
    }

    const observer = new window.IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('bis-revealed');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.08,
      }
    );

    elements.forEach((el, index) => {
      if (!el.style.getPropertyValue('--reveal-stagger')) {
        const staggerIndex = index % 8;
        el.style.setProperty('--reveal-stagger', `${staggerIndex * 35}ms`);
      }
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, dependencies);
}
