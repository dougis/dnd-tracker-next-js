// This adds custom jest matchers from jest-dom
require('@testing-library/jest-dom');

// Set up missing browser APIs
global.MutationObserver = class {
  constructor(_callback) {}
  disconnect() {}
  observe(_element, _initObject) {}
  takeRecords() {
    return [];
  }
};

// Mock IntersectionObserver which is not available in test environment
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver which is not available in test environment
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia only in jsdom environment
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = function (callback) {
  return setTimeout(callback, 0);
};

// Mock cancelAnimationFrame
global.cancelAnimationFrame = function (id) {
  clearTimeout(id);
};

// Suppress React 18 console warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suppress React 18 scheduler errors (act warnings)
  const reactSchedulerWarnings = [
    'Warning: An update to %s inside a test was not wrapped in act',
    'The current testing environment is not configured to support act',
  ];

  if (
    args.some(
      arg =>
        typeof arg === 'string' &&
        reactSchedulerWarnings.some(warning => arg.includes(warning))
    )
  ) {
    return;
  }

  originalConsoleError(...args);
};
