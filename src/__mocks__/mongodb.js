// Mock MongoDB for Jest tests
const { ObjectId } = require('./bson');

module.exports = {
  ObjectId,
  MongoClient: jest.fn(() => ({
    connect: jest.fn(),
    close: jest.fn(),
    db: jest.fn(),
  })),
  Db: class {},
  Collection: class {},
  NumberUtils: {
    parse: jest.fn(),
    validate: jest.fn(),
  },
  BSON: require('./bson'),
};
