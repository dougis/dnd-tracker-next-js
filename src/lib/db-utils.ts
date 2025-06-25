import { connectToDatabase, getConnectionStatus } from './db';

/**
 * Database utility functions for health checks and connection management
 */

export interface DatabaseHealthCheck {
  status: 'healthy' | 'unhealthy' | 'connecting';
  connected: boolean;
  timestamp: string;
  error?: string;
  latency?: number;
}

/**
 * Performs a comprehensive health check of the database connection
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthCheck> {
  const timestamp = new Date().toISOString();

  try {
    const startTime = Date.now();

    // Check if already connected
    const isConnected = getConnectionStatus();

    if (!isConnected) {
      // Attempt to connect if not already connected
      await connectToDatabase();
    }

    const latency = Date.now() - startTime;

    return {
      status: 'healthy',
      connected: true,
      timestamp,
      latency,
    };
  } catch (error) {
    console.error('Database health check failed:', error);

    return {
      status: 'unhealthy',
      connected: false,
      timestamp,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Ensures database connection is established before proceeding
 * Useful middleware function for API routes
 */
export async function ensureDatabaseConnection(): Promise<void> {
  if (!getConnectionStatus()) {
    await connectToDatabase();
  }
}

/**
 * Graceful database disconnection with error handling
 */
export async function gracefulDisconnect(): Promise<boolean> {
  try {
    const { disconnectFromDatabase } = await import('./db');
    await disconnectFromDatabase();
    return true;
  } catch (error) {
    console.error('Error during graceful database disconnect:', error);
    return false;
  }
}

/**
 * Database connection retry utility with exponential backoff
 */
export async function connectWithRetry(
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await connectToDatabase();
      console.log(`Database connected successfully on attempt ${attempt}`);
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt === maxRetries) {
        throw new Error(
          `Failed to connect to database after ${maxRetries} attempts. Last error: ${lastError.message}`
        );
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(
        `Database connection attempt ${attempt} failed. Retrying in ${delay}ms...`,
        error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Validates required environment variables for database connection
 */
export function validateDatabaseConfig(): {
  isValid: boolean;
  missingVars: string[];
} {
  const requiredVars = ['MONGODB_URI', 'MONGODB_DB_NAME'];
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}
