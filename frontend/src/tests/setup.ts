import '@testing-library/jest-dom/vitest';
import { setMockMode } from '../services/apiConfig';

// JSDOM polyfills
if (typeof window !== 'undefined') {
  window.HTMLElement.prototype.scrollIntoView = function () {};
  setMockMode(true);
}

