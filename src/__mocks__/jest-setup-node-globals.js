/**
 * Setup global objects for testing Next.js API routes
 * This file configures global objects like fetch, Request, Response, etc.
 * that are needed for testing server-side Next.js functionality.
 */

// Import fetch for Node.js environment
const {
  default: fetch,
  Request: NodeRequest,
  Response: NodeResponse,
} = require('node-fetch');

// Mock fetch globally if not already available
if (!global.fetch) {
  global.fetch = fetch;
}

// Setup global Request class if not available
if (!global.Request) {
  global.Request = class Request extends NodeRequest {
    constructor(input, init = {}) {
      super(input, init);

      // Add json method if not present
      if (!this.json) {
        this.json = () => {
          return this.text().then(text => JSON.parse(text));
        };
      }
    }
  };
}

// Setup global Response class if not available
if (!global.Response) {
  global.Response = class Response extends NodeResponse {
    constructor(body, init = {}) {
      super(body, init);

      // Add json method if not present
      if (!this.json) {
        this.json = () => {
          return this.text().then(text => JSON.parse(text));
        };
      }
    }
  };
}

// Setup global Headers class if not available
if (!global.Headers) {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map();

      if (init) {
        if (typeof init.forEach === 'function') {
          init.forEach((value, key) => this.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.set(key, value));
        }
      }
    }

    get(name) {
      return this._headers.get(name.toLowerCase());
    }

    set(name, value) {
      this._headers.set(name.toLowerCase(), String(value));
    }

    has(name) {
      return this._headers.has(name.toLowerCase());
    }

    delete(name) {
      this._headers.delete(name.toLowerCase());
    }

    *[Symbol.iterator]() {
      yield* this._headers;
    }
  };
}
