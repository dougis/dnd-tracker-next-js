/**
 * MongoDB setup for tests
 * 
 * This module provides consistent MongoDB configuration for tests,
 * handling both real MongoDB connections and mocked ones depending on the environment.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';

// Store MongoDB Memory Server instance globally for reuse
let mongoServer: MongoMemoryServer;

/**
 * Setup MongoDB for tests - either using a real connection or in-memory server
 */
export async function setupTestMongoDB() {
  if (!process.env.MONGODB_URI) {
    // If no MongoDB URI is provided, start an in-memory MongoDB server
    console.log('Starting in-memory MongoDB server for tests');
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.MONGODB_DB_NAME = 'testdb';
    console.log(`Started in-memory MongoDB at ${process.env.MONGODB_URI}`);
  } else {
    console.log(`Using existing MongoDB at ${process.env.MONGODB_URI}`);
  }
  
  return {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME
  };
}

/**
 * Teardown MongoDB after tests
 */
export async function teardownTestMongoDB() {
  if (mongoServer) {
    await mongoServer.stop();
    console.log('Stopped in-memory MongoDB server');
  }
}

/**
 * Get the current MongoDB connection details
 */
export function getMongoDBConfig() {
  return {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME
  };
}