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
/**
 * Safety check function that throws clear errors if MongoDB environment variables are missing
 */
export function validateMongoDBEnvironment() {

    if (!process.env.MONGODB_URI) {

        throw new Error(
            '🚨 MONGODB_URI environment variable is not defined! Tests cannot run without database connection.'
        );

    }
    if (!process.env.MONGODB_DB_NAME) {

        throw new Error(
            '🚨 MONGODB_DB_NAME environment variable is not defined! Tests cannot run without database name.'
        );

    }

    console.log('✅ MongoDB environment variables validated');

}

export async function setupTestMongoDB() {

    // Check for the Codacy coverage environment (GitHub CI) with MongoDB service container
    // Note: GitHub Actions sets CI=true (not 'true' string)
    if (
        (process.env.CI === 'true' || process.env.CI === true) &&
    process.env.MONGODB_URI
    ) {

        // In CI with MongoDB service container
        console.log(`Using CI MongoDB at ${process.env.MONGODB_URI}`);

        // Ensure MONGODB_DB_NAME is set
        if (!process.env.MONGODB_DB_NAME) {

            process.env.MONGODB_DB_NAME = 'testdb';
            console.log(
                `Set default MONGODB_DB_NAME in CI: ${process.env.MONGODB_DB_NAME}`
            );

        }

    } else {

        // Local development - use in-memory MongoDB
        console.log('Starting in-memory MongoDB server for tests');
        mongoServer = await MongoMemoryServer.create();
        process.env.MONGODB_URI = mongoServer.getUri();
        process.env.MONGODB_DB_NAME = 'testdb';
        console.log(`Started in-memory MongoDB at ${process.env.MONGODB_URI}`);

    }

    // Validate environment variables
    validateMongoDBEnvironment();

    return {
        uri: process.env.MONGODB_URI,
        dbName: process.env.MONGODB_DB_NAME,
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
        dbName: process.env.MONGODB_DB_NAME,
    };

}
