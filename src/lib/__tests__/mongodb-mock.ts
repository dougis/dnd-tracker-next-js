/**
 * MongoDB mocking module for tests
 * 
 * This module provides mock implementations of MongoDB methods to allow
 * tests to run without an actual database connection.
 */

// Create mock schema and model functionality
class MockSchema {
  private hooks: Record<string, any> = {};
  private methods: Record<string, any> = {};
  private statics: Record<string, any> = {};
  private virtuals: Record<string, any> = {};

  constructor(definition: any, options: any = {}) {
    // Store schema definition and options for reference
    this.definition = definition;
    this.options = options;
  }

  // Pre and post hooks
  pre(hookName: string, fn: Function) {
    if (!this.hooks[hookName]) {
      this.hooks[hookName] = [];
    }
    this.hooks[hookName].push(fn);
    return this;
  }

  post(hookName: string, fn: Function) {
    if (!this.hooks[`post_${hookName}`]) {
      this.hooks[`post_${hookName}`] = [];
    }
    this.hooks[`post_${hookName}`].push(fn);
    return this;
  }

  // Add instance method
  method(name: string, fn: Function) {
    this.methods[name] = fn;
    return this;
  }

  // Add static method
  static(name: string, fn: Function) {
    this.statics[name] = fn;
    return this;
  }

  // Add virtual property
  virtual(name: string) {
    this.virtuals[name] = {
      get: (fn: Function) => {
        this.virtuals[name].getter = fn;
        return this.virtuals[name];
      },
      set: (fn: Function) => {
        this.virtuals[name].setter = fn;
        return this.virtuals[name];
      }
    };
    return this.virtuals[name];
  }

  // Configuration methods
  set(key: string, value: any) {
    this.options[key] = value;
    return this;
  }
}

// Create a mock query builder that is chainable
class MockQuery {
  constructor(private data: any[] = []) {}

  // Query methods
  find(conditions: any = {}) {
    return this;
  }

  findOne(conditions: any = {}) {
    return this;
  }

  findById(id: string) {
    return this;
  }

  // Modification methods
  updateOne(conditions: any, update: any) {
    return Promise.resolve({ modifiedCount: 1, acknowledged: true });
  }

  updateMany(conditions: any, update: any) {
    return Promise.resolve({ modifiedCount: 2, acknowledged: true });
  }

  deleteOne(conditions: any) {
    return Promise.resolve({ deletedCount: 1, acknowledged: true });
  }

  deleteMany(conditions: any) {
    return Promise.resolve({ deletedCount: 2, acknowledged: true });
  }

  // Aggregation and counting
  countDocuments(conditions: any = {}) {
    return Promise.resolve(this.data.length);
  }

  aggregate(pipeline: any[]) {
    return this;
  }

  // Pagination methods
  sort(criteria: any) {
    return this;
  }

  skip(n: number) {
    return this;
  }

  limit(n: number) {
    return this;
  }

  // Result methods
  lean() {
    return this;
  }

  populate(path: string | any) {
    return this;
  }

  select(fields: string | any) {
    return this;
  }

  // Execute and return results
  exec() {
    return Promise.resolve(this.data);
  }
}

// Create mock model generator
function createMockModel(name: string, schema: any) {
  const model: any = function(data: any) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
      populate: jest.fn().mockReturnThis(),
      execPopulate: jest.fn().mockResolvedValue(data),
      remove: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    };
  };

  // Add static methods
  model.find = jest.fn().mockImplementation(() => new MockQuery());
  model.findOne = jest.fn().mockImplementation(() => new MockQuery());
  model.findById = jest.fn().mockImplementation(() => new MockQuery());
  model.create = jest.fn().mockImplementation((data) => Promise.resolve(data));
  model.updateOne = jest.fn().mockImplementation(() => Promise.resolve({ modifiedCount: 1 }));
  model.updateMany = jest.fn().mockImplementation(() => Promise.resolve({ modifiedCount: 2 }));
  model.deleteOne = jest.fn().mockImplementation(() => Promise.resolve({ deletedCount: 1 }));
  model.deleteMany = jest.fn().mockImplementation(() => Promise.resolve({ deletedCount: 2 }));
  model.countDocuments = jest.fn().mockImplementation(() => Promise.resolve(0));
  model.aggregate = jest.fn().mockImplementation(() => new MockQuery());

  // Add additional methods from schema if provided
  if (schema && schema.statics) {
    Object.keys(schema.statics).forEach(key => {
      model[key] = schema.statics[key];
    });
  }

  return model;
}

// Mock mongoose module
const mongoose = {
  connect: jest.fn().mockResolvedValue({
    connections: [{ readyState: 1 }],
  }),
  connection: {
    close: jest.fn().mockResolvedValue(true),
    on: jest.fn(),
    readyState: 1,
  },
  connections: [{ readyState: 1 }],
  Schema: jest.fn().mockImplementation((definition, options) => new MockSchema(definition, options)),
  model: jest.fn().mockImplementation((name, schema) => createMockModel(name, schema)),
  Types: {
    ObjectId: class ObjectId {
      constructor(id?: string) {
        this.id = id || 'mock-object-id';
      }
      toString() {
        return this.id;
      }
    },
  },
};

// Export the mock mongoose
export default mongoose;