import '@testing-library/jest-dom/vitest';

// JSDOM polyfills
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = function () {};
}
