/**
 * Set up global objects required for Node.js
 * testing environment
 * This file should be imported in jest.setup.js
 */

// Setup global.Request if running in a Node.js environment
if (typeof global.Request === 'undefined') {
  global.Request = function Request(input, init = {}) {
    return {
      url: input,
      method: init.method || 'GET',
      headers: new Headers(init.headers || {}),
      body: init.body,
    };
  };
}

// Setup Headers if needed
if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = { ...init };
    }

    append(name, value) {
      this._headers[name.toLowerCase()] = value;
    }

    get(name) {
      return this._headers[name.toLowerCase()];
    }

    has(name) {
      return name.toLowerCase() in this._headers;
    }
  };
}

// Setup Response if needed
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new Headers(init.headers || {});
      this._bodyText = typeof body === 'string' ? body : JSON.stringify(body);
    }

    text() {
      return Promise.resolve(this._bodyText);
    }

    json() {
      return this.text().then(text => JSON.parse(text));
    }
  };
}
