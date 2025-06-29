// This adds custom jest matchers from jest-dom
require('@testing-library/jest-dom');

// Setup global objects needed for testing Next.js API routes
require('./src/__mocks__/jest-setup-node-globals');

// Set database environment variables for all tests
// For CI environment, these should be set in the GitHub workflow
// For local testing, we use these defaults
if (!process.env.MONGODB_URI) {
  console.log('Setting default MONGODB_URI for tests');
  process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
}

if (!process.env.MONGODB_DB_NAME) {
  console.log('Setting default MONGODB_DB_NAME for tests');
  process.env.MONGODB_DB_NAME = 'testdb';
}

// Log the MongoDB connection details for debugging
console.log(
  `Using MongoDB: ${process.env.MONGODB_URI}, DB: ${process.env.MONGODB_DB_NAME}`
);

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

// Mock Mongoose and BSON globally to prevent import issues
jest.mock('bson', () => ({
  ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || 'mock-object-id' })),
}));

jest.mock('mongodb', () => ({
  MongoClient: jest.fn(),
  ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || 'mock-object-id' })),
}));

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn(),
  },
  Schema: jest.fn().mockImplementation(function(definition) {
    return {
      pre: jest.fn(),
      post: jest.fn(),
      methods: {},
      statics: {},
      virtual: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
      }),
      plugin: jest.fn(),
      index: jest.fn(),
    };
  }),
  model: jest.fn(),
  models: {},
  Types: {
    ObjectId: jest.fn().mockImplementation((id) => ({ toString: () => id || 'mock-object-id' })),
  },
}));
