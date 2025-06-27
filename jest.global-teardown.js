/**
 * Global teardown for Jest tests
 * 
 * This file runs once after all tests and is responsible for cleaning up
 * global test dependencies like MongoDB.
 */

// Using CommonJS require syntax for Jest compatibility
const { teardownTestMongoDB } = require('./src/lib/__tests__/mongodb-setup');

module.exports = async () => {
  console.log('=== JEST GLOBAL TEARDOWN ===');
  
  // Cleanup MongoDB after tests
  await teardownTestMongoDB();
  
  console.log('=== JEST GLOBAL TEARDOWN COMPLETE ===');
};