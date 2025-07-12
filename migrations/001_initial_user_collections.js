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
   * @param {import('mongodb').Db} db - The MongoDB database instance
   */
  up: function(db) {
    return new Promise(function(resolve, reject) {
      // Create users collection with indexes
      var usersCollection = db.collection('users');
      
      Promise.all([
        // Create unique indexes for email and username
        usersCollection.createIndex({ email: 1 }, { unique: true }),
        usersCollection.createIndex({ username: 1 }, { unique: true }),
        
        // Create index for faster data lookups
        usersCollection.createIndex({ createdAt: 1 }),
        usersCollection.createIndex({ updatedAt: 1 }),
      ]).then(function() {
        // Create accounts collection for NextAuth
        var accountsCollection = db.collection('accounts');
        return Promise.all([
          accountsCollection.createIndex({ provider: 1, providerAccountId: 1 }, { unique: true }),
          accountsCollection.createIndex({ userId: 1 }),
        ]);
      }).then(function() {
        // Create sessions collection for NextAuth
        var sessionsCollection = db.collection('sessions');
        return Promise.all([
          sessionsCollection.createIndex({ sessionToken: 1 }, { unique: true }),
          sessionsCollection.createIndex({ userId: 1 }),
          sessionsCollection.createIndex({ expires: 1 }),
        ]);
      }).then(function() {
        // Create verification tokens collection for NextAuth
        var verificationTokensCollection = db.collection('verification_tokens');
        return Promise.all([
          verificationTokensCollection.createIndex({ identifier: 1, token: 1 }, { unique: true }),
          verificationTokensCollection.createIndex({ expires: 1 }),
        ]);
      }).then(function() {
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  },

  /**
   * Rollback migration
   * @param {import('mongodb').Db} db - The MongoDB database instance
   */
  down: function(db) {
    return new Promise(function(resolve, reject) {
      // Drop indexes from users collection
      var usersCollection = db.collection('users');
      
      Promise.all([
        usersCollection.dropIndex({ email: 1 }),
        usersCollection.dropIndex({ username: 1 }),
        usersCollection.dropIndex({ createdAt: 1 }),
        usersCollection.dropIndex({ updatedAt: 1 }),
      ]).then(function() {
        // Drop indexes from accounts collection
        var accountsCollection = db.collection('accounts');
        return Promise.all([
          accountsCollection.dropIndex({ provider: 1, providerAccountId: 1 }),
          accountsCollection.dropIndex({ userId: 1 }),
        ]);
      }).then(function() {
        // Drop indexes from sessions collection
        var sessionsCollection = db.collection('sessions');
        return Promise.all([
          sessionsCollection.dropIndex({ sessionToken: 1 }),
          sessionsCollection.dropIndex({ userId: 1 }),
          sessionsCollection.dropIndex({ expires: 1 }),
        ]);
      }).then(function() {
        // Drop indexes from verification tokens collection
        var verificationTokensCollection = db.collection('verification_tokens');
        return Promise.all([
          verificationTokensCollection.dropIndex({ identifier: 1, token: 1 }),
          verificationTokensCollection.dropIndex({ expires: 1 }),
        ]);
      }).then(function() {
        resolve();
      }).catch(function(error) {
        reject(error);
      });
    });
  }
};