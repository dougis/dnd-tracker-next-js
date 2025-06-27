/**
 * Global setup for Jest tests
 * 
 * This file runs once before all tests and is responsible for setting up
 * global test dependencies like MongoDB.
 */

// Using CommonJS require syntax for Jest compatibility
const { setupTestMongoDB } = require('./src/lib/__tests__/mongodb-setup');

module.exports = async () => {
  console.log('=== JEST GLOBAL SETUP ===');
  
  // Setup MongoDB for tests
  global.__MONGO_URI__ = process.env.MONGODB_URI;
  global.__MONGO_DB_NAME__ = process.env.MONGODB_DB_NAME;

  // If environment variables aren't set, use the setup function
  if (!global.__MONGO_URI__) {
    const { uri, dbName } = await setupTestMongoDB();
    global.__MONGO_URI__ = uri;
    global.__MONGO_DB_NAME__ = dbName;
  }

  console.log(`MongoDB configured: ${global.__MONGO_URI__}, DB: ${global.__MONGO_DB_NAME__}`);
  console.log('=== JEST GLOBAL SETUP COMPLETE ===');
};