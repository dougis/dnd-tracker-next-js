/**
 * Migration: Create initial user collections and indexes
 * Version: 001
 * Created: 2025-01-12T00:00:00.000Z
 */

module.exports = {
  version: '001',
  description: 'Create initial user collections and indexes',

  /**
   * Apply migration
   * @param {import('mongodb').Db} db
   */
  up: async function(db) {
    // Create users collection with indexes
    var usersCollection = db.collection('users');
    
    // Create unique indexes for email and username
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    
    // Create index for faster lookups
    await usersCollection.createIndex({ createdAt: 1 });
    await usersCollection.createIndex({ updatedAt: 1 });
    
    // Create accounts collection for NextAuth
    var accountsCollection = db.collection('accounts');
    await accountsCollection.createIndex({ provider: 1, providerAccountId: 1 }, { unique: true });
    await accountsCollection.createIndex({ userId: 1 });
    
    // Create sessions collection for NextAuth
    var sessionsCollection = db.collection('sessions');
    await sessionsCollection.createIndex({ sessionToken: 1 }, { unique: true });
    await sessionsCollection.createIndex({ userId: 1 });
    await sessionsCollection.createIndex({ expires: 1 });
    
    // Create verification tokens collection for NextAuth
    var verificationTokensCollection = db.collection('verification_tokens');
    await verificationTokensCollection.createIndex({ identifier: 1, token: 1 }, { unique: true });
    await verificationTokensCollection.createIndex({ expires: 1 });
  },

  /**
   * Rollback migration
   * @param {import('mongodb').Db} db
   */
  down: async function(db) {
    // Drop indexes from users collection
    var usersCollection = db.collection('users');
    await usersCollection.dropIndex({ email: 1 });
    await usersCollection.dropIndex({ username: 1 });
    await usersCollection.dropIndex({ createdAt: 1 });
    await usersCollection.dropIndex({ updatedAt: 1 });
    
    // Drop indexes from accounts collection
    var accountsCollection = db.collection('accounts');
    await accountsCollection.dropIndex({ provider: 1, providerAccountId: 1 });
    await accountsCollection.dropIndex({ userId: 1 });
    
    // Drop indexes from sessions collection
    var sessionsCollection = db.collection('sessions');
    await sessionsCollection.dropIndex({ sessionToken: 1 });
    await sessionsCollection.dropIndex({ userId: 1 });
    await sessionsCollection.dropIndex({ expires: 1 });
    
    // Drop indexes from verification tokens collection
    var verificationTokensCollection = db.collection('verification_tokens');
    await verificationTokensCollection.dropIndex({ identifier: 1, token: 1 });
    await verificationTokensCollection.dropIndex({ expires: 1 });
  }
};