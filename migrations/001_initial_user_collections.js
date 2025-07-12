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
   * @param db - The MongoDB database instance
   */
  up: function(db) {
    var Promise = require('bluebird') || global.Promise;
    
    return new Promise(function(resolve, reject) {
      // Create users collection with indexes
      var usersCollection = db.collection('users');
      
      var userIndexPromises = [
        // Create unique indexes for email and username
        usersCollection.createIndex({ email: 1 }, { unique: true }),
        usersCollection.createIndex({ username: 1 }, { unique: true }),
        
        // Create index for faster data access
        usersCollection.createIndex({ createdAt: 1 }),
        usersCollection.createIndex({ updatedAt: 1 })
      ];
      
      Promise.all(userIndexPromises).then(function() {
        // Create accounts collection for NextAuth
        var accountsCollection = db.collection('accounts');
        var accountIndexPromises = [
          accountsCollection.createIndex({ provider: 1, providerAccountId: 1 }, { unique: true }),
          accountsCollection.createIndex({ userId: 1 })
        ];
        return Promise.all(accountIndexPromises);
      }).then(function() {
        // Create sessions collection for NextAuth
        var sessionsCollection = db.collection('sessions');
        var sessionIndexPromises = [
          sessionsCollection.createIndex({ sessionToken: 1 }, { unique: true }),
          sessionsCollection.createIndex({ userId: 1 }),
          sessionsCollection.createIndex({ expires: 1 })
        ];
        return Promise.all(sessionIndexPromises);
      }).then(function() {
        // Create verification tokens collection for NextAuth
        var verificationTokensCollection = db.collection('verification_tokens');
        var tokenIndexPromises = [
          verificationTokensCollection.createIndex({ identifier: 1, token: 1 }, { unique: true }),
          verificationTokensCollection.createIndex({ expires: 1 })
        ];
        return Promise.all(tokenIndexPromises);
      }).then(function() {
        resolve();
        return true;
      }).catch(function(error) {
        reject(error);
      });
    });
  },

  /**
   * Rollback migration
   * @param db - The MongoDB database instance
   */
  down: function(db) {
    var Promise = require('bluebird') || global.Promise;
    
    return new Promise(function(resolve, reject) {
      // Drop indexes from users collection
      var usersCollection = db.collection('users');
      
      var userDropPromises = [
        usersCollection.dropIndex({ email: 1 }),
        usersCollection.dropIndex({ username: 1 }),
        usersCollection.dropIndex({ createdAt: 1 }),
        usersCollection.dropIndex({ updatedAt: 1 })
      ];
      
      Promise.all(userDropPromises).then(function() {
        // Drop indexes from accounts collection
        var accountsCollection = db.collection('accounts');
        var accountDropPromises = [
          accountsCollection.dropIndex({ provider: 1, providerAccountId: 1 }),
          accountsCollection.dropIndex({ userId: 1 })
        ];
        return Promise.all(accountDropPromises);
      }).then(function() {
        // Drop indexes from sessions collection
        var sessionsCollection = db.collection('sessions');
        var sessionDropPromises = [
          sessionsCollection.dropIndex({ sessionToken: 1 }),
          sessionsCollection.dropIndex({ userId: 1 }),
          sessionsCollection.dropIndex({ expires: 1 })
        ];
        return Promise.all(sessionDropPromises);
      }).then(function() {
        // Drop indexes from verification tokens collection
        var verificationTokensCollection = db.collection('verification_tokens');
        var tokenDropPromises = [
          verificationTokensCollection.dropIndex({ identifier: 1, token: 1 }),
          verificationTokensCollection.dropIndex({ expires: 1 })
        ];
        return Promise.all(tokenDropPromises);
      }).then(function() {
        resolve();
        return true;
      }).catch(function(error) {
        reject(error);
      });
    });
  }
};