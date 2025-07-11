/**
 * Mocks for Next.js server components and utilities
 */

// Import the shared Web API globals setup
const { setupWebAPIGlobals } = require('../../jest-setup-node-globals');

// Ensure Web API globals are available
setupWebAPIGlobals();

// Now we can reference Request safely
// Mock NextRequest class
export class NextRequest extends global.Request {
  constructor(input, init = {}) {
    super(input || 'https://example.com', init);

    // Add any additional properties or methods used in tests
    this._mockData = {};

    // Override json method
    this.json = jest.fn().mockImplementation(() => {
      return Promise.resolve(this._mockData);
    });
  }

  // Helper for tests to set the mock data
  _setMockData(data) {
    this._mockData = data;
    return this;
  }
}

// Mock NextResponse class
export class NextResponse extends Response {
  constructor(body, init = {}) {
    super(typeof body === 'object' ? JSON.stringify(body) : body, init);
  }

  // Static json method
  static json(body, init = {}) {
    const response = new NextResponse(JSON.stringify(body), {
      status: init?.status || 200,
      headers: {
        'content-type': 'application/json',
        ...init?.headers,
      },
    });
    return response;
  }

  // Add json method to parse response body
  json() {
    return this.text().then(function(text) {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    });
  }
}

// Mock additional exports as needed
export const userAgent = jest.fn().mockImplementation(() => ({
  browser: { name: 'jest', version: '1.0.0' },
  device: { model: 'test', type: 'test' },
  engine: { name: 'jest', version: '1.0.0' },
  os: { name: 'jest', version: '1.0.0' },
  cpu: { architecture: 'test' },
}));

// Re-export the Request object to avoid errors
export const Request = global.Request;
