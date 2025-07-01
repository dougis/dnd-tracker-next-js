// Mock BSON for Jest tests
const ObjectId = class {
  constructor(id) {
    this._id = id || '64d9c3e8f1b2c3d4e5f6g7h8';
  }

  toString() {
    return this._id;
  }

  toHexString() {
    return this._id;
  }
};

module.exports = {
  ObjectId,
  BSON: {},
  BSONError: Error,
  BSONType: {},
  Binary: class {},
  Code: class {},
  DBRef: class {},
  Decimal128: class {},
  Double: class {},
  Int32: class {},
  Long: class {},
  MaxKey: class {},
  MinKey: class {},
  Timestamp: class {},
  UUID: class {},
};
