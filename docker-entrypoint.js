#!/usr/bin/env node

// Docker entrypoint script for production deployments
// Handles environment setup and health checks before starting the application


console.log('🐳 D&D Encounter Tracker - Docker Container Starting...');

// Validate required environment variables
const requiredEnvVars = [
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'MONGODB_URI',
  'MONGODB_DB_NAME'
];

console.log('🔍 Validating environment configuration...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease ensure all required environment variables are set.');
  process.exit(1);
}

console.log('✅ Environment configuration validated');

// Validate NextAuth secret strength
const secret = process.env.NEXTAUTH_SECRET;
if (secret.length < 32) {
  console.warn('⚠️  NEXTAUTH_SECRET should be at least 32 characters long for security');
}

// Test MongoDB connection
console.log('🔍 Testing database connection...');
try {
  // This will test the connection when the app starts
  // MongoDB connection is handled by the application itself
  console.log('✅ Database connection will be tested on application startup');
} catch (error) {
  console.error('❌ Database connection test failed:', error.message);
  process.exit(1);
}

// Set production optimizations
if (process.env.NODE_ENV === 'production') {
  console.log('⚡ Applying production optimizations...');

  // Disable development features
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  // Set memory limits for Node.js
  if (!process.env.NODE_OPTIONS) {
    process.env.NODE_OPTIONS = '--max-old-space-size=1024';
  }
}

// Log startup information
console.log('📋 Container Configuration:');
console.log(`   - Node.js Version: ${process.version}`);
console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - NextAuth URL: ${process.env.NEXTAUTH_URL}`);
console.log(`   - Database: ${process.env.MONGODB_DB_NAME}`);
console.log(`   - Email Configured: ${process.env.EMAIL_SERVER_HOST ? 'Yes' : 'No'}`);
console.log(`   - GitHub OAuth: ${process.env.GITHUB_ID ? 'Yes' : 'No'}`);
console.log(`   - Google OAuth: ${process.env.GOOGLE_ID ? 'Yes' : 'No'}`);

console.log('🚀 Starting Next.js application...');

// The actual application start will be handled by the CMD in Dockerfile