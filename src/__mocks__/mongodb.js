module.exports = {
    MongoClient: jest.fn(() => ({
        connect: jest.fn(),
        close: jest.fn(),
        db: jest.fn(),
    })),
};
