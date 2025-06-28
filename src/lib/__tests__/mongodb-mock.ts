/**
 * MongoDB mocking module for tests
 *
 * This module provides mock implementations of MongoDB methods to allow
 * tests to run without an actual database connection.
 *
 * This is used by tests that need to mock MongoDB operations but don't need
 * a real database connection. For tests that need a real database connection,
 * use the mongodb-setup module instead.
 */
// @ts-nocheck

import { jest } from '@jest/globals';

// Mock query object that can be chained
class MockQuery {
  private results: any[] = [];

  private errorToThrow: Error | null = null;

  mockResolvedValue(value: any) {
    this.results = Array.isArray(value) ? value : [value];
    return this;
  }

  mockRejectedValue(error: Error) {
    this.errorToThrow = error;
    return this;
  }

  find(_query?: any) {
    return this;
  }

  findOne(_query?: any) {
    return this;
  }

  findById(_id?: any) {
    return this;
  }

  sort(_sortOptions?: any) {
    return this;
  }

  limit(_limitValue?: number) {
    return this;
  }

  skip(_skipValue?: number) {
    return this;
  }

  select(_fields?: any) {
    return this;
  }

  populate(_path?: any) {
    return this;
  }

  lean() {
    return this;
  }

  exec() {
    if (this.errorToThrow) {
      return Promise.reject(this.errorToThrow);
    }
    return Promise.resolve(
      this.results.length === 1 ? this.results[0] : this.results
    );
  }

  then(onFulfilled?: any, onRejected?: any) {
    return this.exec().then(onFulfilled, onRejected);
  }

  catch(onRejected?: any) {
    return this.exec().catch(onRejected);
  }
}

// Mock schema class
class MockSchema {
  methods: Record<string, any> = {};

  statics: Record<string, any> = {};

  constructor(_definition: any, _options?: any) {
    // Schema constructor logic would go here
  }

  pre(_method: string, _fn: Function) {
    return this;
  }

  post(_method: string, _fn: Function) {
    return this;
  }

  virtual(_name: string) {
    return {
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
    };
  }

  method(name: string, fn: Function) {
    this.methods[name] = fn;
    return this;
  }

  static(name: string, fn: Function) {
    this.statics[name] = fn;
    return this;
  }

  set(_key: string, _value: any) {
    return this;
  }

  index(_fields: any, _options?: any) {
    return this;
  }

  plugin(_fn: Function, _opts?: any) {
    return this;
  }

  add(_obj: any, _prefix?: string) {
    return this;
  }
}

// Mock model factory
function createMockModel(name: string) {
  const model = function (data?: any) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data) as jest.Mock,
      remove: jest.fn().mockResolvedValue(data) as jest.Mock,
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }) as jest.Mock,
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }) as jest.Mock,
      toObject: jest.fn().mockReturnValue(data),
      toJSON: jest.fn().mockReturnValue(data),
      set: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnValue(undefined),
      validate: jest.fn().mockResolvedValue(true) as jest.Mock,
      validateSync: jest.fn().mockReturnValue(null),
      isNew: false,
      isModified: jest.fn().mockReturnValue(false),
      markModified: jest.fn(),
    };
  };

  // Add static methods to the model
  model.find = jest.fn().mockImplementation(() => new MockQuery());
  model.findOne = jest.fn().mockImplementation(() => new MockQuery());
  model.findById = jest.fn().mockImplementation(() => new MockQuery());
  model.create = jest.fn().mockImplementation(data => Promise.resolve(data));
  model.updateOne = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ modifiedCount: 1 }));
  model.updateMany = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ modifiedCount: 2 }));
  model.deleteOne = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ deletedCount: 1 }));
  model.deleteMany = jest
    .fn()
    .mockImplementation(() => Promise.resolve({ deletedCount: 2 }));
  model.countDocuments = jest.fn().mockImplementation(() => Promise.resolve(0));
  model.aggregate = jest.fn().mockImplementation(() => new MockQuery());
  model.distinct = jest.fn().mockImplementation(() => Promise.resolve([]));
  model.findOneAndUpdate = jest.fn().mockImplementation(() => new MockQuery());
  model.findOneAndDelete = jest.fn().mockImplementation(() => new MockQuery());
  model.findByIdAndUpdate = jest.fn().mockImplementation(() => new MockQuery());
  model.findByIdAndDelete = jest.fn().mockImplementation(() => new MockQuery());
  model.insertMany = jest
    .fn()
    .mockImplementation(docs => Promise.resolve(docs));
  model.bulkWrite = jest
    .fn()
    .mockImplementation(() =>
      Promise.resolve({ insertedCount: 0, modifiedCount: 0, deletedCount: 0 })
    );
  model.watch = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    close: jest.fn(),
  }));

  // Model metadata
  model.modelName = name;
  model.collection = {
    name: name.toLowerCase(),
    collectionName: name.toLowerCase(),
    drop: jest.fn().mockResolvedValue(true) as jest.Mock,
    createIndex: jest.fn().mockResolvedValue(true) as jest.Mock,
    dropIndex: jest.fn().mockResolvedValue(true) as jest.Mock,
    indexes: jest.fn().mockResolvedValue([]) as jest.Mock,
  };

  model.schema = new MockSchema({});

  return model;
}

// Main mongoose mock object
const mongoose = {
  connect: jest.fn().mockResolvedValue({
    connection: { readyState: 1 },
    connections: [{ readyState: 1 }],
  }) as jest.Mock,
  disconnect: jest.fn().mockResolvedValue(undefined) as jest.Mock,
  connection: {
    readyState: 1,
    close: jest.fn().mockResolvedValue(undefined) as jest.Mock,
    on: jest.fn(),
    once: jest.fn(),
    off: jest.fn(),
    removeAllListeners: jest.fn(),
    db: {
      dropDatabase: jest.fn().mockResolvedValue(true) as jest.Mock,
    },
  },
  connections: [{ readyState: 1 }],
  Schema: MockSchema,
  model: jest.fn().mockImplementation(createMockModel) as jest.Mock,
  models: {},
  Types: {
    ObjectId: jest.fn().mockImplementation((id?: string) => ({
      toString: () => id || '507f1f77bcf86cd799439011',
      toHexString: () => id || '507f1f77bcf86cd799439011',
      equals: jest.fn().mockReturnValue(true),
    })),
  },
  isValidObjectId: jest.fn().mockReturnValue(true),
  startSession: jest.fn().mockResolvedValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined) as jest.Mock,
    abortTransaction: jest.fn().mockResolvedValue(undefined) as jest.Mock,
    endSession: jest.fn().mockResolvedValue(undefined) as jest.Mock,
    withTransaction: jest
      .fn()
      .mockImplementation(async (fn: any) => await fn()) as jest.Mock,
  }) as jest.Mock,
};

// Export the mock mongoose
export default mongoose;
