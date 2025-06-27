/**
 * Setup global objects for testing Next.js API routes
 * This file configures global objects like fetch, Request, Response, etc.
 * that are needed for testing server-side Next.js functionality.
 */

// Use Node.js 18+ native fetch (no need for node-fetch)
// These are available globally in Node.js 18+

// Mock fetch globally if not already available (Node.js 18+ has native fetch)
if (!global.fetch) {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve() });
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  });
}

// Setup global Request class if not available (use native or mock)
if (!global.Request) {
  global.Request = class Request {
    constructor(input, init = {}) {
      this.url = input;
      this.method = init.method || 'GET';
      this.headers = new Headers(init.headers);
      this.body = init.body;
    }

    json() {
      return this.text().then(text => JSON.parse(text));
    }

    text() {
      return Promise.resolve(this.body || '');
    }
  };
}

// Setup global Response class if not available (use native or mock)
if (!global.Response) {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || 'OK';
      this.ok = this.status >= 200 && this.status < 300;
      this.headers = new Headers(init.headers);
    }

    json() {
      return Promise.resolve(JSON.parse(this.body));
    }

    text() {
      return Promise.resolve(this.body);
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
